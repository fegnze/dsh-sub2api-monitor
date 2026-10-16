# sub2api 账号用量监控

[English](<../README.md>) | 中文

DSH desktop 插件 `dsh-sub2api-monitor`，兼容 DSH `0.2.0-rc.2`。仅保留会话标题栏用量入口，不注册侧栏入口、整页或中心弹窗。标题栏浮层最大宽 700px，适配视口，兼顾双列卡片与可读性；点击外部、Esc 或关闭按钮收起，点击内部不关闭。不改 DSH 核心，不启动额外进程或 HTTP 服务。

## 数据与刷新

Host 通过管理 API 读取分页账号列表、每账号 `/usage` 和 `/today-stats`，默认每 60 秒刷新、最多同时处理 3 个账号。Client 每 10 秒读取本机缓存；手动刷新最小间隔 10 秒。所有定时器和请求跟随插件卸载销毁。只读取数据，不调用账号启停、刷新凭证或额度重置接口。

- 额度窗口：5 小时、7 天及上游返回的 Sonnet/Opus 窗口，显示已用比例与相对重置时间，悬浮查看完整时间。Anthropic 显式使用 `source=passive`，与站点的被动采样一致；默认主动接口可能缺少周额度。
- 紧凑自适应卡片，保留今日统计并缩写大数；去掉顶部说明区和搜索框，同步状态收进标题栏圆点。
- 订阅类型：仅从 `credentials.plan_type` 提取白名单标量，独立于 OAuth 等认证方式显示；`promax` 显示为站点对应的 `Pro 500`，缺失显示「订阅未知」，不透传 credentials 对象。
- 今日请求、Token 和费用：上海时区；费用为 sub2api 统计口径，不等同供应商实际账单。
- 80%/95% 高亮提醒；会话摘要计数需关注账号。暂不发送系统通知。
- 未知字段保持未知；局部失败单独标记，列表失败保留旧数据并显示过期。上游快照可能比采集时间旧，显示源时间（如果接口提供）。

## 账号详情

点击卡片（或 Enter/空格）在同一个面板内进入详情，可返回列表。仅按需请求 `/admin/accounts/:id/stats?days=30&timezone=Asia%2FShanghai`，缓存 60 秒、并发合并。只接受已采集账号 ID，禁止重定向，Host 输出字段白名单；不引入历史数据库或全量历史轮询。

展示周期累计、接口统计天数与有记录日期范围、每日请求/Token/账号计费条形趋势、按 Token 排列的模型及可展开的输入/输出/缓存构成、活跃日日均、最高用量日和平均请求耗时。缺失日期不补零。仅覆盖经 sub2api 的调用，费用不是订阅账单，平均耗时不是首 Token 延迟。每日账号计费用 `actual_cost`、模型用 `account_cost`，缺失保持未知。错误可重试；退出详情取消前端请求，共享 Host 请求受超时及卸载取消保护。

## 安装与插件配置

在 DSH「插件」中安装 npm 包 `dsh-sub2api-monitor`，进入插件详情中的配置表单，填写下列字段并保存。配置直接嵌在本插件信息页面，不注册宿主设置页面；也可从用量浮层顶部的「配置」按钮跳转。配置由 DSH settings 服务写入 profile，不需要修改插件源码。读取接口仅返回非敏感字段、凭证引用名和密钥是否已设置；密钥输入留空保留原值，首次保存需输入密钥。保存使用 revision 检测并发冲突，不自动覆盖其他窗口的修改。

旧包 `sub2api-monitor` 和更早的 `myspace-sub2api-monitor` 应停用后再启用新包，避免重复采集。参数迁入插件配置后卸载旧包。组件 ID 与配置命名空间统一为 `dsh-sub2api-monitor`，连接配置仅由 DSH profile 管理。升级 0.1.0 时须同步将 profile 中旧组件 ID 改为新 ID，并保留其 config 字段；不能只换包而丢弃配置。

