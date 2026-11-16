import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { BookingForm } from '@/components/booking-form'
import { DocPage } from '@/components/page'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: 'Book a call',
  description: 'Pick a time for a 30-minute call. It’s confirmed straight away.',
  alternates: { canonical: '/book' },
}

// Read at request time so the bot-check key can change without a rebuild.
async function Booking() {
  await connection()
  const siteKey = process.env.TURNSTILE_SITE_KEY
  if (!siteKey) {
    return <p className="status">Booking is unavailable right now. Email me at <a href={`mailto:${site.email.client}`}>{site.email.client}</a> instead.</p>
  }
  return <BookingForm siteKey={siteKey} email={site.email.client} />
}

export default function BookPage() {
  return (
    <DocPage crumb="Book a call">
      <h1>Book a call</h1>
      <p className="lede">Pick a time for a 30-minute call. It’s confirmed straight away, and times are shown in your timezone.</p>
      <Suspense fallback={<p className="status booking-loading">Loading open times…</p>}>
        <Booking />
      </Suspense>
    </DocPage>
  )
}
