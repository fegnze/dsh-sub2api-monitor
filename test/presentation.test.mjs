import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presentSnapshot, presentationConfig } from '../src/presentation.mjs';
const accounts = [
  { id: 1, name: 'Other', status: 'active', schedulable: true, windows: [{ utilization: 20 }] },
  { id: 2, name: 'Primary', status: 'inactive', windows: [{ utilization: 90 }] },
  { id: 3, name: 'Second', status: 'active', schedulable: true, windows: [] },
];
const ids = config => presentSnapshot({ accounts }, config).accounts.map(a => a.id);
test('primary names are configurable and do not mutate collected accounts', () => {
  assert.deepEqual(ids({ primaryAccounts: ['Primary', 'Second'] }), [3, 2, 1]);
  assert.deepEqual(ids({ primaryAccounts: ['Primary'], primaryFirst: false }), [1, 3, 2]);
  assert.equal(accounts[1].primary, undefined);
  assert.deepEqual(presentationConfig().primaryAccounts, []);
});
test('filters and usage sorting with unknown values last', () => {
  assert.deepEqual(ids({ primaryAccounts: ['Primary'], displayFilter: 'primary' }), [2]);
  assert.deepEqual(ids({ displayFilter: 'available' }), [1, 3]);
  assert.deepEqual(ids({ displayFilter: 'attention' }), [2]);
  assert.deepEqual(ids({ sortBy: 'usage-desc' }), [2, 1, 3]);
  assert.deepEqual(ids({ sortBy: 'usage-asc' }), [1, 2, 3]);
  assert.deepEqual(ids({ sortBy: 'name' }), [1, 2, 3]);
  assert.deepEqual(ids({ displayFilter: 'primary' }), []);
});
test('invalid display values rejected and names normalized', () => {
  for (const config of [{ primaryAccounts: 'bad' }, { primaryAccounts: [''] }, { displayFilter: 'invalid' }, { sortBy: 'invalid' }, { primaryFirst: 'true' }]) assert.throws(() => presentationConfig(config));
  assert.deepEqual(presentationConfig({ primaryAccounts: [' A ', 'A'] }).primaryAccounts, ['A']);
});
