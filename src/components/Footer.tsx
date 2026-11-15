import { Container, GridRule, Section } from '@atom63/ui-react/layout'
import { useEffect, useRef, useState } from 'react'
import type { PortfolioContent } from '../content'
import { version } from '../../package.json'
import './footer.css'

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/you-zhang/' },
  { label: 'GitHub', href: 'https://github.com/atom63' },
  { label: 'X.com', href: 'https://x.com/atom63_' },
  { label: 'Behance', href: 'https://www.behance.net/youzhang' },
  { label: 'Instagram', href: 'https://www.instagram.com/atom63_/' },
  { label: 'ADPList', href: 'https://adplist.org/mentors/you-zhang' },
  { label: 'Xiaohongshu', href: 'https://xhslink.com/m/5g7zBl3gPfN' },
]

const clock = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
})

function getEngine() {
  const { userAgent } = navigator
  if (userAgent.includes('Edg/')) return 'Edge'
  if (userAgent.includes('Chrome')) return 'Chromium'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  return 'Other'
}

function getViewport() {
  return `${window.innerWidth}×${window.innerHeight}`
}

export function PortfolioFooter({ content }: {
  content: Pick<PortfolioContent, 'name' | 'handle' | 'email' | 'visitors'>
}) {
  const [localTime, setLocalTime] = useState(() => clock.format(new Date()))
  const [viewport, setViewport] = useState(getViewport)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const copyTimer = useRef<number>(undefined)

  useEffect(() => {
    const updateViewport = () => setViewport(getViewport())
    window.addEventListener('resize', updateViewport)
    const timer = window.setInterval(() => setLocalTime(clock.format(new Date())), 1000)
    return () => {
      window.removeEventListener('resize', updateViewport)
      window.clearInterval(timer)
      window.clearTimeout(copyTimer.current)
    }
  }, [])

  const copyEmail = async () => {
    window.clearTimeout(copyTimer.current)
    try {
      await navigator.clipboard.writeText(content.email)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
    copyTimer.current = window.setTimeout(() => setCopyStatus('idle'), 3000)
  }

  const stats = [
    { label: 'Build', value: import.meta.env.VITE_BUILD_ID || version },
    { label: 'Shipped', value: 'Nov 2026' },
    { label: 'Engine', value: getEngine() },
    { label: 'Viewport', value: viewport },
    { label: 'Local', value: localTime },
    { label: 'Visitor', value: content.visitors },
  ]

  return (
    <footer className="portfolio-footer" id="contact">
      <GridRule bleed />
      <Container maxWidth="narrowest" padding="none">
        <Section className="portfolio-footer-section" spacing="tight" removeTopSpacing gap={false}>
          <section className="portfolio-footer-social" aria-label="Elsewhere">
            <p className="portfolio-footer-label">/ Elsewhere</p>
            <nav aria-label="Social">
              <ul>
                <li><button type="button" onClick={copyEmail} aria-label={`Copy email address ${content.email}`}>Email</button></li>
                {socialLinks.map(({ label, href }) => (
                  <li key={label}><a href={href} target="_blank" rel="noreferrer">{label}</a></li>
                ))}
              </ul>
            </nav>
          </section>
          <section aria-label="Telemetry">
            <dl className="portfolio-footer-stats">
              {stats.map(({ label, value }) => (
                <div key={label}>
                  <dt className="portfolio-footer-label">/ {label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="portfolio-footer-copyright" aria-label="Copyright">
            <p>© {new Date().getFullYear()} {content.name} · {content.handle}</p>
          </section>
        </Section>
      </Container>
      <GridRule bleed />
      <div className="portfolio-footer-copy-feedback" data-visible={copyStatus !== 'idle'} role="status">
        {copyStatus === 'copied' && <><strong>Email copied</strong><span>{content.email}</span></>}
        {copyStatus === 'error' && <><strong>Couldn’t copy email</strong><a href={`mailto:${content.email}`}>{content.email}</a></>}
      </div>
    </footer>
  )
}
