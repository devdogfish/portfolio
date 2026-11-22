import { connection } from 'next/server'
import { bookingConfigured } from '@/lib/booking/quantself'

export async function GET() {
  await connection()
  const siteKey = process.env.TURNSTILE_SITE_KEY || null
  const canBook = Boolean(siteKey && bookingConfigured())
  return Response.json({ siteKey, canBook }, { headers: { 'Cache-Control': 'no-store' } })
}
