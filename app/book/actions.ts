'use server'

import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { analyticsLinkCode } from '@/lib/analytics/intake'
import { analyticsVisitor, sendAnalyticsBatch } from '@/lib/analytics/server'
import * as booking from '@/lib/booking/quantself'

// Quantself owns booking rules and the Turnstile check (lib/booking/quantself.ts). This file adds only analytics.
export type SlotsResult = booking.SlotsResult
export type BookingResult = booking.BookResult
export type CancelResult = booking.CancelResult
export type BookingInput = booking.BookingInput & { turnstile: string; key: string; link_code?: string }

async function visitor(turnstile: string): Promise<booking.Visitor> {
  return { turnstile, ip: booking.visitorIp(await headers()) }
}

/** Open times. Reading needs no Turnstile token, so the page shows them without waiting for the check. */
export async function loadSlots(): Promise<SlotsResult> {
  return booking.loadSlots()
}

export async function bookSlot({ turnstile, key, link_code, ...input }: BookingInput): Promise<BookingResult> {
  const result = await booking.bookSlot(input, key, await visitor(turnstile))
  if (result.status !== 'booked') return result

  const occurredAt = new Date()
  const analytics = analyticsVisitor(await headers(), occurredAt)
  if (!analytics.excluded) {
    const code = analyticsLinkCode.safeParse(link_code)
    after(async () => {
      try {
        await sendAnalyticsBatch([{
          id: randomUUID(), occurred_at: occurredAt.toISOString(), path: '/book', kind: 'booking:confirm',
          link_code: code.success ? code.data : undefined, ip_id: analytics.ipId, device: analytics.device,
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
  return booking.cancelBooking(token, await visitor(turnstile))
}
