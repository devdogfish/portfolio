// Server imports only: the booking token must never reach a browser bundle.
//
// The same file lives in the portfolio and dawnshiftagency.com. Keep both copies identical.
// The Quantself API owns every booking rule (ADR 0053): open slots, horizon, Turnstile checks, conflicts,
// fresh slots after a conflict, rate limits, emails and the site's cancel link. This file only forwards.

export type Meeting = { id: string; start: string; end: string }
export type BookingInput = { start: string; name: string; email: string; note?: string }
/** The visitor's Turnstile token and IP, for booking and cancelling. Turnstile tokens are single-use. */
export type Visitor = { turnstile: string; ip: string | null }

export type SlotsResult = { slots: string[] } | { error: 'unavailable' }
export type BookResult =
  | { status: 'booked'; meeting: Meeting }
  | { status: 'taken'; slots?: string[] }
  | { status: 'limited'; retryAfter?: number }
  | { status: 'invalid' | 'challenge' | 'failed' }
export type CancelResult = { status: 'cancelled' | 'missing' | 'limited' | 'challenge' | 'failed' }

const loopback = ['127.0.0.1', 'localhost', '[::1]']
const isoInstant = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const cancelToken = /^[A-Za-z0-9_-]{43}$/

/** True when the site has what it needs to call Quantself. The Turnstile site key is the page's own concern. */
export function bookingConfigured() {
  return Boolean(process.env.BOOKING_API_URL && process.env.BOOKING_API_TOKEN)
}

/** The first forwarded address, as Vercel reports it. */
export function visitorIp(headers: Headers) {
  return (headers.get('x-vercel-forwarded-for') ?? headers.get('x-forwarded-for') ?? '').split(',')[0]!.trim() || null
}

function endpoint(path: string) {
  const base = process.env.BOOKING_API_URL
  const token = process.env.BOOKING_API_TOKEN
  if (!base || !token) throw new Error('Booking API is not configured')
  const url = new URL(path, base.endsWith('/') ? base : base + '/')
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback.includes(url.hostname))) {
    throw new Error('Invalid booking API origin')
  }
  return { url, token }
}

function usableTurnstile(token: unknown): token is string {
  return typeof token === 'string' && token.length > 0 && token.length <= 2048
}

async function call(path: string, visitor: Visitor | null, init: { method: 'GET' | 'POST'; body?: unknown; headers?: Record<string, string> }) {
  const { url, token } = endpoint(path)
  const response = await fetch(url, {
    method: init.method,
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
    headers: {
      'X-API-Key': token,
      ...(visitor ? { 'X-Turnstile-Token': visitor.turnstile } : {}),
      ...(visitor?.ip ? { 'X-Visitor-IP': visitor.ip } : {}),
      Accept: 'application/json',
      ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const body: unknown = await response.json().catch(() => null)
  const code = typeof body === 'object' && body && 'code' in body ? String(body.code) : null
  return { status: response.status, body, code, retryAfter: Number(response.headers.get('retry-after')) }
}

function slotList(body: unknown) {
  const slots = typeof body === 'object' && body && 'slots' in body ? body.slots : null
  return Array.isArray(slots) && slots.every(slot => typeof slot === 'string' && isoInstant.test(slot)) ? slots as string[] : null
}

function meeting(body: unknown): Meeting | null {
  if (typeof body !== 'object' || !body) return null
  const { id, start, end } = body as Record<string, unknown>
  return typeof id === 'string' && id && typeof start === 'string' && isoInstant.test(start) && typeof end === 'string' && isoInstant.test(end)
    ? { id, start, end }
    : null
}

/** Open 30-minute slot starts within the Owner's booking horizon, sorted. Reading needs no visitor check. */
export async function loadSlots(): Promise<SlotsResult> {
  try {
    const response = await call('api/v1/meetings/availability', null, { method: 'GET' })
    const slots = response.status === 200 ? slotList(response.body) : null
    return slots ? { slots } : { error: 'unavailable' }
  } catch {
    return { error: 'unavailable' }
  }
}

/** Books a slot. `key` is a UUID the page keeps for one booking attempt, so a retry never books twice. */
export async function bookSlot(input: BookingInput, key: string, visitor: Visitor): Promise<BookResult> {
  const name = input.name?.trim() ?? ''
  const email = input.email?.trim() ?? ''
  const note = input.note?.trim()
  if (!uuid.test(key) || !isoInstant.test(input.start ?? '') || Date.parse(input.start) <= Date.now() ||
    !name || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || (note?.length ?? 0) > 1000) {
    return { status: 'invalid' }
  }
  if (!usableTurnstile(visitor.turnstile)) return { status: 'challenge' }
  try {
    const response = await call('api/v1/meetings', visitor, {
      method: 'POST',
      body: { start: input.start, name, email, ...(note ? { note } : {}) },
      headers: { 'Idempotency-Key': key },
    })
    if (response.status === 201 || response.status === 200) {
      const booked = meeting(response.body)
      return booked ? { status: 'booked', meeting: booked } : { status: 'failed' }
    }
    if (response.code === 'SLOT_UNAVAILABLE') {
      const slots = slotList(response.body)
      return slots ? { status: 'taken', slots } : { status: 'taken' }
    }
    if (response.code === 'CHALLENGE_FAILED') return { status: 'challenge' }
    if (response.status === 429) {
      return { status: 'limited', retryAfter: Number.isFinite(response.retryAfter) && response.retryAfter > 0 ? response.retryAfter : undefined }
    }
    if (response.status === 400) return { status: 'invalid' }
    return { status: 'failed' }
  } catch {
    return { status: 'failed' }
  }
}

/** Cancels the meeting behind a guest's emailed cancel link. */
export async function cancelBooking(token: string, visitor: Visitor): Promise<CancelResult> {
  if (typeof token !== 'string' || !cancelToken.test(token)) return { status: 'missing' }
  if (!usableTurnstile(visitor.turnstile)) return { status: 'challenge' }
  try {
    const response = await call('api/v1/meetings/cancel', visitor, { method: 'POST', body: { token } })
    if (response.status === 200) return { status: 'cancelled' }
    if (response.code === 'CHALLENGE_FAILED') return { status: 'challenge' }
    if (response.status === 404) return { status: 'missing' }
    if (response.status === 429) return { status: 'limited' }
    return { status: 'failed' }
  } catch {
    return { status: 'failed' }
  }
}
