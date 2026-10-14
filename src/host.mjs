import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createMonitor } from './monitor.mjs';
export const inject = ['webServer'];
export const configPath = () => process.env.SUB2API_MONITOR_CONFIG || join(homedir(), '.config', 'dsh-sub2api-monitor', 'config.json');
export const readConfig = async () => JSON.parse(await readFile(configPath(), 'utf8'));
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
export function apply(ctx) {
  ctx.effect(() => {
    const monitor = createMonitor({ config: readConfig });
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
      res.end(JSON.stringify(monitor.snapshot()));
    } });
    void tick();
    return () => { stopped = true; clearTimeout(timer); monitor.dispose(); dispose(); };
  });
}
