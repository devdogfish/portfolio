import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { CancelBooking } from '@/components/cancel-booking'
import { DocPage } from '@/components/page'
import { site } from '@/content/site'

// The token is a secret: keep it out of search results and out of Referer headers
// sent to the bot-check script.
export const metadata: Metadata = {
  title: 'Cancel your call',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

async function Cancel({ params }: { params: Promise<{ token: string }> }) {
  await connection()
  const { token } = await params
  const siteKey = process.env.TURNSTILE_SITE_KEY
  if (!siteKey) {
    return <p className="status">Cancelling is unavailable right now. Email me at <a href={`mailto:${site.email.client}`}>{site.email.client}</a> and I’ll cancel it for you.</p>
  }
  return <CancelBooking token={token} siteKey={siteKey} email={site.email.client} />
}

export default function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <DocPage crumb="Cancel">
      <h1>Cancel your call</h1>
      <Suspense fallback={<p className="status">Loading…</p>}>
        <Cancel params={params} />
      </Suspense>
    </DocPage>
  )
}
