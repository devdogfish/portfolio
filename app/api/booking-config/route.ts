import { connection } from 'next/server'
import { bookingConfigured } from '@/lib/booking/quantself'

function visitorLocation(headers: Headers) {
  const encodedCity = headers.get('x-vercel-ip-city')
  const timeZone = headers.get('x-vercel-ip-timezone')
  if (!encodedCity || !timeZone) return null

  try {
    const city = decodeURIComponent(encodedCity).trim()
    return city && !/\p{Cc}/u.test(city) ? { city, timeZone } : null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  await connection()
  const siteKey = process.env.TURNSTILE_SITE_KEY || null
  const canBook = Boolean(siteKey && bookingConfigured())
  const location = visitorLocation(request.headers)
  return Response.json({ siteKey, canBook, location }, { headers: { 'Cache-Control': 'no-store' } })
}
