// Server imports only. Node crypto and the ingest token stay out of browser bundles.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { normalizeIp } from './ip'
import { analyticsMaxBytes, analyticsMaxEvents, type AnalyticsEvent, type AnalyticsInquiry } from './contract'

type AnalyticsVisitor = {
  excluded: boolean
  device: 'desktop' | 'mobile'
  ipId?: string
}

export const analyticsOwnerCookie = 'analytics_owner'

export function analyticsVisitor(headers: Headers, occurredAt = new Date()): AnalyticsVisitor {
  const device = /Android|iPhone|iPad|iPod|Mobile/i.test(headers.get('user-agent') ?? '') ? 'mobile' : 'desktop'
  if (headers.get('dnt') === '1' || headers.get('sec-gpc') === '1' ||
      headers.get('cookie')?.split(';').some(cookie => cookie.trim() === analyticsOwnerCookie + '=1')) {
    return { excluded: true, device }
  }

  if (process.env.VERCEL !== '1') return { excluded: false, device } as const

  const ip = normalizeIp(headers.get('x-vercel-forwarded-for') ?? '')
  if (!ip || (process.env.ANALYTICS_EXCLUDED_IPS ?? '').split(',').some(value => normalizeIp(value) === ip)) {
    return { excluded: true, device } as const
  }

  const key = process.env.ANALYTICS_IP_KEY
  return {
    excluded: false,
    device,
    ipId: key ? createHmac('sha256', key).update(`${occurredAt.toISOString().slice(0, 10)}|${ip}`).digest('hex') : undefined,
  } as const
}

export function matchesAnalyticsOwner(value: string) {
  const secret = process.env.OWNER_TRACKING_SECRET
  if (!secret) return false
  const supplied = Buffer.from(value)
  const expected = Buffer.from(secret)
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}

export async function sendAnalyticsBatch(events: readonly AnalyticsEvent[]) {
  if (!events.length) return
  if (events.length > analyticsMaxEvents) throw new Error('Analytics batch has too many events')

  const bodies: string[] = []
  const prefix = '{"events":['
  const suffix = ']}'
  let payload = prefix
  let bytes = prefix.length + suffix.length
  for (const event of events) {
    const json = JSON.stringify(event)
    const jsonBytes = Buffer.byteLength(json)
    if (jsonBytes + prefix.length + suffix.length > analyticsMaxBytes) {
      throw new Error('Analytics event is too large')
    }
    if (bytes + jsonBytes + (payload === prefix ? 0 : 1) > analyticsMaxBytes) {
      bodies.push(payload + suffix)
      payload = prefix
      bytes = prefix.length + suffix.length
    }
    if (payload !== prefix) {
      payload += ','
      bytes++
    }
    payload += json
    bytes += jsonBytes
  }
  bodies.push(payload + suffix)
  for (const body of bodies) await postAnalytics('events', body)
}

export function sendAnalyticsInquiry(inquiry: AnalyticsInquiry) {
  return postAnalytics('inquiries', JSON.stringify(inquiry))
}

async function postAnalytics(endpoint: 'events' | 'inquiries', body: string) {
  const origin = process.env.QUANTSELF_INGEST_URL
  const token = process.env.QUANTSELF_INGEST_TOKEN
  if (!origin || !token) throw new Error('Analytics intake is unavailable')
  const url = new URL(`/api/v1/website-analytics/${endpoint}`, origin)
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
    throw new Error('Invalid analytics intake origin')
  }
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(5_000),
    headers: { 'Content-Type': 'application/json', 'X-API-Key': token },
    body,
  })
  if (response.status !== 202) throw new Error('Analytics intake refused the request')
}
