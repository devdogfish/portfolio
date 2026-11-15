import { isbot } from 'isbot'
import { after, type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { browserBatch, readAnalyticsJson } from '@/lib/analytics/intake'
import { analyticsOwnerCookie, analyticsVisitor, matchesAnalyticsOwner, sendAnalyticsBatch } from '@/lib/analytics/server'

export const runtime = 'nodejs'
export const maxDuration = 15
function sameOrigin(request: NextRequest) {
  const host = request.headers.get('host')
  return host !== null && request.headers.get('origin') === request.nextUrl.protocol + '//' + host
}

const ownerInput = z.object({ owner: z.string().min(1).max(256) }).strict()

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 })
  const visitor = analyticsVisitor(request.headers)
  if (visitor.excluded || isbot(request.headers.get('user-agent'))) return new Response(null, { status: 204 })

  const body = await readAnalyticsJson(request)
  if (body.status !== 200) return new Response(null, { status: body.status })
  const parsed = browserBatch.safeParse(body.value)
  if (!parsed.success) return new Response(null, { status: 400 })

  const events = parsed.data.events.map(event => ({ ...event, device: visitor.device, ip_id: visitor.ipId }))
  after(async () => {
    try {
      await sendAnalyticsBatch(events)
    } catch {
      console.warn('Portfolio analytics batch delivery failed')
    }
  })
  return new Response(null, { status: 202 })
}

export async function PUT(request: NextRequest) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 })
  const body = await readAnalyticsJson(request, 1024)
  if (body.status !== 200) return new Response(null, { status: body.status })
  const parsed = ownerInput.safeParse(body.value)
  if (!parsed.success || !matchesAnalyticsOwner(parsed.data.owner)) return new Response(null, { status: 403 })

  const response = new NextResponse(null, { status: 204 })
  response.cookies.set(analyticsOwnerCookie, '1', {
    httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 365 * 24 * 60 * 60,
  })
  return response
}
