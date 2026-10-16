import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Config, monitorConfig, keyRef, DEFAULT_KEY_REF } from '../src/config.mjs';

const store = values => ({ resolve: async ref => values[ref] ? { value: values[ref], source: 'file' } : undefined });

test('native Config holds a credential reference, never a key value', () => {
  assert.equal(Config.dict.adminApiKeyEnv.meta.role, 'credential-ref');
  assert.equal('adminApiKey' in Config.dict, false);
  assert.equal(Config.meta.volatile, true);
  const c = Config({}).get();
  assert.equal(c.baseUrl, '');
  assert.equal(c.adminApiKeyEnv, DEFAULT_KEY_REF);
  assert.equal(c.allowInsecureHttp, false);
  assert.equal(c.intervalSeconds, 60);
  assert.throws(() => Config({ adminApiKeyEnv: 'not-a-ref' }));
});
test('Config validates interval and resolves the key per operation', async () => {
  assert.throws(() => Config({ intervalSeconds: 2 }));
  assert.throws(() => Config({ intervalSeconds: 60.5 }));
  assert.throws(() => Config({ allowInsecureHttp: 'yes' }));
  const values = { CUSTOM_REF: 'first' };
  const config = Config({ baseUrl: 'https://example.test/api/v1', adminApiKeyEnv: 'CUSTOM_REF' });
  assert.equal(keyRef(config), 'CUSTOM_REF');
  assert.equal((await monitorConfig(store(values), config)).apiKey, 'first');
  values.CUSTOM_REF = 'rotated';
  const result = await monitorConfig(store(values), config);
  assert.equal(result.apiKey, 'rotated');
  assert.equal(result.intervalSeconds, 60);
  assert.equal((await monitorConfig(store({}), Config({}))).apiKey, undefined);
});
