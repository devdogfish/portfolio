# Portfolio analytics event contract

## Questions by audience

| Entry cohort | Journey to compare | Intent signals |
| --- | --- | --- |
| Software | Landing → engineering project → technical evidence | Resume, repository, demo, contact |
| Web/CMS | Landing → site or CMS case study → live example | Resume, live site, contact |
| Admin/Excel | Landing → workbook or automation example → sample | Resume, workbook, contact |
| Freelance | Landing → AI enablement, custom apps, or websites → relevant proof | Email, booking, inquiry |

These are reporting groups based on the entry variant. Anyone can use any variant. Use stable content and CTA identifiers from the site and track whichever destinations actually exist.

## Raw events

Every event carries schema version, random event ID, random session ID, random page-view ID, session sequence number, canonical pathname, and current variant. The collector adds its receipt timestamp and deduplicates by event ID. Sequence orders observed steps when deliveries arrive out of order. Assign a page-view ID per committed navigation, including client-side route changes. Exclude prefetches.

| Event | Fields | Trigger |
| --- | --- | --- |
| `page_view` | Entry attribution on first view only | Committed view |
| `engagement` | Cumulative `visibleMs`, optionally cumulative `activeMs` | Periodic checkpoint, route exit, document hidden |
| `scroll` | Threshold, one of 25, 50, 75, 90 | First crossing per threshold per view |
| `cta_click` | Allowlisted CTA ID and optional content ID | User activates instrumented link or button |
| `contact_success` | Allowlisted method | Backend confirms form submission or a booking provider confirms booking, when available |

Use session storage for a tab-scoped ID and rotate after 30 minutes without an observed event. Use in-memory state when storage fails. Reloads in the same tab generally retain the session. Browser storage restrictions, clearing storage, tab and device changes can fragment a journey. An opener can initially copy tab session storage, so use `noopener` on links opening another tab. Report observed sessions, with no claim about unique people or cross-device returns. [WHATWG Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html#the-sessionstorage-getter)

Use a monotonic clock for visible intervals and stop accumulation when the document hides. If adding active time, count the initial 30 seconds and extend the window after each local interaction while visible. Store only totals, with zero capture of input values. Visible time includes idle foreground time and interaction-gated time misses quiet reading. Send checkpoints about every 15 seconds while accumulating, then flush on `visibilitychange` to hidden. Use small Beacon batches, with keepalive fetch if Beacon cannot queue. Queue acceptance gives no server acknowledgment. Crashes, blockers, disabled JavaScript, and network failures can cause partial or missing journeys. [WHATWG Page Visibility](https://html.spec.whatwg.org/multipage/interaction.html#page-visibility), [W3C High Resolution Time](https://w3c.github.io/hr-time/), [W3C Beacon](https://w3c.github.io/beacon/)

Calculate scroll depth over the actual scrollable range using clamped scroll position divided by scroll height minus viewport height. Skip non-scrollable pages and recompute dimensions for layout changes. Use a separate element visibility event if the question is whether a specific project or CTA appeared on screen. Thresholds measure position, with no evidence of reading. [CSSOM View](https://drafts.csswg.org/cssom-view/#dom-element-scrollheight), [W3C Intersection Observer](https://www.w3.org/TR/intersection-observer/)

## Attribution and reporting

- Capture first-touch attribution per session in this order. Use approved campaign tags, then external referrer hostname, then direct/unknown. Keep the original attribution as visitors switch variants. Referrer policy and link behavior can suppress the referrer. [W3C Referrer Policy](https://www.w3.org/TR/referrer-policy/)
- Group by entry cohort, landing page, and source/campaign. Show observed sessions, top next steps and exits, median visible time, scroll reach, CTA intent rate, and confirmed inquiry rate where supported.
- Derive per-view duration from the maximum cumulative checkpoint, then sum those durations for session totals. Calculate conversion rate as observed sessions with at least one qualifying event divided by observed sessions in the segment. For page scroll reach, divide unique views reaching the threshold by scroll-eligible views if eligibility is collected. Otherwise label the denominator as all observed views.
- An email, booking, or resume click records intent. Count confirmed inquiry only on a successful submission recorded by the receiving system. Keep counts alongside rates so small cohorts remain interpretable.
- Automated traffic can inflate counts. Separate known previews or synthetic checks where identified. Treat automated activity that reaches the collector as a residual source of error. Missing events and filtered traffic can affect cohorts differently.

## Collection limits

Use a first-party collector and an authenticated read/export path for the dashboard. Validate finite schemas, bound payloads, and rate-limit ingestion. Keep campaign values on an allowlist of approved tokens. Omit arbitrary query strings and fragments, full referrers, contact contents, IP addresses and user agents from the analytics rows. Set a short raw-data retention window such as 90 days and check infrastructure logging separately. Keep session-only identifiers. Leave replay, fingerprints, and cross-device joins out of the contract. [W3C Privacy Principles](https://www.w3.org/TR/privacy-principles/)
