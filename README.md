# girke.dev

Portfolio v2. Next.js 16 (App Router, Cache Components) on the ATOM63 design system
(`@atom63/ui-react`, `@atom63/styles`, `@atom63/widgets`). Published pages are
prerendered. Tracked redirects and API endpoints can run per request.

The v1 site is kept for reference under the `v1-legacy` tag (`git show v1-legacy:<path>`).

```sh
npm ci
npm run dev        # http://localhost:3000
npm run build      # check the route table for prerendered pages
```

## Views

Every audience sees `/`; the address bar never says which version they got.

| View | Live link | Source |
| --- | --- | --- |
| Client | [Open client view](https://girke.dev/r/HYXkxh54) | Registered share found in the [Kristina Girke site footer](https://www.kristinagirke.com/) |
| Web / CMS | [Open Web / CMS view](https://girke.dev/r/XWfAJN61) | `Web / CMS portfolio view` share, registered with track `web-cms` |
| Backend | [Open backend view](https://girke.dev/r/5tLEXzEtz8HKM9h3) | Legacy Software résumé application |
| Admin / Excel | [Open Admin / Excel view](https://girke.dev/r/379dd726bdcb21047356828a) | Admin / Excel résumé application |
| Default | [Reset to the default view](https://girke.dev/r/reset) | Clears the saved `audience` cookie |

From the Owner's tailnet, find current links in [Quantself Job Search analytics](https://qs.girke.dev/website-analytics/job-search).
The [report API](https://qs.girke.dev/api/v1/website-analytics/job-search) lists shares in
`shares[]` by `title` and `code`. Build a share URL as `https://girke.dev/r/<code>`.
For résumé links, match `applications[].resume` to the track and use its `portfolioUrl`.
Opens of résumé links count toward the corresponding application.

To verify a link, follow its redirect with cookies enabled. Check the `Set-Cookie: audience=…`
header and final page title. Unknown codes and registry outages can also redirect to `/` with
the default view.

Tracked links with a track set an `audience` cookie (90 days, HttpOnly). `proxy.ts` rewrites `/` to the
prerendered `/v/<audience>` page for that cookie, and answers 404 to anyone asking for
`/v/*` directly. Project pages, `/writing`, `/contact` and `/privacy` are the same for
everyone. Page views of an audience version are recorded as `/`; the `via` code and the
CTA targets say which one it was.

Employer tracks inherit the default copy and sections. Each track ranks the project gallery
and walkthroughs for its audience. Each employer track has its own downloadable résumé. Résumé links switch the closing action to booking a call.

## Where to edit

- `content/views.ts`: all page copy, per view and per track.
- `content/projects.ts`: projects, jobs, and which have cover images (`public/projects/`).
- `content/personal.ts`: films, albums, playlist, writing, logos, featured repo. Empty
  lists hide their section.
- `content/site.ts`: name, emails, links, location.

## Tracked links (`/r/<code>[/<key>]`)

Applications get one code per résumé. Shares get one code per placement, such as a
website footer. Both use the registered track to pick the homepage view. Run
`bun run links:share --title "<placement>" --track client` in Quantself to create a
client share. Omit `--track` to show the default view.

Bare links go to `/`. An optional flat key from `GET /api/links` selects a destination.
Local destinations receive `?via=<code>` for analytics. An unknown key falls back to
`/` with the registered track. Unknown or malformed codes and registry outages fall
back to the default view. Opens, including HEAD requests, are logged after the
response, subject to analytics opt-out.

## Analytics

`lib/analytics/tracker.ts` (under 2 KB gzipped, no dependencies) starts on idle, sends one
batched POST to `/api/e` at most every 10 s plus a beacon on leave. CTAs are marked with
`data-track="cta:<name>"`. GPC and Do Not Track turn it off entirely.

### Stop counting your own visits

Do this once on each browser you use (laptop, phone, work machine):

1. Open `https://girke.dev/?owner=<OWNER_TRACKING_SECRET>`.
2. The parameter disappears from the address bar. That browser now sends nothing.

It also sets a server cookie, so contact-form submissions from that browser are not
counted either. Each browser app keeps its own flag: on a phone, do it in Safari and in
any other browser you use there. Private windows forget it when closed. Safari clears site
storage after about 7 days without a visit, so redo it if you have not opened the site in
a while. Clearing site data undoes it. `ANALYTICS_EXCLUDED_IPS` also drops your home and
office IPs on the server.

## Tests

```bash
npm run build && npm test
```

The Playwright specs in `tests/` start the built site against local fixture APIs. They
cover tracked-link redirects and the tracker (views, CTA clicks, engagement on hide, `via`
across pages, owner opt-out, requests per page).

## Environment (Vercel, server only)

See `.env.example`. `QUANTSELF_INGEST_URL`, `QUANTSELF_INGEST_TOKEN`, `TRACKED_LINKS_URL`,
`TRACKED_LINKS_TOKEN`, `ANALYTICS_IP_KEY`, `ANALYTICS_EXCLUDED_IPS`, `OWNER_TRACKING_SECRET`,
`BOOKING_API_URL`, `BOOKING_API_TOKEN`, `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.

## Booking

`/book` lists open 30-minute slots in the visitor's timezone and books one instantly.
`/book/cancel/<token>` cancels. The prerendered pages load the public Turnstile site
key from `/api/booking-config`. Both call the booking API only from server actions
(`app/book/actions.ts`), after verifying a Cloudflare Turnstile token, so the API token
never reaches the browser. Set the production `BOOKING_API_URL` to
`https://gate.tail555ca5.ts.net` and send the `meetings:book` key in `X-API-Key`.

## Writing

Posts are Markdown files in `content/writing/`. Each starts with frontmatter (`title`, `date` as YYYY-MM-DD, `summary`, `tags`), then the body. A post appears in the Recent Writing widget, at `/writing`, and at `/writing/<file name>`. The widget's eye button opens a preview. The first post is a draft written from the project notes: replace it with your own words.
