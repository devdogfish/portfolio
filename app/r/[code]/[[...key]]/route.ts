import type { NextRequest } from 'next/server'
import { resolveDestination } from '@/lib/link-catalog'
import { recordLinkOpen, trackedLinkRedirect } from '@/lib/tracked-link-opens'
import { lookupTrackedLink, validTrackedCode } from '@/lib/tracked-links'

type Context = { params: Promise<{ code: string; key?: string[] }> }

async function redirect(request: NextRequest, { params }: Context) {
  const occurredAt = new Date()
  const { code, key = [] } = await params
  const destination = key.length <= 1 ? resolveDestination(key[0]) : undefined
  recordLinkOpen(request, occurredAt, code, destination?.key)

  const row = validTrackedCode(code) ? await lookupTrackedLink(code) : null
  if (!row || destination === undefined) return trackedLinkRedirect(request, '/', undefined, row?.track)
  return trackedLinkRedirect(request, destination?.url ?? '/', code, row.track)
}

export const GET = redirect
export const HEAD = redirect
