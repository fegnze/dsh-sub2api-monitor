window.__ModuleLoader__.load({ id: 'dsh-sub2api-monitor', factory: require => {
  const React = require('react'), h = React.createElement;
  const ID = 'dsh-sub2api-monitor';
  const labels = { five_hour: '5 小时', seven_day: '7 天', seven_day_sonnet: 'Sonnet 7 天', seven_day_opus: 'Opus 7 天' };
  const time = v => v && Number.isFinite(new Date(v).getTime()) ? new Date(v).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '未知';
  const num = v => v == null ? '未知' : v.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  const css = `.s2m{color:var(--dsw-alias-label-primary);font:inherit}.s2m-page{padding:28px;overflow:auto;height:100%;box-sizing:border-box}.s2m h2{font-size:24px;margin:0}.s2m p,.s2m small{color:var(--dsw-alias-label-secondary)}.s2m-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}.s2m button,.s2m input{padding:8px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit}.s2m button{cursor:pointer}.s2m button:disabled{opacity:.5}.s2m-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}.s2m-card{border:1px solid var(--dsw-alias-border-l2);border-radius:14px;padding:18px;background:var(--dsw-alias-bg-layer-1)}.s2m-card h3{font-size:15px;overflow-wrap:anywhere;margin:0 0 6px}.s2m-window{margin-top:16px}.s2m-row{display:flex;justify-content:space-between;gap:12px}.s2m progress{width:100%;height:8px;accent-color:var(--dsw-alias-brand-primary)}.s2m .warn{color:var(--dsw-alias-state-warn-primary)}.s2m .danger{color:var(--dsw-alias-state-error-primary)}.s2m-stats{display:flex;gap:18px;margin-top:20px;flex-wrap:wrap;font-size:12px}.s2m-stats b{display:block;font-size:16px;margin-top:5px}.s2m-mini{font-size:12px;white-space:nowrap;padding:4px 8px!important}.s2m-dialog{position:fixed;right:24px;top:72px;z-index:1000;max-height:80vh;width:min(780px,90vw);overflow:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;box-shadow:var(--dsw-shadow-lv3);padding:24px}`;
  const planLabel = value => ({ promax: 'Pro 500', plus: 'Plus', go: 'Go', pro: 'Pro', free: 'Free', team: 'Team', enterprise: 'Enterprise' })[value] || value || '订阅未知';
  const compact = v => v == null ? '—' : Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  const remaining = v => { const ms = new Date(v).getTime() - Date.now(); if (!v || !Number.isFinite(ms)) return '重置时间未知'; if (ms <= 0) return '等待额度更新'; const m = Math.ceil(ms / 60000), hours = Math.floor(m / 60); return hours >= 24 ? `${Math.floor(hours / 24)} 天 ${hours % 24} 小时后重置` : `${hours} 小时 ${m % 60} 分后重置`; };
  const polish = `.s2m-page{display:block!important;padding:24px 28px}.s2m-toolbar{margin-bottom:22px}.s2m h2{font-size:21px;font-weight:650;letter-spacing:-.5px}.s2m-toolbar h2{margin-right:auto}.s2m-grid{align-items:start;align-content:start;grid-auto-rows:max-content;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:14px}.s2m-card{height:auto!important;min-height:0!important;align-self:start;padding:20px;border-radius:16px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 2px 8px #00000008}.s2m-card h3{font-size:15px;letter-spacing:-.2px;margin:0}.s2m-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}.s2m-avatar{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary);font-size:14px;font-weight:700;flex:none}.s2m-meta{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary)}.s2m-status{margin-left:auto;color:var(--dsw-alias-state-success-primary)}.s2m-window{margin-top:22px}.s2m-row{align-items:baseline;font-size:12px}.s2m-row strong{font-size:22px;font-variant-numeric:tabular-nums;letter-spacing:-.6px}.s2m-row strong em{font-size:11px;font-weight:400;font-style:normal;color:var(--dsw-alias-label-tertiary);margin-left:4px}.s2m-track{height:6px;border-radius:5px;background:var(--dsw-alias-bg-layer-3);overflow:hidden;margin:9px 0 7px}.s2m-fill{height:100%;border-radius:5px;background:var(--dsw-alias-brand-primary);transition:width .4s}.s2m-window small{font-size:11px}.s2m-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:15px;margin-top:20px;color:var(--dsw-alias-label-tertiary);font-size:10px}.s2m-stats b{color:var(--dsw-alias-label-primary);font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}.s2m button{font-size:12px}.s2m-fresh{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-success-primary)}.s2m-fresh.stale{background:var(--dsw-alias-state-warn-primary)}`;
  const popupCss = `.s2m.s2m-dialog{box-sizing:border-box;width:min(620px,calc(100vw - 32px));max-height:min(680px,calc(100dvh - 100px));padding:16px;right:20px;top:66px;border-radius:14px}.s2m-dialog .s2m-toolbar{margin-bottom:12px;gap:8px}.s2m-dialog h2{font-size:16px}.s2m-dialog button{padding:5px 9px;font-size:11px}.s2m-dialog .s2m-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.s2m-dialog .s2m-card{padding:13px;border-radius:10px}.s2m-dialog .s2m-head{gap:7px;margin-bottom:5px}.s2m-dialog .s2m-avatar{width:24px;height:24px;font-size:12px;border-radius:6px}.s2m-dialog .s2m-card h3{font-size:12px}.s2m-dialog .s2m-meta{font-size:10px;gap:5px}.s2m-dialog .s2m-plan{font-size:10px;padding:2px 5px}.s2m-dialog .s2m-window{margin-top:12px}.s2m-dialog .s2m-row{font-size:11px}.s2m-dialog .s2m-row strong{font-size:18px}.s2m-dialog .s2m-row strong em{font-size:10px}.s2m-dialog .s2m-track{height:5px;margin:5px 0}.s2m-dialog .s2m-window small{font-size:10px}.s2m-dialog .s2m-stats{margin-top:12px;padding-top:10px;gap:6px;font-size:9px}.s2m-dialog .s2m-stats b{font-size:13px;margin-top:3px}.s2m-dialog .s2m-card p{font-size:11px;margin:7px 0}@media(max-width:520px){.s2m.s2m-dialog{right:12px;width:calc(100vw - 24px)}.s2m-dialog .s2m-grid{grid-template-columns:1fr}}`;
  const detailCss = `.s2m.s2m-dialog[popover]{margin:0;left:auto;bottom:auto;opacity:1;filter:none}.s2m.s2m-dialog[popover]::backdrop{background:transparent;pointer-events:none}.s2m.s2m-dialog{background-color:#fff;background-image:linear-gradient(var(--dsw-alias-bg-layer-1,transparent),var(--dsw-alias-bg-layer-1,transparent));box-shadow:0 18px 65px #0003;isolation:isolate}.dark .s2m.s2m-dialog,[data-theme="dark"] .s2m.s2m-dialog{background-color:#182131}.s2m-details{padding-top:8px}.s2m-details h3{font-size:15px;margin:22px 0 12px}.s2m-details>.s2m-toolbar h3{margin:0;font-size:18px}.s2m-details>small{display:block;font-size:10px;line-height:1.6}.s2m-details .s2m-stats{grid-template-columns:repeat(4,minmax(0,1fr));border:0;gap:8px;margin:14px 0;padding:0}.s2m-details .s2m-stats>div{padding:12px;border:1px solid var(--dsw-alias-border-l1,#e4e8ef);border-radius:10px;background:var(--dsw-alias-bg-layer-2,#f5f7fb)}.s2m-details .s2m-stats b{font-size:18px;margin-top:7px}.s2m-chart{border:1px solid var(--dsw-alias-border-l1,#e4e8ef);border-radius:12px;padding:12px 8px 4px;background:var(--dsw-alias-bg-layer-2,#f5f7fb)}.s2m-chart svg{display:block;width:100%;height:auto;overflow:visible}.s2m-chart text{fill:var(--dsw-alias-label-secondary,#64748b);font-size:10px}.s2m-chart circle{cursor:help}.s2m-chart circle:hover{r:5;fill:#2563eb}.s2m-details .s2m-toolbar button[aria-pressed="true"]{opacity:1;background:#2563eb;color:#fff;border-color:#2563eb}.s2m-details>p{font-size:11px}.s2m-details details summary{padding:3px 0;line-height:1.7}@media(max-width:520px){.s2m-details .s2m-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
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
    function Configuration() {
      const [candidates, setCandidates] = React.useState([]), [loadingAccounts, setLoadingAccounts] = React.useState(false), [accountsError, setAccountsError] = React.useState('');
      const accountsAbort = React.useRef(null);
      async function loadAccounts(refresh = false) {
        accountsAbort.current?.abort();
        const controller = new AbortController(); accountsAbort.current = controller;
        setLoadingAccounts(true); setAccountsError('');
        try {
          const response = await fetch('/sub2api-monitor/accounts', { method: refresh ? 'POST' : 'GET', headers: { 'X-Sub2api-Monitor': '1' }, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(90000)]) });
          if (!response.ok) throw new Error(response.status === 429 ? '刷新过于频繁，请稍后重试' : '账号加载失败，请确认插件已重载及连接配置已保存');
          const result = await response.json();
          setCandidates(result.accounts || []);
          if (result.stale) setAccountsError(result.error || '账号列表可能过期，可刷新重试');
        } catch (error) { if (!controller.signal.aborted) setAccountsError(error.message); }
        finally { if (!controller.signal.aborted) setLoadingAccounts(false); }
      }
      React.useEffect(() => { void loadAccounts(); return () => accountsAbort.current?.abort(); }, []);
      const [draft, setDraft] = React.useState(null), [key, setKey] = React.useState(''), [busy, setBusy] = React.useState(false), [message, setMessage] = React.useState('');
      React.useEffect(() => {
        const abort = new AbortController();
        fetch('/sub2api-monitor/settings', { headers: { 'X-Sub2api-Monitor': '1' }, signal: abort.signal }).then(async r => { if (!r.ok) throw new Error(); return r.json(); }).then(setDraft).catch(() => { if (!abort.signal.aborted) setMessage('配置加载失败，请重启 DSH 后重新打开'); });
        return () => abort.abort();
      }, []);
      async function save(e) {
        e.preventDefault(); setBusy(true); setMessage('');
        try {
          const r = await fetch('/sub2api-monitor/settings', { method: 'POST', headers: { 'X-Sub2api-Monitor': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ ...draft, primaryAccounts: (draft.primaryAccounts || []).map(n => n.trim()).filter(Boolean), ...(key ? { adminApiKey: key } : {}) }) });
          const result = await r.json();
          if (!r.ok) { setMessage(result.error || '保存失败'); return; }
          setKey(''); setMessage('已保存。重新打开页面可继续修改；监控将使用新配置。'); setDraft(null);
        } catch { setMessage('保存结果未确认，请重新打开页面检查，勿重复提交'); }
        finally { setBusy(false); }
      }
      return h('form', { className: 's2m s2m-config', onSubmit: save }, h('h3', null, '连接配置'),
        draft ? h('fieldset', { disabled: busy, style: { border: 0, padding: 0, display: 'grid', gap: '14px', maxWidth: '580px' } },
          h('label', null, 'Sub2api API 地址', h('input', { style: { display: 'block', width: '100%', boxSizing: 'border-box' }, type: 'url', required: true, value: draft.baseUrl, placeholder: 'https://example.com/api/v1', onChange: e => setDraft({ ...draft, baseUrl: e.target.value }) })),
          h('label', null, '管理员 API Key', h('input', { style: { display: 'block', width: '100%', boxSizing: 'border-box' }, type: 'password', autoComplete: 'new-password', value: key, disabled: draft.keyWritable === false, placeholder: draft.keyWritable === false ? '由只读来源提供' : draft.hasKey ? '已设置；留空保留原密钥' : '请输入管理员密钥', required: !draft.hasKey && draft.keyWritable !== false, onChange: e => setKey(e.target.value) })),
          h('label', null, h('input', { type: 'checkbox', checked: draft.allowInsecureHttp, onChange: e => setDraft({ ...draft, allowInsecureHttp: e.target.checked }) }), ' 允许明文 HTTP（密钥可能被截获）'),
          h('label', null, '刷新间隔（秒） ', h('input', { type: 'number', min: 30, max: 3600, step: 1, required: true, value: draft.intervalSeconds, onChange: e => setDraft({ ...draft, intervalSeconds: Number(e.target.value) }) })),
          h('h3', null, '账号显示'),
          h('div', { className: 's2m-row' }, h('strong', null, '主账号'), h('button', { type: 'button', disabled: loadingAccounts, onClick: () => loadAccounts(true) }, loadingAccounts ? '加载中…' : '刷新账号列表')),
          accountsError ? h('p', { role: 'status', className: 'warn' }, accountsError) : null,
          h('div', { style: { display: 'grid', gap: '8px', maxHeight: '280px', overflowY: 'auto' } },
            ...[...new Set([...candidates.map(a => a.name).filter(Boolean), ...(draft.primaryAccounts || [])])].map(name => {
              const account = candidates.find(a => a.name === name), checked = (draft.primaryAccounts || []).includes(name);
              return h('label', { key: name, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '8px' } },
                h('input', { type: 'checkbox', checked, onChange: e => setDraft(current => ({ ...current, primaryAccounts: e.target.checked ? [...new Set([...(current.primaryAccounts || []), name])] : (current.primaryAccounts || []).filter(n => n !== name) })) }),
                h('span', { style: { flex: 1, overflowWrap: 'anywhere' } }, name),
                h('small', null, account ? `${account.platform || '未知平台'} · ${account.status === 'active' && account.schedulable ? '可用' : '不可用'}` : '未在当前列表中'));
            }), !candidates.length && !(draft.primaryAccounts || []).length ? h('small', null, loadingAccounts ? '正在加载账号…' : '暂无候选账号，请保存连接配置后刷新') : null),
          h('label', null, h('input', { type: 'checkbox', checked: draft.primaryFirst !== false, onChange: e => setDraft({ ...draft, primaryFirst: e.target.checked }) }), ' 主账号优先'),
          ...[['displayFilter', '显示过滤', [['all', '全部账号'], ['primary', '仅主账号'], ['available', '仅可用账号'], ['attention', '仅需关注']]], ['sortBy', '排序', [['available', '可用优先'], ['name', '名称'], ['usage-desc', '已用比例：高到低'], ['usage-asc', '已用比例：低到高']]]].map(([field, label, options]) => h('label', { key: field }, label, h('select', { value: draft[field] || options[0][0], onChange: e => setDraft({ ...draft, [field]: e.target.value }) }, ...options.map(([value, text]) => h('option', { key: value, value }, text))))),
          h('button', { type: 'submit', disabled: busy }, busy ? '保存中…' : '保存配置')) : null,
        h('p', { role: 'status' }, message || (draft ? '' : '正在读取配置…')));
    }
    ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({ name: 'plugins.bundle.config', key: 'dsh-sub2api-monitor' }, Configuration));
    function Card({ a, onOpen }) {
      return h('article', { className: 's2m-card', role: 'button', tabIndex: 0, 'aria-label': `查看 ${a.name || a.id} 使用统计`, style: { cursor: 'pointer' }, onClick: onOpen, onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(); } } },
        h('div', { className: 's2m-head' }, h('span', { className: 's2m-avatar' }, a.platform === 'anthropic' ? 'A' : 'O'), h('h3', null, a.name || `账号 ${a.id}`)),
        h('div', { className: 's2m-meta' }, a.primary ? h('span', { className: 's2m-plan' }, '主账号') : null, h('span', null, a.platform === 'anthropic' ? 'Anthropic' : 'OpenAI'), h('span', { title: `认证方式：${a.type || '未知'}` }, a.type), h('span', { className: 's2m-plan', title: `订阅类型：${a.subscriptionType || '未返回'}` }, planLabel(a.subscriptionType)), h('span', { className: `s2m-status ${a.status !== 'active' || !a.schedulable ? 'warn' : ''}` }, a.status === 'active' && a.schedulable ? '● 正常' : '● 不可用')),
        a.rateLimitResetAt && new Date(a.rateLimitResetAt).getTime() > Date.now() ? h('p', { className: 'warn' }, `限流至 ${time(a.rateLimitResetAt)}`) : null,
        a.usageError ? h('p', { className: 'danger' }, '额度获取失败') : !a.windows?.length ? h('p', null, '暂无额度数据') : a.windows.map(w => h('div', { className: 's2m-window', key: w.key },
          h('div', { className: 's2m-row' }, h('span', null, labels[w.key] || w.key), h('strong', { className: w.utilization >= 95 ? 'danger' : w.utilization >= 80 ? 'warn' : '' }, w.utilization == null ? '未知' : `${num(w.utilization)}%`, h('em', null, '已用'))),
          h('div', { className: 's2m-track', role: 'progressbar', 'aria-label': `${labels[w.key]}已用百分比`, 'aria-valuenow': w.utilization ?? undefined, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('div', { className: 's2m-fill', style: { width: `${Math.min(100, w.utilization ?? 0)}%`, background: w.utilization >= 95 ? 'var(--dsw-alias-state-error-primary)' : w.utilization >= 80 ? 'var(--dsw-alias-state-warn-primary)' : undefined } })),
          h('div', { className: 's2m-row' },
            h('small', { className: w.utilization >= 95 ? 'danger' : w.utilization >= 80 ? 'warn' : '' }, w.utilization == null ? '剩余未知' : `剩余 ${num(Math.max(0, 100 - w.utilization))}%`),
            h('small', { title: `重置：${time(w.resetsAt)} · 上游采样：${time(a.sourceUpdatedAt)}` }, remaining(w.resetsAt))))),
        h('div', { className: 's2m-stats' }, ...[['今日请求', a.stats?.requests], ['今日 Token', a.stats?.tokens], ['今日费用', a.stats?.cost]].map(([label, v]) => h('div', { key: label, title: num(v) }, label, h('b', null, label === '今日费用' ? (v == null ? '—' : `$${num(v)}`) : compact(v))))),
        a.statsError ? h('p', { className: 'warn' }, '今日统计获取失败') : null);
    }
    function Details({ account, back }) {
      const [stats, setStats] = React.useState(null), [error, setError] = React.useState(''), [attempt, setAttempt] = React.useState(0), [metric, setMetric] = React.useState('requests');
      React.useEffect(() => {
        const abort = new AbortController(); setStats(null); setError('');
        fetch('/sub2api-monitor/details', { method: 'POST', headers: { 'X-Sub2api-Monitor': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ id: account.id }), signal: abort.signal })
          .then(async r => { if (!r.ok) throw Error(); return r.json(); }).then(value => { if (!abort.signal.aborted) setStats(value); })
          .catch(() => { if (!abort.signal.aborted) setError('统计加载失败'); });
        return () => abort.abort();
      }, [account.id, attempt]);
      const money = v => v == null ? '未知' : `$${num(v)}`;
      const value = v => metric === 'actual_cost' ? money(v) : compact(v);
      const history = stats?.history || [], max = Math.max(1, ...history.map(d => d[metric] || 0));
      const recorded = history.filter(d => Number.isFinite(Date.parse(d.date))).sort((a, b) => a.date.localeCompare(b.date));
      const start = Date.parse(recorded[0]?.date), end = Date.parse(recorded.at(-1)?.date), byDate = new Map(recorded.map(d => [d.date, d])), dated = [];
      for (let day = start; day <= end && dated.length < 366; day += 86400000) {
        const date = new Date(day).toISOString().slice(0, 10);
        dated.push(byDate.get(date) || { date, requests: 0, tokens: 0, actual_cost: 0 });
      }
      const points = dated.map(d => ({ ...d, x: 56 + (end === start ? 270 : 540 * (Date.parse(d.date) - start) / (end - start)), y: 178 - 150 * (d[metric] || 0) / max }));
      let previous;
      const line = points.map(d => { const connected = previous && d[metric] != null && previous[metric] != null && Date.parse(d.date) - Date.parse(previous.date) === 86400000; previous = d; return d[metric] == null ? '' : `${connected ? 'L' : 'M'}${d.x},${d.y}`; }).join(' ');
      const summary = stats?.summary;
      return h('div', { className: 's2m-details' },
        h('div', { className: 's2m-toolbar' }, h('button', { type: 'button', onClick: back }, '← 返回账号列表'), h('h3', null, account.name || `账号 ${account.id}`)),
        error ? h('p', { role: 'alert' }, error, ' ', h('button', { onClick: () => setAttempt(v => v + 1) }, '重试')) : !stats ? h('p', { role: 'status' }, '正在加载统计…') : h(React.Fragment, null,
          h('small', null, `统计窗口：${num(summary.days)} 天 · 有记录日期：${history[0]?.date || '未知'} — ${history.at(-1)?.date || '未知'} · 更新：${time(stats.updatedAt)}`),
          h('div', { className: 's2m-stats' }, ...[['周期请求', compact(summary.total_requests)], ['周期 Token', compact(summary.total_tokens)], ['统计费用', money(summary.total_cost)], ['活跃天数', num(summary.actual_days_used)]].map(([label, v]) => h('div', { key: label }, label, h('b', null, v)))),
          h('h3', null, '每日趋势'),
          h('div', { className: 's2m-toolbar' }, ...[['requests', '请求'], ['tokens', 'Token'], ['actual_cost', '账号计费']].map(([key, label]) => h('button', { key, type: 'button', 'aria-pressed': metric === key, disabled: metric === key, onClick: () => setMetric(key) }, label))),
          h('div', { className: 's2m-chart' }, h('svg', { viewBox: '0 0 620 210', role: 'img', 'aria-label': `每日${metric === 'requests' ? '请求' : metric === 'tokens' ? 'Token' : '账号计费'}趋势；日期范围内缺失日期补零` },
            ...[0, 0.25, 0.5, 0.75, 1].map(t => h('g', { key: t }, h('line', { x1: 56, x2: 596, y1: 178 - t * 150, y2: 178 - t * 150, stroke: 'currentColor', opacity: 0.09 }), h('text', { x: 48, y: 182 - t * 150, textAnchor: 'end' }, value(t * max)))),
            h('path', { d: line, fill: 'none', stroke: '#3b82f6', strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }),
            ...points.filter(d => d[metric] != null).map(d => h('circle', { key: d.date, cx: d.x, cy: d.y, r: 3, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1 }, h('title', null, `${d.date} · ${value(d[metric])}`))),
            ...points.filter((d, i) => i === 0 || i === points.length - 1 || (i % Math.max(1, Math.ceil(points.length / 5)) === 0 && i < points.length - 2)).map(d => h('text', { key: d.date, x: d.x, y: 201, textAnchor: 'middle' }, d.date?.slice(5))))),
          !history.length ? h('p', null, '暂无每日记录') : null,
          h('h3', null, '模型排行 · 按 Token'),
          ...[...stats.models].sort((a, b) => (b.total_tokens ?? -1) - (a.total_tokens ?? -1)).map((model, i) => h('details', { key: `${model.model}-${i}`, style: { borderBottom: '1px solid var(--dsw-alias-border-l2)', padding: '10px 0' } },
            h('summary', { style: { cursor: 'pointer', overflowWrap: 'anywhere', fontSize: '12px' } }, `${model.model || '未知模型'} · ${compact(model.requests)} 请求 · ${compact(model.total_tokens)} Token · ${money(model.account_cost)}`),
            h('div', { className: 's2m-stats' }, ...[['输入', model.input_tokens], ['输出', model.output_tokens], ['缓存写入', model.cache_creation_tokens], ['缓存读取', model.cache_read_tokens]].map(([label, v]) => h('div', { key: label }, label, h('b', null, compact(v))))))),
          !stats.models.length ? h('p', null, '暂无模型记录') : null,
          h('h3', null, '使用概况'),
          h('div', { className: 's2m-stats' }, ...[['活跃日日均费用', money(summary.avg_daily_cost)], ['活跃日日均请求', compact(summary.avg_daily_requests)], ['活跃日日均 Token', compact(summary.avg_daily_tokens)], ['平均请求耗时', summary.avg_duration_ms == null ? '未知' : `${num(summary.avg_duration_ms / 1000)} 秒`]].map(([label, v]) => h('div', { key: label }, label, h('b', null, v)))),
          h('p', null, `最高费用日：${summary.highestCostDay?.date || '未知'} · ${money(summary.highestCostDay?.cost)}`),
          h('p', null, `最高请求日：${summary.highestRequestDay?.date || '未知'} · ${compact(summary.highestRequestDay?.requests)} 请求`),
          h('small', null, '仅统计经 sub2api 的调用；费用为站点统计口径，非订阅账单。日均按活跃天数计算，日期范围内缺失日期补零；平均耗时不等于首 Token 延迟。')));
    }
    function Panel({ popup = false, footer = false, modal = false, close }) {
      const d = useData(), [busy, setBusy] = React.useState(false), [selected, setSelected] = React.useState(null);
      const surface = React.useRef(null);
      React.useEffect(() => {
        const element = surface.current;
        if (popup && element?.showPopover) {
          element.showPopover();
          return () => { if (element.matches(':popover-open')) element.hidePopover(); };
        }
      }, [popup]);
      const available = a => a.status === 'active' && a.schedulable === true;
      const accounts = d.preferences ? d.accounts : [...d.accounts].sort((a, b) => Number(available(b)) - Number(available(a)));
      return h('section', { ref: surface, popover: popup ? 'manual' : undefined, className: `s2m ${popup ? 's2m-dialog' : 's2m-page'}${footer ? ' s2m-footer-dialog' : ''}`, role: popup ? 'dialog' : undefined, 'aria-label': '账号用量' },
        h('div', { className: 's2m-toolbar' }, h('h2', null, '账号用量'), d.site && /^https?:\/\//.test(d.site) ? h('a', { href: `${d.site}/admin/accounts`, target: '_blank', rel: 'noopener noreferrer', title: '打开 sub2api 账号管理（需站点登录）', style: { color: 'var(--dsw-alias-brand-primary)', fontSize: '12px', whiteSpace: 'nowrap' } }, 'Sub2api 站点 ↗') : null, h('a', { href: 'https://aihot.news/codex-reset', target: '_blank', rel: 'noopener noreferrer', title: 'AIHOT · 非 OpenAI 官方页面', style: { color: 'var(--dsw-alias-brand-primary)', fontSize: '12px', whiteSpace: 'nowrap' } }, 'Codex 重置参考 ↗'), h('button', { type: 'button', title: '插件信息与配置', 'aria-label': '插件信息与配置', onClick: () => { close?.(); ctx.pluginNavigation.openBundle('dsh-sub2api-monitor'); } }, '配置'), h('span', { className: `s2m-fresh ${d.stale ? 'stale' : ''}`, title: `${d.stale ? '数据过期' : '已同步'} · ${time(d.updatedAt)}`, 'aria-label': d.stale ? '数据过期' : '已同步' }), h('button', { disabled: busy || d.refreshing, onClick: async () => { setBusy(true); await load(true); setBusy(false); } }, busy || d.refreshing ? '刷新中…' : '刷新'), popup || modal ? h('button', { onClick: close, 'aria-label': '关闭账号用量' }, '关闭') : null),
        d.error ? h('p', { role: 'alert', className: 'danger' }, d.error) : null,
        selected?.id ? h(Details, { key: selected.id, account: selected, back: () => setSelected(null) }) : h('div', { className: 's2m-grid' }, ...accounts.map(a => h(Card, { key: a.id, a, onOpen: () => setSelected(a) }))),
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
      const style = document.createElement('style'); style.dataset.plugin = 'sub2api-monitor'; style.textContent = css + polish + '.s2m-meta{flex-wrap:wrap}.s2m-plan{padding:3px 7px;border-radius:5px;font-size:11px;font-weight:600;color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);white-space:nowrap}' + popupCss + '.s2m.s2m-dialog{width:min(700px,calc(100vw - 32px));max-height:min(760px,calc(100dvh - 90px));padding:18px}.s2m-dialog .s2m-card{padding:16px}.s2m-dialog .s2m-card h3{font-size:14px}.s2m-dialog .s2m-meta,.s2m-dialog .s2m-window small{font-size:11px}.s2m-dialog .s2m-row{font-size:12px}.s2m-dialog .s2m-row strong{font-size:20px}.s2m-dialog .s2m-stats{font-size:10px}.s2m-dialog .s2m-stats b{font-size:15px}' + detailCss; document.head.appendChild(style);
      void load(); timer = setInterval(() => { void load(); }, 10000);
      return () => { stopped = true; clearInterval(timer); controller?.abort(); style.remove(); listeners.clear(); };
    });
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: ID, label: '账号用量', order: -30 }, Summary));
  }
  return { inject: ['slots', 'pluginNavigation'], apply };
} });
