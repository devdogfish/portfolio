import type { Metadata } from 'next'
import { DocPage } from '@/components/page'
import { site } from '@/content/site'

export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy' } }

export default function PrivacyPage() {
  return (
    <DocPage crumb="Privacy">
      <h1>Privacy</h1>
      <p className="lede">This site counts visits with a small script I wrote myself. No tracking cookies, no ad networks, no third-party analytics.</p>
      <h2>The one cookie</h2>
      <p>If you arrived through a link I shared, your browser gets a cookie called <code>audience</code> that only says which version of the homepage to show you: the one for clients, or the one for a particular kind of job, and whether a résumé link chose it. It holds no ID and nothing about you, scripts on the page can’t read it, and it expires after 90 days. Clear it and you’ll see the regular homepage.</p>
      <h2>What’s recorded</h2>
      <p>Which pages are viewed, roughly how long they stay open and how far they’re scrolled, and which buttons and outbound links are clicked. If you arrived through a link I shared, the link’s code is recorded so I know which résumé or post brought you here.</p>
      <p>Your browser gets a random ID in local storage, and each visit gets a random session ID. Your IP address never leaves the server: it’s turned into a one-way code that changes every day, so visits can’t be tied together across days.</p>
      <h2>What isn’t</h2>
      <p>If your browser sends Global Privacy Control or Do Not Track, nothing is recorded at all. Nothing is sold or shared. Messages you send through the contact form go only to me.</p>
      <h2>Questions</h2>
      <p>Email <a href={`mailto:${site.email.client}`}>{site.email.client}</a>.</p>
    </DocPage>
  )
}
