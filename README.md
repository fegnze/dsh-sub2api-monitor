# sub2api Account Usage Monitor

English | [中文](<README.zh.md>)

`dsh-sub2api-monitor` is a DSH desktop plugin compatible with DSH `0.2.0-rc.2`. It provides only a usage entry in the conversation title bar, with no sidebar entry, full page, or centered dialog. The title-bar popover has a maximum width of 700px and adapts to the viewport, balancing two-column cards with readability. Clicking outside, pressing Esc, or clicking Close dismisses it; clicking inside does not. It does not modify DSH core or start additional processes or HTTP services.

## Data and refresh

The Host reads the paginated account list, each account's `/usage`, and `/today-stats` through the management API. It refreshes every 60 seconds by default, processing at most 3 accounts concurrently. The Client reads the local cache every 10 seconds; manual refresh has a minimum interval of 10 seconds. All timers and requests are disposed of on plugin unload. Operations are read-only: the plugin does not call account start/stop, credential refresh, or quota-reset endpoints.

- Quota windows: 5-hour, 7-day, and upstream Sonnet/Opus windows, showing usage percentages and relative reset times, with full timestamps on hover. Anthropic explicitly uses `source=passive`, matching the site's passive sampling; the default active endpoint may omit weekly quotas.
- Compact, responsive cards retain today's statistics and abbreviate large numbers. The top explanation area and search box are removed; synchronization status appears as a title-bar dot.
- Subscription type: only allowlisted scalar values from `credentials.plan_type` are extracted, displayed separately from authentication methods such as OAuth. `promax` is shown as the site's corresponding `Pro 500`; missing values display “Unknown subscription”. The credentials object is never passed through.
- Today's requests, tokens, and cost use the Shanghai time zone. Costs use sub2api's accounting basis and are not equivalent to the provider's actual bill.
- Highlights at 80%/95%; the conversation summary counts accounts needing attention. System notifications are not currently sent.
- Unknown fields remain unknown. Partial failures are marked separately; list failures retain old data with a stale indicator. Upstream snapshots may predate collection; source timestamps are shown when supplied by the API.

## Installation and plugin configuration

Install the npm package `dsh-sub2api-monitor` in DSH's Plugins page. Open the configuration form in the plugin details, fill in the following fields, and save. Configuration is embedded directly in the plugin information page rather than registering a host settings page; the Configuration button at the top of the usage popover also opens it. DSH's settings service writes configuration to the profile; no plugin source edits are needed. The read endpoint returns only non-sensitive fields and whether a key is set. Leaving the key input blank preserves the existing value; the first save requires a key. Saves use revisions to detect concurrent conflicts and do not automatically overwrite changes from another window.

Disable the old `sub2api-monitor` and earlier `myspace-sub2api-monitor` packages before enabling the new package to avoid duplicate collection. After moving parameters into plugin configuration, uninstall the old package. Both the component ID and configuration namespace are `dsh-sub2api-monitor`; connection configuration is managed only by the DSH profile. When upgrading to 0.1.0, also replace the old component ID in the profile with the new ID while preserving its config fields; do not just swap packages and lose configuration.

- `baseUrl`: the site's API address, including `/api/v1`.
- `adminApiKey`: administrator API key, entered with DSH's secret input type.
- `allowInsecureHttp`: off by default; enable only after explicitly accepting plaintext risks.
- `intervalSeconds`: 30–3600 seconds; default 60 seconds.

Only the Host uses the key. It is not injected into the Client module or usage endpoint. The secret input masks the value; this does not imply disk encryption. Protect the DSH profile and never commit local configuration containing credentials to Git.

```json
{
  "baseUrl": "https://your-sub2api.example/api/v1",
  "adminApiKey": "replace-with-administrator-key",
  "allowInsecureHttp": false,
  "intervalSeconds": 60
}
```

Set `allowInsecureHttp` to `true` only after explicitly accepting plaintext transport risks. To rotate the key, update and save plugin configuration; no reinstallation is needed.

The old standalone JSON configuration and `SUB2API_MONITOR_CONFIG` environment variable are no longer read. Delete the old configuration file after migration, keeping plugin configuration as the single authority.

Upstream redirects are rejected to prevent key leakage. The frontend receives only allowlisted display fields, excluding credentials, extra, notes, and raw errors.

The local `/sub2api-monitor/api` accepts only loopback requests, a valid local Host, a same-origin Origin when present, and the custom header `X-Sub2api-Monitor: 1`. CORS is not enabled. Remote browsers and cross-machine connections are not currently supported.

## Installation and verification

The only dependency is the official `@deepseek-ai/schemastery` configuration schema package; there is no generation step. The Client is JavaScript wrapped in the native ModuleLoader and ships directly in the package. Install the npm package or a development-directory link bundle through DSH plugin management. Restart DSH after upgrading an installed module, then check the bilingual titles, icon, configuration form, and conversation summary in plugin details. There is no need to start a replacement Web service.

This is a community plugin, not an official DeepSeek product. Package metadata, icon exports, bilingual locales, native Config, and lifecycle follow the DSH plugin specification. The original transparent SVG icon uses a 36×36 dashboard design. Source and issue tracker: https://github.com/fegnze/dsh-sub2api-monitor.

```sh
node --test test/*.test.mjs
node scripts/probe.mjs
```

The probe calls the current DSH monitor endpoint and outputs only account counts, platforms, and success status, not account names, raw responses, or keys. Tests cover redaction allowlists, pagination, partial failures, single-flight refresh, cache staleness, explicit HTTP authorization, same-origin validation, and cancellation on unload.
