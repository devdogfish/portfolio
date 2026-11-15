import type { Audience } from '@/lib/audience'
import { resolveDestination, staticEntryTrack } from '@/lib/link-catalog'
import { recordLinkOpen, trackedLinkHeaders, trackedLinkRedirect } from '@/lib/tracked-link-opens'
import { lookupTrackedLink, validTrackedCode, type TrackedLink } from '@/lib/tracked-links'

type Context = { params: Promise<{ code: string; key?: string[] }> }
const segment = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,99}$/

function missing(method: string) {
  const body = '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Link not found</title>' +
    '<body style="font:16px system-ui;padding:3rem;background:#0e1116;color:#e8e8ec"><h1>Link not found</h1>' +
    '<p><a style="color:inherit" href="/">Visit the portfolio</a></p></body></html>'
  return new Response(method === 'HEAD' ? null : body, { status: 404, headers: { ...trackedLinkHeaders, 'Content-Type': 'text/html; charset=utf-8' } })
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
  if (!validTrackedCode(code) || key.length > 4 || !key.every(part => segment.test(part))) return missing(request.method)

  // `/r/<code>/client` is printed on older client material; it now just picks the audience.
  const legacyClient = key.length === 1 && key[0] === 'client'
  const destination = legacyClient ? null : resolveDestination(key)
  if (destination === undefined) return missing(request.method)
  const staticTrack = key.length === 0 || legacyClient ? staticEntryTrack(code) : undefined
  const row: TrackedLink | null | undefined = staticTrack
    ? { code, kind: 'application', track: staticTrack }
    : await lookupTrackedLink(code)
  if (row === null) return missing(request.method)

  // Registry down (row undefined): still send the visitor somewhere useful, and log the open.
  recordLinkOpen(request, code, path, occurredAt, destination?.key)
  return trackedLinkRedirect(destination?.url ?? landing(row), code, legacyClient ? 'client' : audienceOf(row))
}

export const GET = redirect
export const HEAD = redirect
