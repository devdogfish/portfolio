# Release verification — November 10, 2026

## Portfolio

- Production: https://girke.dev
- Verified deployment: `dpl_D7oRG6kga3fWNyMfzo3hpsZ21e4e` (Next.js 16.4.6), promoted successfully.
- `www.girke.dev` and both legacy `luigigirke.com` hosts redirect to `girke.dev` with 308.
- Build, ESLint and TypeScript passed.
- 18 local production-build Playwright tests passed, including analytics validation, delivery retry, timing and privacy signals.
- 12 production Playwright tests passed across all five profiles and mobile/desktop sizes, no-JavaScript SSR, cookie precedence, metadata, PDFs, and navigation.
- Live entry responses set Secure, HttpOnly, SameSite=Lax cookies with 90-day lifetimes; personalized HTML is private/no-store and entry paths are noindex.
- A real browser used the live Web/CMS link, opened the RBC case study, and received two HTTP 200 analytics batch acknowledgments.

## Referral site

Kristina Girke production deployment `dpl_GGa2VHsn7y3WxNbWpBn5tEvaHvQg`, commit `b57826f1afadbb1c203572512b06883e044edb59`, contains only the footer href change. Live HTML was checked for `https://girke.dev/r/67be457ba8`. Unrelated local changes were preserved.

## Analytics integration

Public receiver: `https://dashboard.girke.dev/api/v1/website-analytics/events`. It rejects anonymous requests with 401. The portfolio sends its private credential server-side; staging and live HTTP 200 acknowledgments were observed. Umami and its database are private services on the existing host.

The separate Quantself task owns dashboard implementation, raw export, exact persisted-row verification, test-traffic cleanup, and its restart instructions. See `analytics-dashboard-handoff.md` for its final current state.
