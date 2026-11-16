import type { Audience } from '@/lib/audience'
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

// Who the link was issued to. proxy.ts reads the cookie and serves that view at `/`.
const audienceOf = (row: TrackedLink | undefined): Audience | undefined =>
  row?.kind === 'application' ? row.track : undefined

// Where a bare link (no key) lands.
const landing = (row: TrackedLink | undefined) => (row?.kind === 'post' ? row.destinationPath : '/')

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
  return trackedLinkRedirect(destination?.url ?? landing(row), code, audienceOf(row))
}

export const GET = redirect
export const HEAD = redirect
