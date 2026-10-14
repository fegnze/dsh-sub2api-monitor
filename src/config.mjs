import Schema from '@deepseek-ai/schemastery';

export const Config = Schema.object({
  baseUrl: Schema.string().default('').description('Sub2api API base URL, including /api/v1 / 站点 API 地址，包含 /api/v1'),
  adminApiKey: Schema.string().role('secret').default('').description('Admin API Key / 管理员 API 密钥；仅 Host 使用'),
  allowInsecureHttp: Schema.boolean().default(false).description('Allow plaintext HTTP / 允许明文 HTTP（密钥可能被截获）'),
  intervalSeconds: Schema.number().min(30).max(3600).step(1).default(60).description('Refresh interval in seconds / 刷新间隔（秒）'),
}).volatile();

export function monitorConfig(config = {}) {
  config = typeof config.get === 'function' ? config.get() : config;
  return { baseUrl: config.baseUrl, apiKey: config.adminApiKey, allowInsecureHttp: config.allowInsecureHttp === true, intervalSeconds: config.intervalSeconds ?? 60 };
}
