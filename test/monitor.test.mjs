import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMonitor, usageView, statsView, validateConfig } from '../src/monitor.mjs';
import { trusted } from '../src/host.mjs';
const config = async () => ({ baseUrl: 'https://example.test/api/v1', apiKey: 'secret' });
const reply = data => ({ ok: true, json: async () => ({ code: 0, data }) });
test('unknown values never become zero', () => {
  assert.deepEqual(statsView({ tokens: null }), { tokens: null, requests: null, cost: null });
  assert.equal(usageView({ five_hour: { utilization: '0' } })[0].utilization, null);
  assert.equal(usageView({ five_hour: { utilization: 0 } })[0].utilization, 0);
});
test('HTTP requires opt-in and URL credentials are rejected', () => {
  assert.throws(() => validateConfig({ baseUrl: 'http://host', apiKey: 'secret' }));
  assert.throws(() => validateConfig({ baseUrl: 'https://user:secret@host', apiKey: 'secret' }));
  assert.equal(validateConfig({ baseUrl: 'http://host', apiKey: 'secret', allowInsecureHttp: true }).intervalMs, 60000);
});
test('trust gate rejects remote, cross-site and missing custom header', () => {
  const req = { socket: { remoteAddress: '127.0.0.1' }, headers: { host: '127.0.0.1:19387', 'x-sub2api-monitor': '1' } };
  assert.equal(trusted(req), true);
  assert.equal(trusted({ ...req, socket: { remoteAddress: '10.1.1.1' } }), false);
  assert.equal(trusted({ ...req, headers: { ...req.headers, origin: 'https://evil.test' } }), false);
  assert.equal(trusted({ ...req, headers: { ...req.headers, host: 'evil.test' } }), false);
  assert.equal(trusted({ ...req, headers: { host: 'localhost' } }), false);
});
test('pagination, whitelist, single flight and partial failure', async () => {
  let calls = 0;
  const m = createMonitor({ config, fetcher: async (url, options) => {
    calls++;
    assert.equal(options.redirect, 'error'); assert.equal(options.headers['x-api-key'], 'secret');
    if (url.includes('/accounts?')) return reply({ pages: 2, items: [{ id: url.includes('page=1&') ? 1 : 2, name: 'account', credentials: { token: 'SENSITIVE' }, extra: { key: 'SENSITIVE' }, schedulable: true }] });
    if (url.includes('/2/usage')) throw new Error('SENSITIVE');
    if (url.includes('/usage')) return reply({ five_hour: { utilization: 30 }, secret: 'SENSITIVE' });
    return reply({ requests: 2, tokens: 10, cost: 0.1, secret: 'SENSITIVE' });
  }});
  const a = m.refresh(), b = m.refresh(); assert.equal(a, b); await a;
  assert.equal(calls, 6); assert.equal(m.snapshot().accounts.length, 2);
  assert.equal(m.snapshot().accounts[1].usageError, true);
  assert.equal(JSON.stringify(m.snapshot()).includes('SENSITIVE'), false);
  m.dispose();
});
test('failure retains previous successful data and marks stale', async () => {
  let fail = false, now = 1000;
  const m = createMonitor({ config, now: () => now, fetcher: async url => { if (fail) throw new Error('secret'); return reply(url.includes('/accounts?') ? { pages: 1, items: [{ id: 1 }] } : {}); } });
  await m.refresh(); assert.equal(m.snapshot().stale, false);
  now = 200000; assert.equal(m.snapshot().stale, true);
  fail = true; await m.refresh(); assert.equal(m.snapshot().accounts.length, 1); assert.equal(m.snapshot().stale, true);
  assert.equal(JSON.stringify(m.snapshot()).includes('secret'), false); m.dispose();
});
test('Anthropic uses passive source to retain weekly quota', async () => {
  const m = createMonitor({ config, fetcher: async url => {
    if (url.includes('/accounts?')) return reply({ pages: 1, items: [{ id: 1, platform: 'anthropic' }] });
    if (url.includes('/usage')) { assert.ok(url.endsWith('?source=passive')); return reply({ five_hour: { utilization: 4 }, seven_day: { utilization: 70 } }); }
    return reply({});
  }});
  await m.refresh(); assert.equal(m.snapshot().accounts[0].windows[1].utilization, 70); m.dispose();
});
test('disposal aborts in-flight requests', async () => {
  let signal;
  const m = createMonitor({ config, fetcher: async (_, options) => { signal = options.signal; return new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))); } });
  const p = m.refresh(); await new Promise(resolve => setImmediate(resolve)); m.dispose(); await p;
  assert.equal(signal.aborted, true);
});