- `baseUrl`：站点 API 地址，包含 `/api/v1`。
- `adminApiKeyEnv`：管理员 API 密钥的凭证引用（环境变量风格名称），默认 `SUB2API_ADMIN_API_KEY`。profile 只保存该名称；表单中输入的密钥写入 DSH credentials 服务（本地提供方为 `$DSH_HOME/.credentials.yaml`），不写入插件配置。也可由进程环境或 `.env` 提供；继承自进程环境的值为只读，此时密钥输入框禁用。
- `allowInsecureHttp`：默认关闭；仅在明确接受明文风险时开启。
- `intervalSeconds`：30–3600 秒，默认 60 秒。
- `primaryAccounts`：主账号多选列表，打开设置自动加载未过滤的 Host 账号缓存；点击「刷新账号列表」使用已保存的连接配置拉取上游，冷却 10 秒。已选但未返回的账号保留，加载失败不清空选择。内部按名称精确匹配，默认空；卡片显示主账号标记。
- `primaryFirst`：默认开启，主账号优先于选定的次级排序。
- `displayFilter`：全部、仅主账号、仅可用、仅需关注。需关注包含不可用账号、额度或统计获取失败、已用比例达到 80%。
- `sortBy`：可用优先（默认）、名称、已用比例高到低、已用比例低到高。用量比较各窗口最高已知比例，未知排最后。过滤不改变上游采集范围；设置持久化到 profile，在后续缓存读取时应用。标题栏计数对应过滤后的集合；网页看板仍独立运行。

仅 Host 在每次请求时解析密钥，轮换后下一次刷新即生效，无需重启；密钥不进入 Client 模块、用量接口或 profile。凭证文件为仅属主可读的明文，不代表磁盘加密。

```json
{
  "baseUrl": "https://your-sub2api.example/api/v1",
  "adminApiKeyEnv": "SUB2API_ADMIN_API_KEY",
  "allowInsecureHttp": false,
  "intervalSeconds": 60
}
```

仅在明确接受明文传输风险后将 `allowInsecureHttp` 设为 `true`。轮换密钥时在表单中输入新密钥，或经 DSH credentials 服务更新，无需重装。

从 0.1.x 升级：已移除明文 `adminApiKey` 字段。将其值迁入 credentials 服务的 `SUB2API_ADMIN_API_KEY`（或在表单重新输入），再从 profile 的 `cordis.patch.yml` 删除 `adminApiKey`。

不再读取旧独立 JSON 配置或 `SUB2API_MONITOR_CONFIG` 环境变量。迁移后删除旧配置文件，只保留插件配置一处权威。

拒绝跟随上游重定向，防止密钥随重定向泄露。前端仅收到白名单展示字段，不包含 credentials、extra、notes 或原始错误。

本机 `/sub2api-monitor/api` 只接受 loopback、合法本机 Host、同源 Origin（若存在）、自定义请求头 `X-Sub2api-Monitor: 1`，不启用 CORS。当前不支持远程浏览器/跨机连接。

## 安装与验证

仅依赖官方 `@deepseek-ai/schemastery` 配置 schema，无生成步骤。Client 为原生 ModuleLoader 包装的 JavaScript，直接随包分发。通过 DSH 插件管理安装 npm 包或开发目录的 link bundle。升级已安装模块后重启 DSH，检查插件详情中的中英文标题、图标、配置表单与会话摘要；不需要启动替代 Web 服务。

这是社区插件，不是 DeepSeek 官方出品。包元数据、图标导出、双语 locale、原生 Config 和生命周期遵循 DSH 插件规范；原创透明 SVG 图标采用 36×36 仪表盘主题。源码与问题反馈：https://github.com/fegnze/dsh-sub2api-monitor 。

```sh
node --test test/*.test.mjs
node scripts/probe.mjs
```

probe 调用当前 DSH 监控接口，只输出账号数量、平台及成功状态，不输出账号名称、原始响应或密钥。测试涵盖脱敏白名单、分页、部分失败、单飞刷新、缓存过期、HTTP 明确授权、同源校验和卸载取消。
