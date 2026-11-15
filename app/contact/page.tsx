import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'
import { DocPage } from '@/components/page'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: 'Discuss your project',
  description: 'Tell me what you’d like to build. I usually reply within two business days.',
  alternates: { canonical: '/contact' },
}

const booking = process.env.BOOKING_URL

export default function ContactPage() {
  return (
    <DocPage crumb="Contact">
      <h1>Let’s talk about your project</h1>
      <p className="lede">Tell me a little about what you have in mind. No budget form, no sales call. I usually reply within two business days.</p>
      <div className="contact-paths">
        {booking && (
          <a href={booking} target="_blank" rel="noreferrer" data-track="cta:book">
            <strong>Book a call</strong><span>Pick a time for a 20-minute intro.</span>
          </a>
        )}
        <a href={`mailto:${site.email.client}?subject=${encodeURIComponent('A project')}`} data-track="cta:email" data-track-target="contact">
          <strong>Email me directly</strong><span>{site.email.client}</span>
        </a>
      </div>
      <h2>Or send a quick note</h2>
      <ContactForm />
    </DocPage>
  )
}
