window.__ModuleLoader__.load({ id: 'myspace-sub2api-monitor', factory: require => {
  const React = require('react'), h = React.createElement;
  const ID = 'sub2api-monitor';
  const labels = { five_hour: '5 小时', seven_day: '7 天', seven_day_sonnet: 'Sonnet 7 天', seven_day_opus: 'Opus 7 天' };
  const time = v => v && Number.isFinite(new Date(v).getTime()) ? new Date(v).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '未知';
  const num = v => v == null ? '未知' : v.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  const css = `.s2m{color:var(--dsw-alias-label-primary);font:inherit}.s2m-page{padding:28px;overflow:auto;height:100%;box-sizing:border-box}.s2m h2{font-size:24px;margin:0}.s2m p,.s2m small{color:var(--dsw-alias-label-secondary)}.s2m-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}.s2m button,.s2m input{padding:8px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit}.s2m button{cursor:pointer}.s2m button:disabled{opacity:.5}.s2m-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}.s2m-card{border:1px solid var(--dsw-alias-border-l2);border-radius:14px;padding:18px;background:var(--dsw-alias-bg-layer-1)}.s2m-card h3{font-size:15px;overflow-wrap:anywhere;margin:0 0 6px}.s2m-window{margin-top:16px}.s2m-row{display:flex;justify-content:space-between;gap:12px}.s2m progress{width:100%;height:8px;accent-color:var(--dsw-alias-brand-primary)}.s2m .warn{color:var(--dsw-alias-state-warn-primary)}.s2m .danger{color:var(--dsw-alias-state-error-primary)}.s2m-stats{display:flex;gap:18px;margin-top:20px;flex-wrap:wrap;font-size:12px}.s2m-stats b{display:block;font-size:16px;margin-top:5px}.s2m-mini{font-size:12px;white-space:nowrap;padding:4px 8px!important}.s2m-dialog{position:fixed;right:24px;top:72px;z-index:1000;max-height:80vh;width:min(780px,90vw);overflow:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;box-shadow:var(--dsw-shadow-lv3);padding:24px}`;
  function apply(ctx) {
    let data = { accounts: [], stale: true }, stopped = false, timer, controller;
    const listeners = new Set();
    const emit = () => listeners.forEach(fn => fn());
    const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn); };
    const useData = () => React.useSyncExternalStore(subscribe, () => data);
    let pending;
    function load(manual = false) {
      if (pending) return pending;
      controller = new AbortController();
      pending = (async () => {
        try {
          const r = await fetch('/sub2api-monitor/api', { method: manual ? 'POST' : 'GET', headers: { 'X-Sub2api-Monitor': '1' }, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(90000)]) });
          if (!r.ok) throw new Error();
          const next = await r.json();
          if (!stopped) data = next;
        } catch { if (!stopped) data = { ...data, stale: true, error: '监控连接失败，请检查插件是否已加载。' }; }
        finally { pending = null; if (!stopped) emit(); }
      })();
      return pending;
    }
    function Card({ a }) {
      return h('article', { className: 's2m-card' },
        h('h3', null, a.name || `账号 ${a.id}`),
        h('small', null, `${a.platform} · ${a.type} · ${a.status}${a.schedulable ? '' : ' · 不可调度'}`),
        a.rateLimitResetAt && new Date(a.rateLimitResetAt).getTime() > Date.now() ? h('p', { className: 'warn' }, `限流至 ${time(a.rateLimitResetAt)}`) : null,
        a.usageError ? h('p', { className: 'danger' }, '额度获取失败') : !a.windows?.length ? h('p', null, '暂无额度数据') : a.windows.map(w => h('div', { className: 's2m-window', key: w.key },
          h('div', { className: 's2m-row' }, h('span', null, labels[w.key] || w.key), h('strong', { className: w.utilization >= 95 ? 'danger' : w.utilization >= 80 ? 'warn' : '' }, w.utilization == null ? '未知' : `${num(w.utilization)}% 已用`)),
          w.utilization == null ? null : h('progress', { max: 100, value: Math.min(100, w.utilization), 'aria-label': `${labels[w.key]}已用百分比` }),
          h('small', null, `重置：${time(w.resetsAt)}`))),
        h('div', { className: 's2m-stats' }, ...[['今日请求', a.stats?.requests], ['今日 Token', a.stats?.tokens], ['今日费用 $', a.stats?.cost]].map(([label, v]) => h('div', { key: label }, label, h('b', null, num(v))))),
        a.statsError ? h('p', { className: 'warn' }, '今日统计获取失败') : null,
        a.sourceUpdatedAt ? h('p', null, h('small', null, `上游快照：${time(a.sourceUpdatedAt)}`)) : null);
    }
    function Panel({ popup = false, close }) {
      const d = useData(), [search, setSearch] = React.useState(''), [busy, setBusy] = React.useState(false);
      const accounts = d.accounts.filter(a => `${a.name} ${a.platform}`.toLowerCase().includes(search.toLowerCase()));
      return h('section', { className: `s2m ${popup ? 's2m-dialog' : 's2m-page'}`, role: popup ? 'dialog' : undefined, 'aria-label': '账号用量' },
        h('div', { className: 's2m-toolbar' }, h('h2', null, '账号用量'), h('button', { disabled: busy || d.refreshing, onClick: async () => { setBusy(true); await load(true); setBusy(false); } }, busy || d.refreshing ? '刷新中…' : '刷新'), popup ? h('button', { onClick: close, 'aria-label': '关闭账号用量' }, '关闭') : null),
        h('p', { className: d.stale ? 'warn' : '' }, `${d.accounts.length} 个账号 · ${d.stale ? '数据过期 / 等待同步' : '已同步'} · 最近采集 ${time(d.updatedAt)} · ${Math.round((d.intervalMs || 60000) / 1000)} 秒刷新`),
        h('p', null, '额度来自上游快照；今日统计按上海时区。未知额度不代表可用，费用为代理统计口径。'),
        d.insecure ? h('p', { className: 'warn' }, 'HTTP 明文连接已启用；管理员密钥仅由本机 Host 使用。') : null,
        d.error ? h('p', { role: 'alert', className: 'danger' }, d.error) : null,
        h('div', { className: 's2m-toolbar' }, h('input', { value: search, onChange: e => setSearch(e.target.value), placeholder: '搜索账号或平台', 'aria-label': '搜索账号' })),
        h('div', { className: 's2m-grid' }, ...accounts.map(a => h(Card, { key: a.id, a }))),
        !accounts.length ? h('p', null, d.updatedAt ? '没有匹配的账号' : '等待首次采集；请确认本机配置已填写。') : null);
    }
    function Summary() {
      const d = useData(), [open, setOpen] = React.useState(false);
      const alerts = d.accounts.filter(a => a.usageError || a.status !== 'active' || !a.schedulable || a.windows?.some(w => w.utilization >= 80)).length;
      React.useEffect(() => { if (!open) return; const key = e => { if (e.key === 'Escape') setOpen(false); }; document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key); }, [open]);
      return h('div', { className: 's2m' }, h('button', { className: `s2m-mini ${d.stale || alerts ? 'warn' : ''}`, onClick: () => setOpen(!open), 'aria-expanded': open }, `用量 ${d.accounts.length} · ${d.stale ? '离线/过期' : alerts ? `${alerts} 待关注` : '正常'}`), open ? h(Panel, { popup: true, close: () => setOpen(false) }) : null);
    }
    ctx.effect(() => {
      const style = document.createElement('style'); style.dataset.plugin = 'myspace-sub2api-monitor'; style.textContent = css; document.head.appendChild(style);
      void load(); timer = setInterval(() => { void load(); }, 10000);
      return () => { stopped = true; clearInterval(timer); controller?.abort(); style.remove(); listeners.clear(); };
    });
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: ID, label: '账号用量', order: 15 }, ({ size }) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 }, h('path', { d: 'M4 19V9m8 10V4m8 15v-7M2 21h20' }))));
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: ID }, Panel));
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: ID, label: '账号用量', order: 30 }, Summary));
  }
  return { inject: ['slots'], apply };
} });
