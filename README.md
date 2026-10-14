# sub2api 账号用量监控

DSH desktop 插件 `myspace-sub2api-monitor`，兼容 DSH `0.2.0-rc.2`。左侧「账号用量」打开完整面板，会话标题右侧摘要可直接展开浮层。不改 DSH 核心，不启动额外进程或 HTTP 服务。

## 数据与刷新

Host 通过管理 API 读取分页账号列表、每账号 `/usage` 和 `/today-stats`，默认每 60 秒刷新、最多同时处理 3 个账号。Client 每 10 秒读取本机缓存；手动刷新最小间隔 10 秒。所有定时器和请求跟随插件卸载销毁。只读取数据，不调用账号启停、刷新凭证或额度重置接口。

- 额度窗口：5 小时、7 天及上游返回的 Sonnet/Opus 窗口，显示已用比例与相对重置时间，悬浮查看完整时间。Anthropic 显式使用 `source=passive`，与站点的被动采样一致；默认主动接口可能缺少周额度。
- 紧凑自适应卡片，保留今日统计并缩写大数；去掉顶部说明区和搜索框，同步状态收进标题栏圆点。
- 今日请求、Token 和费用：上海时区；费用为 sub2api 统计口径，不等同供应商实际账单。
- 80%/95% 高亮提醒；会话摘要计数需关注账号。暂不发送系统通知。
- 未知字段保持未知；局部失败单独标记，列表失败保留旧数据并显示过期。上游快照可能比采集时间旧，显示源时间（如果接口提供）。

## 本机配置

默认读取 `~/.config/dsh-sub2api-monitor/config.json`，也可由 Host 环境变量 `SUB2API_MONITOR_CONFIG` 指定。目录权限 700，文件权限 600。配置不放入仓库，密钥绝不填写进 bundle patch。

```json
{
  "baseUrl": "https://your-sub2api.example/api/v1",
  "apiKey": "替换为管理员密钥",
  "allowInsecureHttp": false,
  "intervalSeconds": 60
}
```

仅在明确接受明文传输风险后将 `allowInsecureHttp` 设为 `true`。轮换密钥时修改本机文件，下次采集自动读取，无需重装。拒绝跟随上游重定向，防止密钥随重定向泄露。前端仅收到白名单展示字段，不包含 credentials、extra、notes 或原始错误。

本机 `/sub2api-monitor/api` 只接受 loopback、合法本机 Host、同源 Origin（若存在）、自定义请求头 `X-Sub2api-Monitor: 1`，不启用 CORS。当前不支持远程浏览器/跨机连接。

## 安装与验证

无依赖、无生成步骤，Client 为原生 ModuleLoader 包装的 JavaScript，直接随包分发。通过 DSH 插件管理安装本目录的 link bundle，仅安装到 desktop profile。刷新现有 DSH 页面后检查左侧入口与会话摘要；不需要启动替代 Web 服务。

```sh
node --test test/*.test.mjs
node scripts/probe.mjs
```

probe 使用本机配置，只输出账号数量、平台及成功状态，不输出账号名称、原始响应或密钥。测试涵盖脱敏白名单、分页、部分失败、单飞刷新、缓存过期、HTTP 明确授权、同源校验和卸载取消。
