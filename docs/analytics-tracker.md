# Portfolio analytics

The portfolio sends the [Quantself #301 payload](https://github.com/devdogfish/quantself/blob/ad39eb5/docs/website-analytics-ingest.md) to its API origin. Set the server-only `QUANTSELF_ANALYTICS_ORIGIN` and `QUANTSELF_ANALYTICS_INGEST_TOKEN` for the coordinated switch.

The redirect route can call `analyticsVisitor(request.headers, occurredAt)` from `lib/analytics/server.ts`. Skip an excluded request. For a `link:open` event, use the returned `ipId` as `ip_id`, include the route code in `link_code`, and set `props.method` to GET or HEAD. Add the destination `props.key` when present and cap `props.ua` at 512 characters. Pass the typed event to `sendAnalyticsBatch([event])` inside Next's `after()`. The helper accepts #301's snake_case fields and sends server-side JSON with the scoped token. It throws when delivery fails so the redirect can handle that separately from the response.

On Vercel, the request helper checks the platform's IP header against `ANALYTICS_EXCLUDED_IPS` and computes lowercase hex HMAC-SHA256 of `<UTC date>|<ip>` with `ANALYTICS_IP_KEY`. Raw IP stays in the portfolio. The redirect can retain scanner opens for analysis while the browser collection route filters bots.

## Browser collection and inquiries

Mount `AnalyticsTracker` once in the root layout within a Suspense boundary. Mark tracked CTAs with `data-track="cta:contact"` or another stable label. Browser batches post to `/api/e`. The route filters bots, owner devices and privacy opt-outs before forwarding with Next's `after()`. The static page can mount `PortfolioContactForm` to submit a private inquiry and record a separate form event.

Set `OWNER_TRACKING_SECRET` on the server. On each owner browser, visit `/?owner=<URL-encoded secret>` once. Successful enrollment removes the parameter, sets `localStorage['analytics:owner']` to `1` and sets a first-party opt-out cookie for server-side events on that browser.

Run the isolated browser fixture with `bun x playwright test --config tests/fixtures/analytics.config.ts`. It uses an isolated Next app and a synthetic Quantself endpoint on loopback.
