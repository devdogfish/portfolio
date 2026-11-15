import { site } from '@/content/site'
import { resolveDestination } from '@/lib/link-catalog'
import { recordLinkOpen } from '@/lib/tracked-link-opens'
import { lookupTrackedLink, trackedCode, type TrackedLink } from '@/lib/tracked-links'

type Context = { params: Promise<{ code: string; key?: string[] }> }
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' }
const segment = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,99}$/

function missing(method: string) {
  const body = '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Link not found</title>' +
    '<body style="font:16px system-ui;padding:3rem;background:#0e1116;color:#e8e8ec"><h1>Link not found</h1>' +
    '<p><a style="color:inherit" href="/">Visit the portfolio</a></p></body></html>'
  return new Response(method === 'HEAD' ? null : body, { status: 404, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } })
}

// Where a bare link (no key) lands: the view its audience was issued for.
function landing(row: TrackedLink | undefined) {
  if (!row) return '/'
  if ('destinationPath' in row) return row.destinationPath
  if (row.track === 'client') return '/client'
  if (row.track === 'software') return '/employer'
  if (row.track) return `/employer/${row.track}`
  return row.kind === 'application' ? '/employer' : '/'
}

async function redirect(request: Request, { params }: Context) {
  const occurredAt = new Date()
  const { code, key = [] } = await params
  const path = ['/r', code, ...key].join('/')
  if (!trackedCode.test(code) || key.length > 4 || !key.every(part => segment.test(part))) return missing(request.method)

  const destination = resolveDestination(key)
  if (destination === undefined) return missing(request.method)
  const row = await lookupTrackedLink(code)
  if (row === null) return missing(request.method)

  // Registry down (row undefined): still send the visitor somewhere useful, and log the open.
  const target = new URL(destination ? destination.url : landing(row), site.origin)
  let location = target.href
  if (target.origin === site.origin) {
    target.searchParams.set('via', code)
    location = target.pathname + target.search + target.hash
  }
  recordLinkOpen(request, code, path, occurredAt, destination?.key)
  return new Response(null, { status: 307, headers: { ...headers, Location: location } })
}

export const GET = redirect
export const HEAD = redirect
