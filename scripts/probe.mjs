import { createMonitor } from '../src/monitor.mjs';
import { readConfig } from '../src/host.mjs';
const monitor = createMonitor({ config: readConfig });
await monitor.refresh();
const s = monitor.snapshot();
console.log(JSON.stringify({ ok: !s.error, count: s.accounts.length, stale: s.stale, accounts: s.accounts.map(a => ({ id: a.id, platform: a.platform, windows: a.windows.length, usageError: a.usageError, statsError: a.statsError })) }, null, 2));
monitor.dispose();
if (s.error || s.accounts.some(a => a.usageError || a.statsError)) process.exitCode = 1;
