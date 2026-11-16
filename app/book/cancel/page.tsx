import type { Metadata } from 'next'
import { BookingPanel } from '@/components/booking-panel'
import { DocPage } from '@/components/page'
import { site } from '@/content/site'

// The token is a secret: keep it out of search results and out of Referer headers
// sent to the bot-check script.
export const metadata: Metadata = {
  title: 'Cancel your call',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function CancelPage() {
  return (
    <DocPage crumb="Cancel">
      <h1>Cancel your call</h1>
      <BookingPanel mode="cancel" email={site.email.client} />
    </DocPage>
  )
}
