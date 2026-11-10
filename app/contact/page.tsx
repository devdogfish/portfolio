import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Footer } from '@/components/shared';
import { selectedProfile } from '@/lib/selected-profile';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact Luigi Girke', alternates: { canonical: '/contact' } };
export default async function Contact() {
  const { profileId } = await selectedProfile();
  const employer = !['default', 'client'].includes(profileId);
  const email = employer ? 'job@luigigirke.com' : 'contact@luigigirke.com';
  const bookingUrl = process.env.BOOKING_URL;
  return <div className="mx-auto max-w-6xl px-5 sm:px-9 lg:px-14">
    <header className="flex items-center justify-between border-b border-border py-5"><Link href="/" className="font-semibold">Luigi Girke</Link><Link href="/" className="text-sm text-muted-foreground hover:underline">Back to portfolio</Link></header>
    <main className="grid min-h-[70svh] items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20">
      <div><p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">Get in touch</p><h1 className="text-5xl font-light leading-[1.04] tracking-tight sm:text-7xl">{employer ? 'Let’s talk.' : 'Let’s get to work.'}</h1><p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">{employer ? 'For opportunities and questions about my work, reach me directly by email.' : 'A website, an application, or a better way to get things done. Tell me what you have in mind.'}</p></div>
      <div className="rounded-lg border border-border p-7 sm:p-9"><h2 className="text-2xl font-light">{employer ? 'Contact me' : 'Start a conversation'}</h2><p className="mt-4 leading-relaxed text-muted-foreground">{employer ? 'My résumé and LinkedIn have my professional contact details too.' : 'No formal brief needed. A few lines about your idea are enough to start.'}</p>
        {!employer && bookingUrl && <a href={bookingUrl} target="_blank" rel="noopener noreferrer" data-track="booking_click" data-track-target="discovery" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-md bg-primary px-5 py-3 text-primary-foreground">Book a discovery call <ArrowUpRight className="size-4" /></a>}
        <a href={`mailto:${email}?subject=${employer ? 'Professional%20opportunity' : 'Project%20inquiry'}`} data-track="email_click" data-track-target={employer ? 'careers-email' : 'contact-email'} className="mt-7 flex min-h-12 items-center gap-2 break-all text-lg underline underline-offset-4">{email}<ArrowUpRight className="size-4 shrink-0" /></a><p className="mt-7 text-sm text-muted-foreground">I usually reply within two business days.</p>
      </div>
    </main><Footer />
  </div>;
}
