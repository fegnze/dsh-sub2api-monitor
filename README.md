# sub2api 账号用量监控

DSH desktop 插件 `dsh-sub2api-monitor`，兼容 DSH `0.2.0-rc.2`。仅保留会话标题栏用量入口，不注册侧栏入口、整页或中心弹窗。标题栏浮层最大宽 700px，适配视口，兼顾双列卡片与可读性；点击外部、Esc 或关闭按钮收起，点击内部不关闭。不改 DSH 核心，不启动额外进程或 HTTP 服务。

## 数据与刷新

Host 通过管理 API 读取分页账号列表、每账号 `/usage` 和 `/today-stats`，默认每 60 秒刷新、最多同时处理 3 个账号。Client 每 10 秒读取本机缓存；手动刷新最小间隔 10 秒。所有定时器和请求跟随插件卸载销毁。只读取数据，不调用账号启停、刷新凭证或额度重置接口。

- 额度窗口：5 小时、7 天及上游返回的 Sonnet/Opus 窗口，显示已用比例与相对重置时间，悬浮查看完整时间。Anthropic 显式使用 `source=passive`，与站点的被动采样一致；默认主动接口可能缺少周额度。
- 紧凑自适应卡片，保留今日统计并缩写大数；去掉顶部说明区和搜索框，同步状态收进标题栏圆点。
- 订阅类型：仅从 `credentials.plan_type` 提取白名单标量，独立于 OAuth 等认证方式显示；`promax` 显示为站点对应的 `Pro 500`，缺失显示「订阅未知」，不透传 credentials 对象。
- 今日请求、Token 和费用：上海时区；费用为 sub2api 统计口径，不等同供应商实际账单。
- 80%/95% 高亮提醒；会话摘要计数需关注账号。暂不发送系统通知。
- 未知字段保持未知；局部失败单独标记，列表失败保留旧数据并显示过期。上游快照可能比采集时间旧，显示源时间（如果接口提供）。

## 安装与插件配置

在 DSH「插件」中安装 npm 包 `dsh-sub2api-monitor`，进入插件详情中的配置表单，填写下列字段并保存。配置直接嵌在本插件信息页面，不注册宿主设置页面；也可从用量浮层顶部的「配置」按钮跳转。配置由 DSH settings 服务写入 profile，不需要修改插件源码。读取接口仅返回非敏感字段和密钥是否已设置；密钥输入留空保留原值，首次保存需输入密钥。保存使用 revision 检测并发冲突，不自动覆盖其他窗口的修改。

旧包 `sub2api-monitor` 和更早的 `myspace-sub2api-monitor` 应停用后再启用新包，避免重复采集。参数迁入插件配置后卸载旧包。保留原 row id，连接配置仅由 DSH profile 管理。

- `baseUrl`：站点 API 地址，包含 `/api/v1`。
- `adminApiKey`：管理员 API 密钥，使用 DSH secret 类型输入框。
- `allowInsecureHttp`：默认关闭；仅在明确接受明文风险时开启。
- `intervalSeconds`：30–3600 秒，默认 60 秒。

本插件仅 Host 使用密钥，不把密钥注入 Client 模块或用量接口。secret 输入框负责遮挡，不代表磁盘加密；应保护 DSH profile，勿将含凭证的本机配置提交 Git。

```json
{
  "baseUrl": "https://your-sub2api.example/api/v1",
  "adminApiKey": "替换为管理员密钥",
  "allowInsecureHttp": false,
  "intervalSeconds": 60
}
```

仅在明确接受明文传输风险后将 `allowInsecureHttp` 设为 `true`。轮换密钥时在插件配置中更新并保存，无需重装。

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
