'use client'

import { Container, GridRule, Section } from '@atom63/ui-react/layout'
import { useEffect, useRef, useState } from 'react'
import { logos } from '@/content/personal'
import { elsewhere, site } from '@/content/site'
import './footer.css'

const clock = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: site.timeZone })

function engine() {
  const agent = navigator.userAgent
  if (agent.includes('Edg/')) return 'Edge'
  if (agent.includes('Chrome')) return 'Chromium'
  if (agent.includes('Firefox')) return 'Firefox'
  if (agent.includes('Safari')) return 'Safari'
  return 'Other'
}

export function PortfolioFooter({ email, build }: { email: string; build: string }) {
  const [live, setLive] = useState({ time: '', viewport: '', engine: '', language: '' })
  const [copy, setCopy] = useState<'idle' | 'copied' | 'error'>('idle')
  const timer = useRef<number>(undefined)

  useEffect(() => {
    const update = () => setLive({ time: clock.format(new Date()), viewport: `${innerWidth}×${innerHeight}`, engine: engine(), language: navigator.language })
    update()
    const tick = setInterval(update, 1000)
    addEventListener('resize', update)
    return () => {
      clearInterval(tick)
      removeEventListener('resize', update)
      clearTimeout(timer.current)
    }
  }, [])

  async function copyEmail() {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(email)
      setCopy('copied')
    } catch {
      setCopy('error')
    }
    timer.current = window.setTimeout(() => setCopy('idle'), 3000)
  }

  const stats = [
    { label: 'Build', value: build },
    { label: 'Shipped', value: site.shipped },
    { label: 'Engine', value: live.engine },
    { label: 'Viewport', value: live.viewport },
    { label: 'Language', value: live.language },
    { label: site.location, value: live.time },
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
                <li><button type="button" onClick={copyEmail} data-track="cta:copy-email" aria-label={`Copy email address ${email}`}>Email</button></li>
                {elsewhere.map(({ label, href }) => (
                  <li key={label}><a href={href} target="_blank" rel="noreferrer">{label}</a></li>
                ))}
                <li><a href="/privacy">Privacy</a></li>
              </ul>
            </nav>
          </section>
          <section className="portfolio-footer-logos" aria-label="Trusted by">
            <p className="portfolio-footer-label">/ Trusted by</p>
            <div className="portfolio-footer-marquee">
              <ul>
                {[0, 1, 2, 3].map(copy => logos.map(logo => (
                  <li key={`${copy}-${logo.title}`} aria-hidden={copy ? 'true' : undefined}>
                    <a href={logo.url} target="_blank" rel="noreferrer" tabIndex={copy ? -1 : undefined} aria-label={logo.title} title={logo.title}>
                      <img
                        alt=""
                        data-round={'round' in logo ? 'true' : undefined}
                        data-invert-in-dark={'invertInDark' in logo ? 'true' : undefined}
                        src={logo.src}
                        height="26"
                        loading="lazy"
                      />
                    </a>
                  </li>
                )))}
              </ul>
            </div>
          </section>
          <section aria-label="Details">
            <dl className="portfolio-footer-stats">
              {stats.map(({ label, value }) => (
                <div key={label}>
                  <dt className="portfolio-footer-label">/ {label}</dt>
                  <dd suppressHydrationWarning>{value || ' '}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="portfolio-footer-copyright" aria-label="Copyright">
            <p>© 2026 {site.name} · {site.handle}</p>
          </section>
        </Section>
      </Container>
      <GridRule bleed />
      <div className="portfolio-footer-copy-feedback" data-visible={copy !== 'idle'} role="status">
        {copy === 'copied' && <><strong>Email copied</strong><span>{email}</span></>}
        {copy === 'error' && <><strong>Couldn’t copy email</strong><a href={`mailto:${email}`}>{email}</a></>}
      </div>
    </footer>
  )
}
