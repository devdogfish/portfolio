# Portfolio release — November 10, 2026

## Audience links

| Audience | Public entry link | Source |
| --- | --- | --- |
| Software engineering | https://girke.dev/r/85c0fac356 | resume-software |
| Web and CMS publishing | https://girke.dev/r/da393208fe | resume-web-cms |
| Admin and Excel | https://girke.dev/r/79ddb560ef | resume-admin-excel |
| Client services | https://girke.dev/r/67be457ba8 | kristina-footer |

Plain visits without an existing valid selection receive a balanced portfolio. Valid entry links replace the selection. Otherwise a valid cookie persists and is refreshed for 90 days. Cookies are host-only, HttpOnly, SameSite=Lax, and Secure under HTTPS. Entry content is rendered on the server before the browser replaces the URL with `/`. Entry routes are noindex. Codes affect public content only, never authorization.

The reusable registry is `lib/profiles.ts`; presentation content is `lib/portfolio-content.ts`. Shared facts and case studies live in `lib/data.ts`. Employer profiles change copy, project/experience order, skills, and the PDF link. The client profile emphasizes websites, business applications, and AI enablement. Résumé source files are untouched; public downloads are copies supplied by the user.

## Contact

Email is the available launch contact path. Cal.com setup and the inquiry backend remain deferred from the agreed two-hour scope. `BOOKING_URL` enables a booking action when the event is ready; it opens in a new tab. The intended public address is calendar.girke.dev; meet.girke.dev is reserved for Jitsi.

## Analytics

The portfolio sends bounded anonymous batches to its own `/api/events` endpoint. That route validates public paths/cohorts/CTA identifiers, enforces same-origin requests and a 32 KiB body limit, and forwards through a private credential to the Quantself relay. No credential appears in client JavaScript.

Umami provides the existing free analytics storage engine; Quantself supplies the owner dashboard. See `analytics-dashboard-handoff.md` and `research/` for setup and evidence. Event records include stable random event/session/page-view IDs, cohort, source, page, timestamps, cumulative visible/active milliseconds, scroll thresholds, and instrumented CTA clicks. The dashboard deduplicates sender event IDs and uses maximum cumulative engagement per page view.

Counts represent observed anonymous browser activity, not identified recruiters or application opens. One shared link per résumé type measures that group, not a specific employer. Email, booking, and résumé clicks measure intent, not a confirmed booking, delivered message, or read document. Browser clearing, blocking, crashes, and bots limit accuracy. DNT and GPC suppress collection. Selection persistence is separate from analytics storage.

## Verification

Run `bun run lint`, `bunx tsc --noEmit`, `bun run build`, and `bunx playwright test` with the app on port 3100 (or set PORTFOLIO_TEST_URL). Browser checks cover desktop/mobile, all five presentations, cookie precedence, no-JavaScript SSR, entry cleanup, PDFs, navigation, analytics retry/visibility/opt-out, and API validation. Production collection must be verified through the real receiver before reporting analytics live.
