window.__ModuleLoader__.load({ id: 'myspace-sub2api-monitor', factory: require => {
  const React = require('react'), h = React.createElement;
  const ID = 'sub2api-monitor';
  const labels = { five_hour: '5 小时', seven_day: '7 天', seven_day_sonnet: 'Sonnet 7 天', seven_day_opus: 'Opus 7 天' };
  const time = v => v && Number.isFinite(new Date(v).getTime()) ? new Date(v).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '未知';
  const num = v => v == null ? '未知' : v.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  const css = `.s2m{color:var(--dsw-alias-label-primary);font:inherit}.s2m-page{padding:28px;overflow:auto;height:100%;box-sizing:border-box}.s2m h2{font-size:24px;margin:0}.s2m p,.s2m small{color:var(--dsw-alias-label-secondary)}.s2m-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}.s2m button,.s2m input{padding:8px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit}.s2m button{cursor:pointer}.s2m button:disabled{opacity:.5}.s2m-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}.s2m-card{border:1px solid var(--dsw-alias-border-l2);border-radius:14px;padding:18px;background:var(--dsw-alias-bg-layer-1)}.s2m-card h3{font-size:15px;overflow-wrap:anywhere;margin:0 0 6px}.s2m-window{margin-top:16px}.s2m-row{display:flex;justify-content:space-between;gap:12px}.s2m progress{width:100%;height:8px;accent-color:var(--dsw-alias-brand-primary)}.s2m .warn{color:var(--dsw-alias-state-warn-primary)}.s2m .danger{color:var(--dsw-alias-state-error-primary)}.s2m-stats{display:flex;gap:18px;margin-top:20px;flex-wrap:wrap;font-size:12px}.s2m-stats b{display:block;font-size:16px;margin-top:5px}.s2m-mini{font-size:12px;white-space:nowrap;padding:4px 8px!important}.s2m-dialog{position:fixed;right:24px;top:72px;z-index:1000;max-height:80vh;width:min(780px,90vw);overflow:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;box-shadow:var(--dsw-shadow-lv3);padding:24px}`;
  const planLabel = value => ({ promax: 'Pro 500', plus: 'Plus', go: 'Go', pro: 'Pro', free: 'Free', team: 'Team', enterprise: 'Enterprise' })[value] || value || '订阅未知';
  const compact = v => v == null ? '—' : Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  const remaining = v => { const ms = new Date(v).getTime() - Date.now(); if (!v || !Number.isFinite(ms)) return '重置时间未知'; if (ms <= 0) return '等待额度更新'; const m = Math.ceil(ms / 60000), hours = Math.floor(m / 60); return hours >= 24 ? `${Math.floor(hours / 24)} 天 ${hours % 24} 小时后重置` : `${hours} 小时 ${m % 60} 分后重置`; };
  const polish = `.s2m-page{display:block!important;padding:24px 28px}.s2m-toolbar{margin-bottom:22px}.s2m h2{font-size:21px;font-weight:650;letter-spacing:-.5px}.s2m-toolbar h2{margin-right:auto}.s2m-grid{align-items:start;align-content:start;grid-auto-rows:max-content;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:14px}.s2m-card{height:auto!important;min-height:0!important;align-self:start;padding:20px;border-radius:16px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 2px 8px #00000008}.s2m-card h3{font-size:15px;letter-spacing:-.2px;margin:0}.s2m-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}.s2m-avatar{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary);font-size:14px;font-weight:700;flex:none}.s2m-meta{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary)}.s2m-status{margin-left:auto;color:var(--dsw-alias-state-success-primary)}.s2m-window{margin-top:22px}.s2m-row{align-items:baseline;font-size:12px}.s2m-row strong{font-size:22px;font-variant-numeric:tabular-nums;letter-spacing:-.6px}.s2m-row strong em{font-size:11px;font-weight:400;font-style:normal;color:var(--dsw-alias-label-tertiary);margin-left:4px}.s2m-track{height:6px;border-radius:5px;background:var(--dsw-alias-bg-layer-3);overflow:hidden;margin:9px 0 7px}.s2m-fill{height:100%;border-radius:5px;background:var(--dsw-alias-brand-primary);transition:width .4s}.s2m-window small{font-size:11px}.s2m-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:15px;margin-top:20px;color:var(--dsw-alias-label-tertiary);font-size:10px}.s2m-stats b{color:var(--dsw-alias-label-primary);font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}.s2m button{font-size:12px}.s2m-fresh{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-success-primary)}.s2m-fresh.stale{background:var(--dsw-alias-state-warn-primary)}`;
  const popupCss = `.s2m.s2m-dialog{box-sizing:border-box;width:min(620px,calc(100vw - 32px));max-height:min(680px,calc(100dvh - 100px));padding:16px;right:20px;top:66px;border-radius:14px}.s2m-dialog .s2m-toolbar{margin-bottom:12px;gap:8px}.s2m-dialog h2{font-size:16px}.s2m-dialog button{padding:5px 9px;font-size:11px}.s2m-dialog .s2m-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.s2m-dialog .s2m-card{padding:13px;border-radius:10px}.s2m-dialog .s2m-head{gap:7px;margin-bottom:5px}.s2m-dialog .s2m-avatar{width:24px;height:24px;font-size:12px;border-radius:6px}.s2m-dialog .s2m-card h3{font-size:12px}.s2m-dialog .s2m-meta{font-size:10px;gap:5px}.s2m-dialog .s2m-plan{font-size:10px;padding:2px 5px}.s2m-dialog .s2m-window{margin-top:12px}.s2m-dialog .s2m-row{font-size:11px}.s2m-dialog .s2m-row strong{font-size:18px}.s2m-dialog .s2m-row strong em{font-size:10px}.s2m-dialog .s2m-track{height:5px;margin:5px 0}.s2m-dialog .s2m-window small{font-size:10px}.s2m-dialog .s2m-stats{margin-top:12px;padding-top:10px;gap:6px;font-size:9px}.s2m-dialog .s2m-stats b{font-size:13px;margin-top:3px}.s2m-dialog .s2m-card p{font-size:11px;margin:7px 0}@media(max-width:520px){.s2m.s2m-dialog{right:12px;width:calc(100vw - 24px)}.s2m-dialog .s2m-grid{grid-template-columns:1fr}}`;
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
        h('div', { className: 's2m-head' }, h('span', { className: 's2m-avatar' }, a.platform === 'anthropic' ? 'A' : 'O'), h('h3', null, a.name || `账号 ${a.id}`)),
        h('div', { className: 's2m-meta' }, h('span', null, a.platform === 'anthropic' ? 'Anthropic' : 'OpenAI'), h('span', { title: `认证方式：${a.type || '未知'}` }, a.type), h('span', { className: 's2m-plan', title: `订阅类型：${a.subscriptionType || '未返回'}` }, planLabel(a.subscriptionType)), h('span', { className: `s2m-status ${a.status !== 'active' || !a.schedulable ? 'warn' : ''}` }, a.status === 'active' && a.schedulable ? '● 正常' : '● 不可用')),
        a.rateLimitResetAt && new Date(a.rateLimitResetAt).getTime() > Date.now() ? h('p', { className: 'warn' }, `限流至 ${time(a.rateLimitResetAt)}`) : null,
        a.usageError ? h('p', { className: 'danger' }, '额度获取失败') : !a.windows?.length ? h('p', null, '暂无额度数据') : a.windows.map(w => h('div', { className: 's2m-window', key: w.key },
          h('div', { className: 's2m-row' }, h('span', null, labels[w.key] || w.key), h('strong', { className: w.utilization >= 95 ? 'danger' : w.utilization >= 80 ? 'warn' : '' }, w.utilization == null ? '未知' : `${num(w.utilization)}%`, h('em', null, '已用'))),
          h('div', { className: 's2m-track', role: 'progressbar', 'aria-label': `${labels[w.key]}已用百分比`, 'aria-valuenow': w.utilization ?? undefined, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('div', { className: 's2m-fill', style: { width: `${Math.min(100, w.utilization ?? 0)}%`, background: w.utilization >= 95 ? 'var(--dsw-alias-state-error-primary)' : w.utilization >= 80 ? 'var(--dsw-alias-state-warn-primary)' : undefined } })),
          h('small', { title: `重置：${time(w.resetsAt)} · 上游采样：${time(a.sourceUpdatedAt)}` }, remaining(w.resetsAt)))),
        h('div', { className: 's2m-stats' }, ...[['今日请求', a.stats?.requests], ['今日 Token', a.stats?.tokens], ['今日费用', a.stats?.cost]].map(([label, v]) => h('div', { key: label, title: num(v) }, label, h('b', null, label === '今日费用' ? (v == null ? '—' : `$${num(v)}`) : compact(v))))),
        a.statsError ? h('p', { className: 'warn' }, '今日统计获取失败') : null);
    }
    function Panel({ popup = false, footer = false, modal = false, close }) {
      const d = useData(), [busy, setBusy] = React.useState(false);
      const available = a => a.status === 'active' && a.schedulable === true;
      const accounts = [...d.accounts].sort((a, b) => Number(available(b)) - Number(available(a)));
      return h('section', { className: `s2m ${popup ? 's2m-dialog' : 's2m-page'}${footer ? ' s2m-footer-dialog' : ''}`, role: popup ? 'dialog' : undefined, 'aria-label': '账号用量' },
        h('div', { className: 's2m-toolbar' }, h('h2', null, '账号用量'), h('span', { className: `s2m-fresh ${d.stale ? 'stale' : ''}`, title: `${d.stale ? '数据过期' : '已同步'} · ${time(d.updatedAt)}`, 'aria-label': d.stale ? '数据过期' : '已同步' }), h('button', { disabled: busy || d.refreshing, onClick: async () => { setBusy(true); await load(true); setBusy(false); } }, busy || d.refreshing ? '刷新中…' : '刷新'), popup || modal ? h('button', { onClick: close, 'aria-label': '关闭账号用量' }, '关闭') : null),
        d.error ? h('p', { role: 'alert', className: 'danger' }, d.error) : null,
        h('div', { className: 's2m-grid' }, ...accounts.map(a => h(Card, { key: a.id, a }))),
        !accounts.length ? h('p', null, d.updatedAt ? '没有匹配的账号' : '等待首次采集；请确认本机配置已填写。') : null);
    }
    function Summary() {
      const root = React.useRef(null);
      const d = useData(), [open, setOpen] = React.useState(false);
      const alerts = d.accounts.filter(a => a.usageError || a.status !== 'active' || !a.schedulable || a.windows?.some(w => w.utilization >= 80)).length;
      React.useEffect(() => {
        if (!open) return;
        const key = e => { if (e.key === 'Escape') setOpen(false); };
        const outside = e => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
        document.addEventListener('keydown', key);
        document.addEventListener('pointerdown', outside, true);
        return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside, true); };
      }, [open]);
      const label = `用量 ${d.accounts.length} · ${d.stale ? '离线/过期' : alerts ? `${alerts} 待关注` : '正常'}`;
      return h('div', { className: 's2m', ref: root }, h('button', { className: `s2m-mini ${d.stale || alerts ? 'warn' : ''}`, title: label, 'aria-label': label, onClick: () => setOpen(!open), 'aria-expanded': open }, label), open ? h(Panel, { popup: true, close: () => setOpen(false) }) : null);
    }
    ctx.effect(() => {
      const style = document.createElement('style'); style.dataset.plugin = 'myspace-sub2api-monitor'; style.textContent = css + polish + '.s2m-meta{flex-wrap:wrap}.s2m-plan{padding:3px 7px;border-radius:5px;font-size:11px;font-weight:600;color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);white-space:nowrap}' + popupCss + '.s2m.s2m-dialog{width:min(700px,calc(100vw - 32px));max-height:min(760px,calc(100dvh - 90px));padding:18px}.s2m-dialog .s2m-card{padding:16px}.s2m-dialog .s2m-card h3{font-size:14px}.s2m-dialog .s2m-meta,.s2m-dialog .s2m-window small{font-size:11px}.s2m-dialog .s2m-row{font-size:12px}.s2m-dialog .s2m-row strong{font-size:20px}.s2m-dialog .s2m-stats{font-size:10px}.s2m-dialog .s2m-stats b{font-size:15px}'; document.head.appendChild(style);
      void load(); timer = setInterval(() => { void load(); }, 10000);
      return () => { stopped = true; clearInterval(timer); controller?.abort(); style.remove(); listeners.clear(); };
    });
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: ID, label: '账号用量', order: -30 }, Summary));
  }
  return { inject: ['slots'], apply };
} });
