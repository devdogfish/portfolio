import { resolveDestination } from '@/lib/link-catalog'
import { recordLinkOpen, trackedLinkRedirect } from '@/lib/tracked-link-opens'
import { lookupTrackedLink, validTrackedCode } from '@/lib/tracked-links'

type Context = { params: Promise<{ code: string; key?: string[] }> }

async function redirect(request: Request, { params }: Context) {
  const occurredAt = new Date()
  const { code, key = [] } = await params
  const destination = key.length === 1 ? resolveDestination(key[0]) : undefined
  const validCode = validTrackedCode(code) ? code : undefined
  recordLinkOpen(request, validCode, new URL(request.url).pathname, occurredAt, destination?.key)

  const row = validCode ? await lookupTrackedLink(validCode) : null
  return row
    ? trackedLinkRedirect(destination?.url ?? '/', row.code, row.track ?? undefined)
    : trackedLinkRedirect('/')
}

export const GET = redirect
export const HEAD = redirect
