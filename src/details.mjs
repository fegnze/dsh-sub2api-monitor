import { validateConfig } from './monitor.mjs';
const number = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
const text = v => typeof v === 'string' ? v.slice(0, 200) : null;
const numeric = (raw, keys) => Object.fromEntries(keys.map(k => [k, number(raw?.[k])]));
const day = raw => raw && typeof raw === 'object' ? { date: text(raw.date), ...numeric(raw, ['cost', 'user_cost', 'requests', 'tokens']) } : null;
export function statsView(raw) {
  if (!raw || !raw.summary || !Array.isArray(raw.history) || !Array.isArray(raw.models)) throw Error('Invalid statistics');
  return {
    summary: { ...numeric(raw.summary, ['days', 'actual_days_used', 'total_cost', 'total_requests', 'total_tokens', 'avg_daily_cost', 'avg_daily_requests', 'avg_daily_tokens', 'avg_duration_ms']), highestCostDay: day(raw.summary.highest_cost_day), highestRequestDay: day(raw.summary.highest_request_day) },
    history: raw.history.slice(0, 366).map(r => ({ date: text(r.date), ...numeric(r, ['requests', 'tokens', 'actual_cost']) })).sort((a, b) => (a.date || '').localeCompare(b.date || '')),
    models: raw.models.slice(0, 200).map(r => ({ model: text(r.model), ...numeric(r, ['requests', 'total_tokens', 'input_tokens', 'output_tokens', 'cache_creation_tokens', 'cache_read_tokens', 'account_cost']) }))
  };
}
export function createDetails({ config, accounts, fetcher = fetch, now = Date.now }) {
  const cache = new Map(), pending = new Map(), abort = new AbortController();
  let disposed = false, generation = '', epoch = 0;
  return {
    async get(id) {
      if (disposed) throw Error('Disposed');
      if (!Number.isSafeInteger(id) || id <= 0 || !accounts().some(a => a.id === id)) throw Error('Unknown account');
      const c = validateConfig(await config()), key = JSON.stringify([c.baseUrl, c.apiKey]);
      if (generation !== key) { generation = key; epoch++; cache.clear(); pending.clear(); }
      const currentEpoch = epoch;
      const hit = cache.get(id);
      if (hit && now() - hit.updatedAt < 60000) return hit;
      if (pending.has(id)) return pending.get(id);
      const job = (async () => {
        const response = await fetcher(`${c.baseUrl}/admin/accounts/${id}/stats?days=30&timezone=Asia%2FShanghai`, { headers: { 'x-api-key': c.apiKey }, redirect: 'error', signal: AbortSignal.any([abort.signal, AbortSignal.timeout(20000)]) });
        if (!response.ok) throw Error('Statistics unavailable');
        const result = await response.json();
        if (result.code !== 0) throw Error('Statistics unavailable');
        const value = { ...statsView(result.data), updatedAt: now() };
        if (!disposed && currentEpoch === epoch) { if (cache.size >= 100) cache.delete(cache.keys().next().value); cache.set(id, value); }
        return value;
      })();
      pending.set(id, job);
      try { return await job; } finally { if (pending.get(id) === job) pending.delete(id); }
    },
    dispose() { disposed = true; abort.abort(); cache.clear(); pending.clear(); }
  };
}
