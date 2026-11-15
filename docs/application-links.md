# Application links

`GET https://girke.dev/api/links` is public and cacheable. The `project`, `profile`, and `variant` lists remain available for discovery. A renderer uses `schemaVersion: 1` and `destinations: [{ key, sourceUrls }]`. Each source URL has one destination. The home entry has `key: null`.

Register the application revision directly with [Quantself #302](https://github.com/devdogfish/quantself/issues/302). Replace mapped source URLs with `https://girke.dev/r/<code>` for home or `/r/<code>/<key>` for a flat key. Portfolio no longer accepts registration POSTs. The redirect also accepts nested catalog suffixes on already-issued 24-character codes.

Configure the redirect server with the full Quantself lookup path in `QUANTSELF_TRACKED_LINKS_URL` (ending in `/api/v1/tracked-links`) and its dedicated `QUANTSELF_TRACKED_LINKS_READ_TOKEN`. Configure link-open reporting with `QUANTSELF_ANALYTICS_ORIGIN` and `QUANTSELF_ANALYTICS_INGEST_TOKEN` ([Quantself #301](https://github.com/devdogfish/quantself/issues/301)). Both credentials are server only and grant different scopes. The redirect shares the visitor and sender helpers from portfolio #1.

Bare Application Links redirect to the prerendered `/audience/<track>` home, carrying `via`. Known keys land on their catalog destination. Unknown codes return 404; if the lookup is unavailable, the ordinary home receives `via`. The redirect response is uncached so opens can be recorded separately.
