import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDetails, statsView } from '../src/details.mjs';
const raw = { summary: { days: 31, total_requests: 12, secret: 'SECRET' }, history: [{ date: '2026-10-02', requests: 2, actual_cost: 1, secret: 'SECRET' }], models: [{ model: 'model', total_tokens: 100, account_cost: 3, credentials: 'SECRET' }] };
test('statistics whitelist preserves unknown fields and actual range', () => {
  const result = statsView(raw);
  assert.equal(result.summary.days, 31); assert.equal(result.summary.total_tokens, null);
  assert.equal(result.history.length, 1); assert.equal(result.models[0].account_cost, 3);
  assert.ok(!JSON.stringify(result).includes('SECRET')); assert.throws(() => statsView({}));
});
test('details caches, coalesces and invalidates on credential change', async () => {
  let clock = 1000, calls = 0, key = 'secret';
  const details = createDetails({ config: () => ({ baseUrl: 'https://example.test/api/v1', apiKey: key }), accounts: () => [{ id: 1 }], now: () => clock, fetcher: async (url, options) => {
    calls++; assert.ok(url.includes('/1/stats?days=30')); assert.equal(options.redirect, 'error');
    await new Promise(resolve => setImmediate(resolve));
    return { ok: true, json: async () => ({ code: 0, data: raw }) };
  } });
  await assert.rejects(details.get(2)); assert.equal(calls, 0);
  await Promise.all([details.get(1), details.get(1)]); assert.equal(calls, 1);
  await details.get(1); assert.equal(calls, 1);
  clock += 60001; await details.get(1); assert.equal(calls, 2);
  key = 'new'; await details.get(1); assert.equal(calls, 3);
  details.dispose(); await assert.rejects(details.get(1));
});
test('errors are not cached and unload aborts requests', async () => {
  let signal;
  const details = createDetails({ config: () => ({ baseUrl: 'https://example.test', apiKey: 'x' }), accounts: () => [{ id: 1 }], fetcher: async (_, options) => { signal = options.signal; return { ok: false }; } });
  await assert.rejects(details.get(1)); details.dispose(); assert.equal(signal.aborted, true);
});
