import { isAudience, type Audience } from '@/lib/audience'
import { resolveDestination } from '@/lib/link-catalog'
import { recordLinkOpen, trackedLinkHeaders, trackedLinkRedirect } from '@/lib/tracked-link-opens'
import { lookupTrackedLink, validTrackedCode, type TrackedLink } from '@/lib/tracked-links'

type Context = { params: Promise<{ code: string; key?: string[] }> }

function missing(method: string) {
  const body = '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Link not found</title>' +
    '<body style="font:16px system-ui;padding:3rem;background:#0e1116;color:#e8e8ec"><h1>Link not found</h1>' +
    '<p><a style="color:inherit" href="/">Visit the portfolio</a></p></body></html>'
  return new Response(method === 'HEAD' ? null : body, { status: 404, headers: { ...trackedLinkHeaders, 'Content-Type': 'text/html; charset=utf-8' } })
}

// Where a bare link lands, and which view `/` then shows (proxy.ts reads the cookie).
// Applications pick the view by résumé track. A post whose destination is a view
// path (`/v/client`) lands on `/` with that view; any other post lands on its path.
function landing(row: TrackedLink | undefined): { path: string; audience?: Audience } {
  if (row?.kind === 'application') return { path: '/', audience: row.track }
  if (row?.kind !== 'post') return { path: '/' }
  const view = row.destinationPath.match(/^\/v\/([a-z-]+)$/)?.[1]
  return isAudience(view) ? { path: '/', audience: view } : { path: row.destinationPath }
}

async function redirect(request: Request, { params }: Context) {
  const occurredAt = new Date()
  const { code, key = [] } = await params
  const path = ['/r', code, ...key].join('/')
  if (!validTrackedCode(code) || key.length > 1) return missing(request.method)
  const destination = resolveDestination(key[0])
  if (destination === undefined) return missing(request.method)

  const row = await lookupTrackedLink(code)
  if (row === null) return missing(request.method)

  // Registry down (row undefined): still send the visitor somewhere useful, and log the open.
  recordLinkOpen(request, code, path, occurredAt, destination?.key)
  const { path: home, audience } = landing(row)
  return trackedLinkRedirect(destination?.url ?? home, code, audience)
}

export const GET = redirect
export const HEAD = redirect
