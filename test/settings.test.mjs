import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createSettingsHandler } from '../src/settings.mjs';
import { trusted } from '../src/host.mjs';
function harness(hasKey = true, writable = true) {
  const writes = [], stored = [];
  const credentials = { describe: async ref => ({ configured: hasKey, writable, source: 'file', ref }), set: async (ref, value) => stored.push([ref, value]) };
  const handler = createSettingsHandler({ credentials, settings: { describe: () => [{ ns: 'dsh-sub2api-monitor', revision: 4, value: { baseUrl: 'https://example.test/api/v1', adminApiKeyEnv: 'SUB2API_ADMIN_API_KEY', intervalSeconds: 60 } }], update: async (...args) => writes.push(args) } }, trusted);
  return { writes, stored, call: async (method, input, headers = {}) => {
    const req = Readable.from(input === undefined ? [] : [JSON.stringify(input)]); req.method = method; req.socket = { remoteAddress: '127.0.0.1' }; req.headers = { host: 'localhost:19387', 'x-sub2api-monitor': '1', ...headers };
    let body; const res = { statusCode: 200, setHeader() {}, end: s => { body = JSON.parse(s); } }; await handler(req, res); return { status: res.statusCode, body };
  } };
}
const input = { revision: 4, baseUrl: 'https://example.test/api/v1', intervalSeconds: 60, allowInsecureHttp: false };
test('first save requires key and rejects oversized input and invalid interval', async () => {
  const h = harness(false);
  assert.equal((await h.call('POST', input)).status, 400);
  assert.equal((await h.call('POST', { ...input, adminApiKey: 'x'.repeat(17000) })).status, 413);
  assert.equal((await h.call('POST', { ...input, adminApiKey: 'test', intervalSeconds: 1 })).status, 400);
  assert.equal(h.writes.length + h.stored.length, 0);
  assert.equal((await h.call('POST', { ...input, adminApiKey: 'test' })).status, 200);
  assert.deepEqual(h.stored, [['SUB2API_ADMIN_API_KEY', 'test']]);
  assert.equal(JSON.stringify(h.writes).includes('test"'), false);
});
test('display preferences persist with validation and no secret overwrite', async () => {
  const h = harness();
  const preferences = { primaryAccounts: ['Primary', 'Second'], primaryFirst: true, displayFilter: 'primary', sortBy: 'usage-desc' };
  assert.equal((await h.call('POST', { ...input, ...preferences })).status, 200);
  for (const [key, value] of Object.entries(preferences)) assert.deepEqual(h.writes[0][1][key], value);
  assert.equal((await h.call('POST', { ...input, sortBy: 'invalid' })).status, 400);
  assert.equal(h.writes.length, 1);
  assert.equal(h.stored.length, 0);
});
test('configuration read projects reference and presence only', async () => { const r = await harness().call('GET'); assert.equal(r.body.hasKey, true); assert.equal(r.body.keyRef, 'SUB2API_ADMIN_API_KEY'); assert.equal(r.body.keyWritable, true); });
test('save preserves existing secret and fences concurrent edits', async () => { const h = harness(); assert.equal((await h.call('POST', input)).status, 200); assert.equal('adminApiKey' in h.writes[0][1], false); assert.equal(h.stored.length, 0); assert.equal(h.writes[0][2], 4); assert.equal((await h.call('POST', { ...input, revision: 3 })).status, 409); assert.equal(h.writes.length, 1); });
test('save rotates key into credential store; plugin config never holds it', async () => { const h = harness(); const r = await h.call('POST', { ...input, adminApiKey: 'NEW-KEY' }); assert.deepEqual(h.stored, [['SUB2API_ADMIN_API_KEY', 'NEW-KEY']]); assert.equal(JSON.stringify(h.writes).includes('NEW-KEY'), false); assert.equal(JSON.stringify(r).includes('NEW-KEY'), false); assert.equal((await h.call('POST', input, { origin: 'https://evil.test' })).status, 403); assert.equal((await h.call('POST', { ...input, baseUrl: 'http://example.test' })).status, 400); });
test('read-only credential source rejects rotation', async () => { const h = harness(true, false); assert.equal((await h.call('POST', { ...input, adminApiKey: 'X' })).status, 409); assert.equal(h.stored.length + h.writes.length, 0); assert.equal((await h.call('GET')).body.keyWritable, false); });
