import { createDetails } from './details.mjs';
import { presentSnapshot } from './presentation.mjs';
import { createMonitor } from './monitor.mjs';
import { monitorConfig } from './config.mjs';
export { Config } from './config.mjs';
import { createSettingsHandler } from './settings.mjs';
export const inject = ['webServer', 'settings', 'credentials'];
export function trusted(req) {
  const remote = req.socket?.remoteAddress;
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote)) return false;
  try {
    const host = new URL(`http://${req.headers.host}`);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(host.hostname)) return false;
    if (req.headers.origin && new URL(req.headers.origin).host !== host.host) return false;
    if (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') return false;
    return req.headers['x-sub2api-monitor'] === '1';
  } catch { return false; }
}
export function apply(ctx, config = {}) {
  ctx.effect(() => {
    const monitor = createMonitor({ config: () => monitorConfig(ctx.credentials, config) });
    let timer, stopped = false, lastManual = 0;
    const tick = async () => {
      await monitor.refresh();
      if (!stopped) timer = setTimeout(tick, monitor.snapshot().intervalMs || 60000);
    };
    const dispose = ctx.webServer.register({ kind: 'exact', path: '/sub2api-monitor/api', handler: async (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (!trusted(req)) { res.statusCode = 403; res.end('{"error":"forbidden"}'); return; }
      if (!['GET', 'POST'].includes(req.method)) { res.statusCode = 405; res.end('{}'); return; }
      if (req.method === 'POST') {
        if (Date.now() - lastManual < 10000) { res.statusCode = 429; res.end('{"error":"请稍后刷新"}'); return; }
        lastManual = Date.now();
        await monitor.refresh();
      }
      res.end(JSON.stringify(presentSnapshot(monitor.snapshot(), config)));
    } });
    const disposeCandidates = ctx.webServer.register({ kind: 'exact', path: '/sub2api-monitor/accounts', handler: async (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      if (!trusted(req)) { res.statusCode = 403; res.end('{}'); return; }
      if (!['GET', 'POST'].includes(req.method)) { res.statusCode = 405; res.end('{}'); return; }
      if (req.method === 'POST') {
        if (Date.now() - lastManual < 10000) { res.statusCode = 429; res.end('{"error":"请稍后刷新"}'); return; }
        lastManual = Date.now();
        await monitor.refresh();
      }
      const snapshot = monitor.snapshot();
      res.end(JSON.stringify({ accounts: snapshot.accounts.map(a => ({ id: a.id, name: a.name, platform: a.platform, status: a.status, schedulable: a.schedulable })), stale: snapshot.stale, error: snapshot.error }));
    } });
    const details = createDetails({ config: () => monitorConfig(ctx.credentials, config), accounts: () => monitor.snapshot().accounts });
    const disposeDetails = ctx.webServer.register({ kind: 'exact', path: '/sub2api-monitor/details', handler: async (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
      if (!trusted(req)) { res.statusCode = 403; res.end('{}'); return; }
      if (req.method !== 'POST') { res.statusCode = 405; res.end('{}'); return; }
      try {
        let body = ''; for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 1024) { res.statusCode = 413; res.end('{}'); return; } }
        res.end(JSON.stringify(await details.get(JSON.parse(body).id)));
      } catch { res.statusCode = 502; res.end('{"error":"统计加载失败，请稍后重试"}'); }
    } });
    const disposePolicy = ctx.settings.configure({ auto: false });
    const disposeSettings = ctx.webServer.register({ kind: 'exact', path: '/sub2api-monitor/settings', handler: createSettingsHandler(ctx, trusted) });
    void tick();
    return () => { stopped = true; clearTimeout(timer); monitor.dispose(); details.dispose(); disposeDetails(); dispose(); disposeCandidates(); disposeSettings(); disposePolicy(); };
  });
}
