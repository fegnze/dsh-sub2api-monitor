export const number = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
const text = v => typeof v === 'string' ? v.slice(0, 200) : null;
export function usageView(raw) {
  return ['five_hour', 'seven_day', 'seven_day_sonnet', 'seven_day_opus'].flatMap(key => {
    const w = raw?.[key];
    return w && typeof w === 'object' ? [{ key, utilization: number(w.utilization), resetsAt: text(w.resets_at) }] : [];
  });
}
export function statsView(raw) {
  return { requests: number(raw?.requests), tokens: number(raw?.tokens), cost: number(raw?.cost) };
}
export function validateConfig(c) {
  const url = new URL(c.baseUrl);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('配置地址无效');
  if (url.protocol === 'http:' && c.allowInsecureHttp !== true) throw new Error('HTTP 需要明确启用 allowInsecureHttp');
  if (typeof c.apiKey !== 'string' || !c.apiKey.trim()) throw new Error('缺少管理员密钥');
  const seconds = c.intervalSeconds ?? 60;
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) throw new Error('刷新间隔无效');
  return { ...c, baseUrl: url.href.replace(/\/$/, ''), intervalMs: Math.max(30000, Math.min(3600000, seconds * 1000)) };
}
export function createMonitor({ config, fetcher = fetch, now = Date.now }) {
  let snapshot = { accounts: [], updatedAt: null, error: null, refreshing: false }, pending, disposed = false;
  const lifetime = new AbortController();
  async function request(c, path) {
    const r = await fetcher(c.baseUrl + path, { headers: { 'x-api-key': c.apiKey }, redirect: 'error', signal: AbortSignal.any([lifetime.signal, AbortSignal.timeout(20000)]) });
    if (!r.ok) throw new Error(`接口 HTTP ${r.status}`);
    const j = await r.json();
    if (j.code !== 0 || !j.data) throw new Error('接口返回格式不兼容');
    return j.data;
  }
  async function collect() {
    snapshot = { ...snapshot, refreshing: true };
    try {
      const c = validateConfig(await config());
      const accounts = [];
      for (let page = 1; page <= 100; page++) {
        const d = await request(c, `/admin/accounts?page=${page}&page_size=100&lite=true`);
        if (!Array.isArray(d.items) || !Number.isInteger(d.pages) || d.pages > 100) throw new Error('账号分页格式不兼容');
        for (const a of d.items) {
          if (!Number.isSafeInteger(a.id) || a.id <= 0) throw new Error('账号 ID 无效');
          // Never forward credentials, extra, notes or raw upstream errors.
          accounts.push({ id: a.id, name: text(a.name), platform: text(a.platform), type: text(a.type), status: text(a.status), schedulable: a.schedulable === true, rateLimitResetAt: text(a.rate_limit_reset_at) });
        }
        if (page >= d.pages) break;
      }
      let index = 0;
      await Promise.all(Array.from({ length: Math.min(3, accounts.length) }, async () => {
        while (index < accounts.length) {
          const a = accounts[index++];
          const [usage, stats] = await Promise.allSettled([
            request(c, `/admin/accounts/${a.id}/usage`),
            request(c, `/admin/accounts/${a.id}/today-stats?timezone=Asia%2FShanghai`)
          ]);
          a.windows = usage.status === 'fulfilled' ? usageView(usage.value) : [];
          a.sourceUpdatedAt = usage.status === 'fulfilled' ? text(usage.value.updated_at) : null;
          a.usageError = usage.status !== 'fulfilled';
          a.stats = stats.status === 'fulfilled' ? statsView(stats.value) : statsView(null);
          a.statsError = stats.status !== 'fulfilled';
        }
      }));
      if (!disposed) snapshot = { accounts, updatedAt: now(), error: null, refreshing: false, intervalMs: c.intervalMs, insecure: c.baseUrl.startsWith('http:'), site: new URL(c.baseUrl).origin };
    } catch { if (!disposed) snapshot = { ...snapshot, refreshing: false, error: '读取失败：请检查本机配置、密钥及网络；保留上次成功数据。' }; }
    return snapshot;
  }
  return {
    snapshot: () => ({ ...snapshot, stale: !snapshot.updatedAt || !!snapshot.error || now() - snapshot.updatedAt > (snapshot.intervalMs || 60000) * 2 }),
    refresh() { if (disposed) return Promise.resolve(snapshot); return pending ||= collect().finally(() => { pending = null; }); },
    dispose() { disposed = true; lifetime.abort(); }
  };
}
