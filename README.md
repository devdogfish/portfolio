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

Every audience sees `/`; the address bar never says which version they got.

| Audience | Reached by |
| --- | --- |
| Balanced default | Direct visits, or no audience cookie |
| Prospective clients | `/r/<code>` with track `client` (or the old `/r/<code>/client`) |
| Hiring, `software` / `web-cms` / `admin-excel` | Résumé links with that track (applications without a track get `software`) |

`/r` sets an `audience` cookie (90 days, HttpOnly). `proxy.ts` rewrites `/` to the
prerendered `/v/<audience>` page for that cookie, and answers 404 to anyone asking for
`/v/*` directly. Project pages, `/writing`, `/contact` and `/privacy` are the same for
everyone. Page views of an audience version are recorded as `/`; the `via` code and the
CTA targets say which one it was.

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
404; if the registry is down the visitor lands on `/` with `via` and no audience. Every open, HEAD
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

## Writing

Posts are Markdown files in `content/writing/`. Each starts with frontmatter (`title`, `date` as YYYY-MM-DD, `summary`, `tags`), then the body. A post appears in the Recent Writing widget, at `/writing`, and at `/writing/<file name>`. The widget's eye button opens a preview. The first post is a draft written from the project notes: replace it with your own words.
