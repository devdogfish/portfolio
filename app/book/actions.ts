'use server'

import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { z } from 'zod'
import { analyticsLinkCode } from '@/lib/analytics/intake'
import { analyticsVisitor, sendAnalyticsBatch } from '@/lib/analytics/server'
import { bookingHorizonDays, cancelMeeting, createMeeting, fetchAvailability, type Meeting } from '@/lib/booking/api'
import { verifyTurnstile } from '@/lib/booking/turnstile'

export type SlotsResult = { slots: string[] } | { error: 'challenge' | 'unavailable' }
export type BookingResult =
  | { status: 'booked'; meeting: Meeting }
  | { status: 'taken'; slots?: string[] }
  | { status: 'limited'; retryAfter?: number }
  | { status: 'invalid' | 'challenge' | 'failed' }
export type CancelResult = { status: 'cancelled' | 'missing' | 'limited' | 'challenge' | 'failed' }

const day = 24 * 60 * 60 * 1000
const bookingInput = z.object({
  turnstile: z.string().min(1).max(2048),
  key: z.string().uuid(),
  start: z.string().datetime({ offset: true }),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  note: z.string().trim().max(1000).optional(),
  link_code: z.string().optional(),
})

async function visitorIp() {
  const list = await headers()
  return (list.get('x-vercel-forwarded-for') ?? list.get('x-forwarded-for') ?? '').split(',')[0].trim() || null
}

async function openSlots() {
  const now = new Date()
  return fetchAvailability(now, new Date(now.getTime() + bookingHorizonDays * day))
}

export async function loadSlots(turnstile: string): Promise<SlotsResult> {
  if (!await verifyTurnstile(turnstile, await visitorIp())) return { error: 'challenge' }
  try {
    return { slots: await openSlots() }
  } catch {
    return { error: 'unavailable' }
  }
}

export async function bookSlot(raw: z.input<typeof bookingInput>): Promise<BookingResult> {
  const input = bookingInput.safeParse(raw)
  if (!input.success) return { status: 'invalid' }
  const { turnstile, key, start, name, email, note, link_code } = input.data
  if (Date.parse(start) <= Date.now()) return { status: 'invalid' }
  if (!await verifyTurnstile(turnstile, await visitorIp())) return { status: 'challenge' }

  let result
  try {
    result = await createMeeting({ start, name, email, ...(note ? { note } : {}) }, key)
  } catch {
    return { status: 'failed' }
  }
  if (result.status === 'taken') {
    // Same verified request: hand back fresh slots so the visitor can pick again.
    try {
      return { status: 'taken', slots: await openSlots() }
    } catch {
      return { status: 'taken' }
    }
  }
  if (result.status !== 'booked') return result

  const occurredAt = new Date()
  const visitor = analyticsVisitor(await headers(), occurredAt)
  if (!visitor.excluded) {
    const code = analyticsLinkCode.safeParse(link_code)
    after(async () => {
      try {
        await sendAnalyticsBatch([{
          id: randomUUID(), occurred_at: occurredAt.toISOString(), path: '/book', kind: 'booking:confirm',
          link_code: code.success ? code.data : undefined, ip_id: visitor.ipId, device: visitor.device,
          props: { minutes: 30 },
        }])
      } catch {
        console.warn('Portfolio booking analytics delivery failed')
      }
    })
  }
  return result
}

export async function cancelBooking(token: string, turnstile: string): Promise<CancelResult> {
  if (typeof token !== 'string' || !/^[A-Za-z0-9._~-]{1,512}$/.test(token)) return { status: 'missing' }
  if (!await verifyTurnstile(turnstile, await visitorIp())) return { status: 'challenge' }
  try {
    return { status: await cancelMeeting(token) }
  } catch {
    return { status: 'failed' }
  }
}
