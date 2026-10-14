import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createSettingsHandler } from '../src/settings.mjs';
import { trusted } from '../src/host.mjs';
function harness(hasKey = true) {
  const writes = [];
  const handler = createSettingsHandler({ settings: { describe: () => [{ ns: 'dsh-sub2api-monitor', revision: 4, value: { baseUrl: 'https://example.test/api/v1', adminApiKey: 'NEVER-EXPOSE', intervalSeconds: 60 }, secrets: [{ path: ['adminApiKey'], set: hasKey }] }], update: async (...args) => writes.push(args) } }, trusted);
  return { writes, call: async (method, input, headers = {}) => {
    const req = Readable.from(input === undefined ? [] : [JSON.stringify(input)]); req.method = method; req.socket = { remoteAddress: '127.0.0.1' }; req.headers = { host: 'localhost:19387', 'x-sub2api-monitor': '1', ...headers };
    let body; const res = { statusCode: 200, setHeader() {}, end: s => { body = JSON.parse(s); } }; await handler(req, res); return { status: res.statusCode, body };
  } };
}
test('first save requires key and rejects oversized input and invalid interval', async () => {
  const h = harness(false);
  assert.equal((await h.call('POST', input)).status, 400);
  assert.equal((await h.call('POST', { ...input, adminApiKey: 'x'.repeat(17000) })).status, 413);
  assert.equal((await h.call('POST', { ...input, adminApiKey: 'test', intervalSeconds: 1 })).status, 400);
  assert.equal(h.writes.length, 0);
  assert.equal((await h.call('POST', { ...input, adminApiKey: 'test' })).status, 200);
});
const input = { revision: 4, baseUrl: 'https://example.test/api/v1', intervalSeconds: 60, allowInsecureHttp: false };
test('configuration read projects only public fields and key presence', async () => { const r = await harness().call('GET'); assert.equal(r.body.hasKey, true); assert.equal(JSON.stringify(r).includes('NEVER-EXPOSE'), false); });
test('save preserves existing secret and fences concurrent edits', async () => { const h = harness(); assert.equal((await h.call('POST', input)).status, 200); assert.equal('adminApiKey' in h.writes[0][1], false); assert.equal(h.writes[0][2], 4); assert.equal((await h.call('POST', { ...input, revision: 3 })).status, 409); assert.equal(h.writes.length, 1); });
test('save rotates key without returning it; blocks cross-origin and unsafe HTTP', async () => { const h = harness(); const r = await h.call('POST', { ...input, adminApiKey: 'NEW-KEY' }); assert.equal(h.writes[0][1].adminApiKey, 'NEW-KEY'); assert.equal(JSON.stringify(r).includes('NEW-KEY'), false); assert.equal((await h.call('POST', input, { origin: 'https://evil.test' })).status, 403); assert.equal((await h.call('POST', { ...input, baseUrl: 'http://example.test' })).status, 400); });
