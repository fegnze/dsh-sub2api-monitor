import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Config, monitorConfig } from '../src/config.mjs';

test('native Config exposes a secret field and safe empty defaults', () => {
  assert.equal(Config.dict.adminApiKey.meta.role, 'secret');
  assert.equal(Config.meta.volatile, true);
  const c = Config({}).get();
  assert.equal(c.baseUrl, '');
  assert.equal(c.adminApiKey, '');
  assert.equal(c.allowInsecureHttp, false);
  assert.equal(c.intervalSeconds, 60);
});
test('Config validates interval and normalizes host-only settings', () => {
  assert.throws(() => Config({ intervalSeconds: 2 }));
  assert.throws(() => Config({ intervalSeconds: 60.5 }));
  assert.throws(() => Config({ allowInsecureHttp: 'yes' }));
  const result = monitorConfig(Config({ baseUrl: 'https://example.test/api/v1', adminApiKey: 'test-key' }));
  assert.equal(result.apiKey, 'test-key');
  assert.equal(result.intervalSeconds, 60);
});
