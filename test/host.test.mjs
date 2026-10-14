import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply } from '../src/host.mjs';

test('Host uses explicit plugin settings and never forwards admin key', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  let handler, cleanup, disposed = false;
  globalThis.fetch = async (url, options) => {
    requests.push({ url, key: options.headers['x-api-key'] });
    return { ok: true, json: async () => ({ code: 0, data: { pages: 1, items: [] } }) };
  };
  try {
    apply({ effect: fn => { cleanup = fn(); }, webServer: { register: route => { handler = route.handler; return () => { disposed = true; }; } } }, { baseUrl: 'https://configured.example/api/v1', adminApiKey: 'host-only-test-secret', intervalSeconds: 60 });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(requests[0].url.startsWith('https://configured.example/api/v1/'), true);
    assert.equal(requests[0].key, 'host-only-test-secret');
    let body;
    await handler({ method: 'GET', socket: { remoteAddress: '127.0.0.1' }, headers: { host: 'localhost:19387', 'x-sub2api-monitor': '1' } }, { setHeader() {}, end: value => { body = value; } });
    assert.equal(body.includes('host-only-test-secret'), false);
    assert.equal(JSON.parse(body).error, null);
  } finally { cleanup?.(); globalThis.fetch = originalFetch; }
  assert.equal(disposed, true);
});
