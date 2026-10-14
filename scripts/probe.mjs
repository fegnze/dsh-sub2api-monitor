const response = await fetch('http://127.0.0.1:19387/sub2api-monitor/api', { method: 'POST', headers: { 'X-Sub2api-Monitor': '1' }, signal: AbortSignal.timeout(90000) });
if (!response.ok) throw new Error(`Monitor HTTP ${response.status}`);
const s = await response.json();
console.log(JSON.stringify({ ok: !s.error, count: s.accounts.length, stale: s.stale, accounts: s.accounts.map(a => ({ id: a.id, platform: a.platform, windows: a.windows.length, usageError: a.usageError, statsError: a.statsError })) }, null, 2));
if (s.error || s.accounts.some(a => a.usageError || a.statsError)) process.exitCode = 1;
