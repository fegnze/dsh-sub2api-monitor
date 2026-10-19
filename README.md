# sub2api Account Usage Monitor

English | [中文](<docs/zh.md>)

`dsh-sub2api-monitor` is a DSH desktop plugin compatible with DSH `0.2.0-rc.2` and `0.2.1-rc.2`. It provides only a usage entry in the conversation title bar, with no sidebar entry, full page, or centered dialog. The title-bar popover has a maximum width of 700px and adapts to the viewport, balancing two-column cards with readability. Clicking outside, pressing Esc, or clicking Close dismisses it; clicking inside does not. It does not modify DSH core or start additional processes or HTTP services.

## Data and refresh

The Host reads the paginated account list, each account's `/usage`, and `/today-stats` through the management API. It refreshes every 60 seconds by default, processing at most 3 accounts concurrently. The Client reads the local cache every 10 seconds; manual refresh has a minimum interval of 10 seconds. All timers and requests are disposed of on plugin unload. Operations are read-only: the plugin does not call account start/stop, credential refresh, or quota-reset endpoints.

- Quota windows: 5-hour, 7-day, and upstream Sonnet/Opus windows, showing usage percentages and relative reset times, with full timestamps on hover. Anthropic explicitly uses `source=passive`, matching the site's passive sampling; the default active endpoint may omit weekly quotas.
- Compact, responsive cards retain today's statistics and abbreviate large numbers. The top explanation area and search box are removed; synchronization status appears as a title-bar dot.
- Subscription type: only allowlisted scalar values from `credentials.plan_type` are extracted, displayed separately from authentication methods such as OAuth. `promax` is shown as the site's corresponding `Pro 500`; missing values display “Unknown subscription”. The credentials object is never passed through.
- Today's requests, tokens, and cost use the Shanghai time zone. Costs use sub2api's accounting basis and are not equivalent to the provider's actual bill.
- Highlights at 80%/95%; the conversation summary counts accounts needing attention. System notifications are not currently sent.
- Unknown fields remain unknown. Partial failures are marked separately; list failures retain old data with a stale indicator. Upstream snapshots may predate collection; source timestamps are shown when supplied by the API.

## Account details

Click a card (or press Enter/Space) to open details within the same popover; Back returns to the list. Details load `/admin/accounts/:id/stats?days=30&timezone=Asia%2FShanghai` only on demand, cache for 60 seconds, and coalesce concurrent requests. Only known collected account IDs are accepted, redirects are rejected, and the Host projects allowlisted fields. No historical database or background history polling is added.

The view shows period totals, reported window length and recorded date range, daily request/Token/account-cost bars, model ranking by Token with expandable input/output/cache composition, active-day averages, peak days, and mean request duration. Missing dates are not filled with zeros. This covers only calls through sub2api; costs are not subscription bills, and mean duration is not time to first token. Account costs use `actual_cost` for daily records and `account_cost` for models; missing fields stay unknown. Errors offer retry; leaving details aborts the UI request, while shared Host work is bounded by timeout and unload cancellation.

## Installation and plugin configuration

Install the npm package `dsh-sub2api-monitor` in DSH's Plugins page. Open the configuration form in the plugin details, fill in the following fields, and save. Configuration is embedded directly in the plugin information page rather than registering a host settings page; the Configuration button at the top of the usage popover also opens it. DSH's settings service writes configuration to the profile; no plugin source edits are needed. The read endpoint returns only non-sensitive fields, the credential reference name, and whether a key is set. Leaving the key input blank preserves the existing value; the first save requires a key. Saves use revisions to detect concurrent conflicts and do not automatically overwrite changes from another window.

Disable the old `sub2api-monitor` and earlier `myspace-sub2api-monitor` packages before enabling the new package to avoid duplicate collection. After moving parameters into plugin configuration, uninstall the old package. Both the component ID and configuration namespace are `dsh-sub2api-monitor`; connection configuration is managed only by the DSH profile. When upgrading to 0.1.0, also replace the old component ID in the profile with the new ID while preserving its config fields; do not just swap packages and lose configuration.

- `baseUrl`: the site's API address, including `/api/v1`.
- `adminApiKeyEnv`: credential reference (environment-variable-style name) for the administrator API key; default `SUB2API_ADMIN_API_KEY`. The profile stores only this name. A key entered in the form is written to the DSH credentials service (`$DSH_HOME/.credentials.yaml` with the local provider), not to plugin configuration. The process environment or a `.env` file can also supply it; an inherited environment value is read-only and disables the key input.
- `allowInsecureHttp`: off by default; enable only after explicitly accepting plaintext risks.
- `intervalSeconds`: 30–3600 seconds; default 60 seconds.
- `primaryAccounts`: select multiple accounts from a checkbox list loaded automatically from the unfiltered Host cache. Refresh Accounts fetches upstream data using the saved connection (10-second cooldown). Missing selected accounts are retained; failures never clear selections. Internally stored as exact names, empty by default. Primary cards show a badge.
- `primaryFirst`: defaults to true; places primary accounts before the selected secondary ordering.
- `displayFilter`: `all`, `primary`, `available`, or `attention`. Attention includes unavailable accounts, failed usage/statistics requests, and usage at or above 80%.
- `sortBy`: `available` (default), `name`, `usage-desc`, or `usage-asc`. Usage sorting compares the highest known usage percentage across windows; unknown values sort last. Filtering does not change upstream collection. Settings persist in the profile and are applied to subsequent cache reads. The title-bar count reflects the filtered set; the web dashboard remains independent.

Only the Host resolves the key, once per request, so rotation takes effect on the next refresh without a restart. It is never injected into the Client module, usage endpoint, or profile. The credentials file is plaintext with owner-only permissions; it is not disk encryption.

```json
{
  "baseUrl": "https://your-sub2api.example/api/v1",
  "adminApiKeyEnv": "SUB2API_ADMIN_API_KEY",
  "allowInsecureHttp": false,
  "intervalSeconds": 60
}
```

Set `allowInsecureHttp` to `true` only after explicitly accepting plaintext transport risks. To rotate the key, enter a new one in the form, or update the credential through the DSH credentials service; no reinstallation is needed.

Upgrading from 0.1.x: the plaintext `adminApiKey` field has been removed. Move its value into the credentials service under `SUB2API_ADMIN_API_KEY` (or re-enter it in the form), then delete `adminApiKey` from the profile's `cordis.patch.yml`.

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
