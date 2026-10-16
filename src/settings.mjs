import { validateConfig } from './monitor.mjs';
import { presentationConfig } from './presentation.mjs';
import { keyRef } from './config.mjs';

export function createSettingsHandler(ctx, trusted) {
  const descriptor = () => ctx.settings.describe({ redactSecrets: true }).find(d => d.ns === 'dsh-sub2api-monitor' || d.ns === 'include:dsh-sub2api-monitor');
  return async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const send = (status, value) => { res.statusCode = status; res.end(JSON.stringify(value)); };
    if (!trusted(req)) return send(403, { error: '禁止访问' });
    if (!['GET', 'POST'].includes(req.method)) return send(405, { error: '不支持的请求' });
    const d = descriptor();
    if (!d) return send(503, { error: '插件配置尚未就绪，请重启 DSH' });
    const v = d.value || {};
    let ref, info;
    try { ref = keyRef(v); info = await ctx.credentials.describe(ref); } catch { return send(503, { error: '凭证服务不可用' }); }
    if (req.method === 'GET') return send(200, { ...presentationConfig(v), revision: d.revision, baseUrl: v.baseUrl || '', intervalSeconds: v.intervalSeconds || 60, allowInsecureHttp: v.allowInsecureHttp === true, hasKey: info.configured === true, keyRef: ref, keyWritable: info.writable === true });
    try {
      let body = ''; for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 16384) return send(413, { error: '配置过大' }); }
      const input = JSON.parse(body);
      if (!Number.isSafeInteger(input.revision) || input.revision !== d.revision) return send(409, { error: '配置已变化，请重新打开页面后再保存' });
      const patch = { ...presentationConfig({ ...v, ...input }), baseUrl: input.baseUrl, allowInsecureHttp: input.allowInsecureHttp === true, intervalSeconds: input.intervalSeconds };
      if (!Number.isInteger(patch.intervalSeconds) || patch.intervalSeconds < 30 || patch.intervalSeconds > 3600) throw new Error();
      if (input.adminApiKey !== undefined && typeof input.adminApiKey !== 'string') throw new Error();
      const key = input.adminApiKey?.trim();
      validateConfig({ ...patch, apiKey: key || 'unchanged' });
      if (!key && !info.configured) return send(400, { error: '请填写管理员密钥' });
      if (key) {
        if (!info.writable) return send(409, { error: `凭证 ${ref} 由只读来源提供，无法在此修改` });
        await ctx.credentials.set(ref, key);
      }
      await ctx.settings.update(d.ns, patch, input.revision);
      send(200, { saved: true });
    } catch { send(400, { error: '保存失败：检查地址、HTTP 开关、密钥、刷新间隔及账号显示设置；如配置已更新，请重新打开页面' }); }
  };
}
