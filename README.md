# girke.dev

Portfolio v2. Next.js 16 (App Router, Cache Components) on the ATOM63 design system
(`@atom63/ui-react`, `@atom63/styles`, `@atom63/widgets`). Every page is prerendered;
only `/r/*` and `/api/e` run per request.

The v1 site is kept for reference under the `v1-legacy` tag (`git show v1-legacy:<path>`).

```sh
npm ci
npm run dev        # http://localhost:3000
npm run build      # check the route table: ○ everywhere except /r and /api/e
```

## Views

| Path | Audience | Reached by |
| --- | --- | --- |
| `/` | Balanced default | Direct visits |
| `/client` | Prospective clients | Client links, `/r/<code>` with track `client` |
| `/employer` | Hiring, software track | Résumé links with track `software` |
| `/employer/web-cms`, `/employer/admin-excel` | Hiring, other tracks | Résumé links with that track |

The employer tracks share components and facts; they only change the headline, focus
card, project order and notes, job order, skills, and résumé PDF.

## Where to edit

- `content/views.ts`: all page copy, per view and per track.
- `content/projects.ts`: projects, jobs, and which have cover images (`public/projects/`).
- `content/personal.ts`: films, albums, playlist, writing, logos, featured repo. Empty
  lists hide their section.
- `content/site.ts`: name, emails, links, location.

## Tracked links (`/r/<code>[/<key>]`)

Looks up the code in Quantself's registry (cached for days per code), then answers 307
with `?via=<code>` on local destinations. Keys come from `GET /api/links`. Unknown codes
404; if the registry is down the visitor lands on `/` with `via`. Every open, HEAD
included, is sent to Quantself after the response.

## Analytics

`lib/analytics/tracker.ts` (under 2 KB gzipped, no dependencies) starts on idle, sends one
batched POST to `/api/e` at most every 10 s plus a beacon on leave. CTAs are marked with
`data-track="cta:<name>"`. GPC and Do Not Track turn it off entirely.

### Stop counting your own visits

Do this once on each browser you use (laptop, phone, work machine):

1. Open `https://girke.dev/?owner=<OWNER_TRACKING_SECRET>`.
2. The parameter disappears from the address bar. That browser now sends nothing.

Clearing site data undoes it. `ANALYTICS_EXCLUDED_IPS` also drops your home and office
IPs on the server.

## Environment (Vercel, server only)

See `.env.example`. `QUANTSELF_INGEST_URL`, `QUANTSELF_INGEST_TOKEN`, `TRACKED_LINKS_URL`,
`TRACKED_LINKS_TOKEN`, `ANALYTICS_IP_KEY`, `ANALYTICS_EXCLUDED_IPS`, `OWNER_TRACKING_SECRET`,
and optionally `BOOKING_URL`.
