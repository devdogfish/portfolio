# Quantself and Umami analytics handoff

**Selected** self-hosted Umami 3.4.1. Quantself's narrow Hono relay validates portfolio batches and forwards to Umami's private batch API. The owner dashboard reads the same Umami PostgreSQL data with a read-only credential. Quantself's existing database needs no analytics migration.

## Sender endpoint

- Local URL `http://127.0.0.1:4311/api/v1/website-analytics/events`. Dashboard `http://localhost:4310/website-analytics`. Umami `http://127.0.0.1:4312`.
- Server-side `X-API-Key: <QUANTSELF_WEBSITE_ANALYTICS_TOKEN>`. Use a random token at least 32 bytes. Never ship it to the browser.
- POST the normalized `{events:[…]}` body from `lib/analytics-contract.ts` directly. Optional `siteId: "girke.dev"` accepted. Limit 50 events or 64 KiB per batch.
- Sender aliases `entryCode`, `threshold` and `action` are accepted. The approved sources include `resume-software`, `resume-web-cms`, `resume-admin-excel`, and `kristina-footer`. We omit optional referrer and device before forwarding.
- HTTP 200 returns `{received, accepted}`. Retry transport errors, 429 and 5xx with stable event IDs and backoff. HTTP 400 rejects validation, 401 indicates token mismatch, 413 indicates oversized data.
- Quantself deduplicates reports by sender event ID, because Umami's write API generates its own ID and can receive repeats after a transport failure. Native Umami counters can include retries. Stable IDs, sequence, and cumulative engagement are preserved in Umami event data.

Production requires an always-on HTTPS Quantself relay that can reach private Umami. A local-only server cannot be the destination of a production Vercel function. Keep Umami's admin UI and direct ingest endpoints private. Until a receiver is deployed, use a durable portfolio outbox or leave production tracking explicitly disabled.

[Umami sending API](https://docs.umami.is/docs/api/sending-stats)
