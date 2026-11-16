import type { Metadata } from 'next'
import { BookingPanel } from '@/components/booking-panel'
import { DocPage } from '@/components/page'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: 'Book a call',
  description: 'Pick a time for a 30-minute call. It’s confirmed straight away.',
  alternates: { canonical: '/book' },
}

export default function BookPage() {
  return (
    <DocPage crumb="Book a call">
      <h1>Book a call</h1>
      <p className="lede">Pick a time for a 30-minute call. It’s confirmed straight away, and times are shown in your timezone.</p>
      <BookingPanel mode="book" email={site.email.client} />
    </DocPage>
  )
}
