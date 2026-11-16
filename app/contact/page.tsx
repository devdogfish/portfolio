import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/contact-form'
import { DocPage } from '@/components/page'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: 'Discuss your project',
  description: 'Tell me what you’d like to build. I usually reply within two business days.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <DocPage crumb="Contact">
      <h1>Let’s talk about your project</h1>
      <p className="lede">Tell me a little about what you have in mind. No budget form, no sales call. I usually reply within two business days.</p>
      <div className="contact-paths">
        <Link href="/book" data-track="cta:book">
          <strong>Book a call</strong><span>Pick a time for a 30-minute call.</span>
        </Link>
        <a href={`mailto:${site.email.client}?subject=${encodeURIComponent('A project')}`} data-track="cta:email" data-track-target="contact">
          <strong>Email me directly</strong><span>{site.email.client}</span>
        </a>
      </div>
      <h2>Or send a quick note</h2>
      <ContactForm />
    </DocPage>
  )
}
