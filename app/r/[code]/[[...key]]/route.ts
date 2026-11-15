import { site } from '@/content/site'
import { AUDIENCE_COOKIE, AUDIENCE_MAX_AGE, type Audience } from '@/lib/audience'
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

// Who the link was issued to. proxy.ts reads the cookie and serves that view at `/`.
function audienceOf(row: TrackedLink | undefined): Audience | undefined {
  if (!row || 'destinationPath' in row) return undefined
  return row.track ?? (row.kind === 'application' ? 'software' : undefined)
}

// Where a bare link (no key) lands.
const landing = (row: TrackedLink | undefined) => (row && 'destinationPath' in row ? row.destinationPath : '/')

async function redirect(request: Request, { params }: Context) {
  const occurredAt = new Date()
  const { code, key = [] } = await params
  const path = ['/r', code, ...key].join('/')
  if (!trackedCode.test(code) || key.length > 4 || !key.every(part => segment.test(part))) return missing(request.method)

  // `/r/<code>/client` is printed on older client material; it now just picks the audience.
  const legacyClient = key.length === 1 && key[0] === 'client'
  const destination = legacyClient ? null : resolveDestination(key)
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
  const response = new Response(null, { status: 307, headers: { ...headers, Location: location } })
  const audience = legacyClient ? 'client' : audienceOf(row)
  if (audience) {
    response.headers.append('Set-Cookie', `${AUDIENCE_COOKIE}=${audience}; Path=/; Max-Age=${AUDIENCE_MAX_AGE}; SameSite=Lax; Secure; HttpOnly`)
  }
  return response
}

export const GET = redirect
export const HEAD = redirect
