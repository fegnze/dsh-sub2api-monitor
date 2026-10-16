import Schema from '@deepseek-ai/schemastery';

export const DEFAULT_KEY_REF = 'SUB2API_ADMIN_API_KEY';
export const REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const Config = Schema.object({
  baseUrl: Schema.string().default('').description('Sub2api API base URL, including /api/v1 / 站点 API 地址，包含 /api/v1'),
  adminApiKeyEnv: Schema.string().role('credential-ref').pattern(REF_PATTERN).default(DEFAULT_KEY_REF).description('Admin API Key credential reference / 管理员 API 密钥凭证引用；仅 Host 解析'),
  allowInsecureHttp: Schema.boolean().default(false).description('Allow plaintext HTTP / 允许明文 HTTP（密钥可能被截获）'),
  intervalSeconds: Schema.number().min(30).max(3600).step(1).default(60).description('Refresh interval in seconds / 刷新间隔（秒）'),
  primaryAccounts: Schema.array(Schema.string()).default([]).description('Primary account names / 主账号名称（精确匹配，可多个）'),
  primaryFirst: Schema.boolean().default(true).description('Primary accounts first / 主账号优先'),
  displayFilter: Schema.union(['all', 'primary', 'available', 'attention']).default('all').description('Display filter / 显示过滤：全部、主账号、可用、需关注'),
  sortBy: Schema.union(['available', 'name', 'usage-desc', 'usage-asc']).default('available').description('Sort / 排序：可用优先、名称、用量降序、用量升序'),
}).volatile();

const plain = config => (typeof config?.get === 'function' ? config.get() : config) || {};

export function keyRef(config = {}) {
  const ref = plain(config).adminApiKeyEnv || DEFAULT_KEY_REF;
  if (!REF_PATTERN.test(ref)) throw new Error('凭证引用无效');
  return ref;
}

/** Resolve the admin key for one operation; the value is never retained. */
export async function monitorConfig(credentials, config = {}) {
  const c = plain(config);
  const apiKey = (await credentials.resolve(keyRef(c)))?.value;
  return { baseUrl: c.baseUrl, apiKey, allowInsecureHttp: c.allowInsecureHttp === true, intervalSeconds: c.intervalSeconds ?? 60 };
}
