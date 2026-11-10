import Link from 'next/link';
export const metadata = { title: 'Privacy — Luigi Girke', alternates: { canonical: '/privacy' } };
export default function Privacy() {
  return <main className="mx-auto max-w-2xl space-y-7 px-6 py-16">
    <Link href="/" className="underline">Back to portfolio</Link>
    <h1 className="text-4xl font-light">Privacy</h1>
    <p>This site remembers which version of the portfolio you arrived at for 90 days, using a first-party cookie. A new audience link updates that selection.</p>
    <p>Usage events help me understand which work people find useful. They include page views, time in a visible tab, recent interaction time, scroll depth, and clicks on résumé, project, and contact links. A random browser identifier lasts up to 90 days. Sessions expire after 30 minutes of inactivity.</p>
    <p>The server checks the request IP to exclude my own traffic. For other visits, it stores a code derived from the IP using a private key. The analytics service receives the code without the original address. People on a shared network can have the same code.</p>
    <p>Analytics does not record your screen, keystrokes, form contents, or browsing activity on other websites. It respects Do Not Track and Global Privacy Control. You can clear this site’s cookies and storage in your browser settings.</p>
    <p>I view usage data in my private dashboard and retain activity for up to 90 days. Email inquiries are used to reply to you.</p>
    <p>Questions: <a className="underline" href="mailto:contact@luigigirke.com">contact@luigigirke.com</a>.</p>
  </main>;
}
