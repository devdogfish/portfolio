// Server imports only. The booking API token must never reach a browser bundle.
import { z } from 'zod'

export const bookingHorizonDays = 28
const slotsBody = z.object({ slots: z.array(z.string().datetime({ offset: true })) })
const meetingBody = z.object({
  id: z.string().min(1),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }),
})

export type Meeting = z.infer<typeof meetingBody>
export type MeetingInput = { start: string; name: string; email: string; note?: string }
export type BookResult =
  | { status: 'booked'; meeting: Meeting }
  | { status: 'taken' }
  | { status: 'limited'; retryAfter?: number }
  | { status: 'failed' }

function endpoint(path: string) {
  const base = process.env.BOOKING_API_URL
  const token = process.env.BOOKING_API_TOKEN
  if (!base || !token) throw new Error('Booking API is not configured')
  const url = new URL(path, base.endsWith('/') ? base : base + '/')
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) throw new Error('Invalid booking API origin')
  return { url, token }
}

async function call(path: string, init: { method: 'GET' | 'POST'; body?: unknown; headers?: Record<string, string> }) {
  const { url, token } = endpoint(path)
  return fetch(url, {
    method: init.method,
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(8_000),
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
}

/** Open 30-minute slot starts between `from` and `to`, sorted and in the future. */
export async function fetchAvailability(from: Date, to: Date): Promise<string[]> {
  const query = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() })
  const response = await call(`api/v1/meetings/availability?${query}`, { method: 'GET' })
  if (!response.ok) throw new Error(`Booking availability failed (${response.status})`)
  const { slots } = slotsBody.parse(await response.json())
  const now = Date.now()
  return [...new Set(slots)]
    .filter(slot => Date.parse(slot) > now)
    .sort((a, b) => Date.parse(a) - Date.parse(b))
}

export async function createMeeting(input: MeetingInput, idempotencyKey: string): Promise<BookResult> {
  const response = await call('api/v1/meetings', {
    method: 'POST', body: input, headers: { 'Idempotency-Key': idempotencyKey },
  })
  if (response.status === 409) return { status: 'taken' }
  if (response.status === 429) {
    const seconds = Number(response.headers.get('retry-after'))
    return { status: 'limited', retryAfter: Number.isFinite(seconds) && seconds > 0 ? seconds : undefined }
  }
  if (response.status !== 201 && response.status !== 200) return { status: 'failed' }
  const meeting = meetingBody.safeParse(await response.json().catch(() => null))
  return meeting.success ? { status: 'booked', meeting: meeting.data } : { status: 'failed' }
}

export async function cancelMeeting(token: string): Promise<'cancelled' | 'missing' | 'limited' | 'failed'> {
  const response = await call('api/v1/meetings/cancel', { method: 'POST', body: { token } })
  if (response.ok) return 'cancelled'
  if (response.status === 404) return 'missing'
  if (response.status === 429) return 'limited'
  return 'failed'
}
