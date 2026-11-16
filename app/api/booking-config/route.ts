import { connection } from 'next/server'

export async function GET() {
  await connection()
  const siteKey = process.env.TURNSTILE_SITE_KEY || null
  const canBook = Boolean(siteKey && process.env.TURNSTILE_SECRET_KEY && process.env.BOOKING_API_URL && process.env.BOOKING_API_TOKEN)
  return Response.json({ siteKey, canBook }, { headers: { 'Cache-Control': 'no-store' } })
}
