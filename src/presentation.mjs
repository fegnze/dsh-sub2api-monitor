export function presentationConfig(raw = {}) {
  const v = typeof raw.get === 'function' ? raw.get() : raw;
  const names = v.primaryAccounts ?? [];
  const displayFilter = v.displayFilter ?? 'all', sortBy = v.sortBy ?? 'available', primaryFirst = v.primaryFirst ?? true;
  if (!Array.isArray(names) || names.length > 100 || names.some(n => typeof n !== 'string' || !n.trim() || n.length > 200)) throw new Error('Invalid primary accounts');
  if (!['all', 'primary', 'available', 'attention'].includes(displayFilter) || !['available', 'name', 'usage-desc', 'usage-asc'].includes(sortBy) || typeof primaryFirst !== 'boolean') throw new Error('Invalid display options');
  return { primaryAccounts: [...new Set(names.map(n => n.trim()))], displayFilter, sortBy, primaryFirst };
}
export function presentSnapshot(snapshot, raw) {
  const preferences = presentationConfig(raw), primary = new Set(preferences.primaryAccounts);
  const available = a => a.status === 'active' && a.schedulable === true;
  const usage = a => { const values = (a.windows || []).map(w => w.utilization).filter(v => typeof v === 'number' && Number.isFinite(v)); return values.length ? Math.max(...values) : null; };
  const attention = a => !available(a) || a.usageError || a.statsError || (usage(a) ?? 0) >= 80;
  const marked = snapshot.accounts.map(a => ({ ...a, primary: primary.has(a.name) }));
  const accounts = marked.filter(a => preferences.displayFilter === 'all' || (preferences.displayFilter === 'primary' ? a.primary : preferences.displayFilter === 'available' ? available(a) : attention(a)));
  accounts.sort((a, b) => {
    if (preferences.primaryFirst && a.primary !== b.primary) return Number(b.primary) - Number(a.primary);
    if (preferences.sortBy === 'name') return (a.name || '').localeCompare(b.name || '', 'zh-CN') || a.id - b.id;
    if (preferences.sortBy.startsWith('usage-')) {
      const av = usage(a), bv = usage(b);
      if (av === null || bv === null) return av === bv ? 0 : av === null ? 1 : -1;
      return preferences.sortBy === 'usage-desc' ? bv - av : av - bv;
    }
    return Number(available(b)) - Number(available(a));
  });
  return { ...snapshot, accounts, totalAccounts: marked.length, preferences };
}
