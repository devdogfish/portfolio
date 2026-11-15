import { createHmac } from 'node:crypto'
import { expect, test } from '@playwright/test'
import type { AnalyticsEvent, AnalyticsInquiry } from '../../lib/analytics/contract'
import { analyticsVisitor } from '../../lib/analytics/server'

const upstream = 'http://127.0.0.1:' + (process.env.ANALYTICS_FIXTURE_UPSTREAM_PORT ?? '4180')
type Delivery = { path: string; data: { events: AnalyticsEvent[] } | AnalyticsInquiry }

async function deliveries() {
  return await (await fetch(upstream + '/deliveries')).json() as Delivery[]
}

async function events() {
  return (await deliveries()).flatMap(({ data }) => 'events' in data ? data.events : [])
}

test.beforeEach(async () => {
  await fetch(upstream + '/reset', { method: 'POST' })
})

test('two views keep attribution and one regular POST plus one leave beacon', async ({ page }) => {
  await page.clock.install()
  await page.addInitScript(() => {
    Object.defineProperties(document, {
      hidden: { get: () => document.documentElement?.dataset.visibility === 'hidden' },
      visibilityState: { get: () => document.hidden ? 'hidden' : 'visible' },
      hasFocus: { value: () => document.documentElement?.dataset.focus !== 'outside' },
    })
  })
  const requests: string[] = []
  page.on('request', request => {
    if (request.url().endsWith('/api/e') && request.method() === 'POST') requests.push(request.resourceType())
  })
  await page.goto('/?via=unknown-code&utm_source=linkedin', { referer: 'https://referral.example.com/private-page' })
  await expect(page).toHaveURL(/\/\?utm_source=linkedin$/)
  await page.clock.runFor(10_100)
  await expect.poll(events).toMatchObject([{
    kind: 'page:view', path: '/', link_code: 'unknown-code', utm_source: 'linkedin',
    referrer_host: 'referral.example.com',
  }])

  await page.getByRole('link', { name: 'Next page' }).click()
  await expect(page).toHaveURL(/\/next$/)
  await page.getByRole('button', { name: 'Contact CTA' }).click()
  await page.getByRole('link', { name: 'External example' }).evaluate((link: HTMLAnchorElement) => {
    link.addEventListener('click', event => event.preventDefault(), { once: true })
    link.click()
  })
  await page.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    window.dispatchEvent(new Event('scroll'))
    document.documentElement.dataset.focus = 'outside'
    window.dispatchEvent(new Event('blur'))
  })
  await page.clock.runFor(3_000)
  await page.evaluate(() => {
    delete document.documentElement.dataset.focus
    window.dispatchEvent(new Event('focus'))
  })
  await page.clock.runFor(1_500)
  await page.evaluate(() => {
    document.documentElement.dataset.visibility = 'hidden'
    document.dispatchEvent(new Event('visibilitychange'))
    window.dispatchEvent(new PageTransitionEvent('pagehide'))
  })

  await expect.poll(async () => (await events()).map(event => event.kind)).toContain('cta:click')
  const accepted = await events()
  const views = accepted.filter(event => event.kind === 'page:view')
  expect(views.map(event => event.path)).toEqual(['/', '/next'])
  expect(views[1]).toMatchObject({ link_code: 'unknown-code', utm_source: 'linkedin', session_id: views[0].session_id })
  expect(views[1].referrer_host).toBeUndefined()
  expect(views[1].page_view_id).not.toBe(views[0].page_view_id)
  expect(accepted).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: 'cta:click', props: { cta: 'contact', target: 'contact-form' }, path: '/next' }),
    expect.objectContaining({ kind: 'outbound:click', props: { target: 'example.com' } }),
    expect.objectContaining({ kind: 'page:engagement', props: { activeMs: expect.any(Number), maxScroll: 100 }, path: '/next' }),
  ]))
  const engagement = accepted.find(event => event.path === '/next' && event.kind === 'page:engagement')
  const activeMs = engagement?.kind === 'page:engagement' ? engagement.props.activeMs : 0
  expect(activeMs).toBeGreaterThanOrEqual(1400)
  expect(activeMs).toBeLessThan(3000)
  expect(requests).toHaveLength(2)
  expect(requests[0]).toBe('fetch')
  expect(requests[1]).toBe('ping')
})

test('owner enrollment strips the secret and suppresses subsequent requests', async ({ page, context }) => {
  const methods: string[] = []
  page.on('request', request => {
    if (request.url().endsWith('/api/e')) methods.push(request.method())
  })
  await page.goto('/?owner=fixture-owner-only&via=owner-link')
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('analytics:owner'))).toBe('1')
  expect((await context.cookies()).some(cookie => cookie.name === 'analytics_owner' && cookie.httpOnly)).toBe(true)
  await page.clock.install()
  await page.goto('/next')
  await page.clock.runFor(15_000)
  expect(methods).toEqual(['PUT'])
  expect(await events()).toEqual([])
})

for (const [key, value] of [['globalPrivacyControl', true], ['doNotTrack', '1']] as const) {
  test(`honors ${key} before creating IDs`, async ({ page }) => {
    await page.clock.install()
    await page.addInitScript(({ key, value }) => {
      Object.defineProperty(Navigator.prototype, key, { get: () => value })
    }, { key, value })
    await page.goto('/?via=private')
    await expect(page).toHaveURL(/\/$/)
    await page.clock.runFor(12_000)
    expect(await page.evaluate(() => [localStorage.getItem('analytics:visitor'), sessionStorage.getItem('analytics:session')]))
      .toEqual([null, null])
    expect(await events()).toEqual([])
  })
}

test('contact retry keeps the inquiry ID and sends a separate event with the current link code', async ({ page }) => {
  await fetch(upstream + '/reset?refuse-inquiry', { method: 'POST' })
  await page.goto('/?via=rbc-launch')
  await expect(page).toHaveURL(/\/$/)
  await page.getByLabel('Name').fill('Fixture Person')
  await page.getByLabel('Email').fill('person@example.com')
  await page.getByLabel('Topic').fill('Site project')
  await page.getByLabel('Message').fill('A synthetic inquiry.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('form').getByRole('alert')).toHaveText('Your message could not be sent. Please try again.')
  await expect(page.getByLabel('Message')).toHaveValue('A synthetic inquiry.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('status')).toHaveText('Message sent.')
  await expect.poll(async () => (await events()).filter(event => event.kind === 'contact_form:submit')).toHaveLength(1)
  const inquiries = (await deliveries()).filter(({ path }) => path.endsWith('/inquiries')).map(({ data }) => data)
  expect(inquiries).toHaveLength(2)
  expect(inquiries[0]).toEqual(inquiries[1])
  expect(inquiries[0]).toMatchObject({ link_code: 'rbc-launch', email: 'person@example.com' })
  const event = (await events()).find(event => event.kind === 'contact_form:submit')
  expect(event).toMatchObject({ link_code: 'rbc-launch', props: { method: 'form', result: 'ok' } })
  expect(JSON.stringify(event)).not.toContain('person@example.com')
  expect(event?.visitor_id).toBeUndefined()
})

test('collector rejects foreign origins, excessive size, and client-supplied IP fields', async ({ request, baseURL }) => {
  const headers = {
    Origin: baseURL!, 'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  }
  const data = { events: [{
    id: '10000000-0000-4000-8000-000000000001', kind: 'page:view', occurred_at: '2026-11-14T17:59:59Z',
    path: '/', session_id: '10000000-0000-4000-8000-000000000002',
    page_view_id: '10000000-0000-4000-8000-000000000003', props: {},
  }] }
  expect((await request.post('/api/e', { headers: { ...headers, Origin: 'https://foreign.example.com' }, data })).status()).toBe(403)
  expect((await request.post('/api/e', { headers, data: ' '.repeat(32 * 1024 + 1) })).status()).toBe(413)
  expect((await request.post('/api/e', { headers, data: { events: [{ ...data.events[0], ip_id: '192.0.2.1' }] } })).status()).toBe(400)
  expect((await request.post('/api/e', { headers: { ...headers, 'User-Agent': 'Googlebot' }, data })).status()).toBe(204)
  expect((await request.post('/api/e', { headers: { ...headers, 'Sec-GPC': '1' }, data })).status()).toBe(204)
  expect(await events()).toEqual([])
})

test('uses the trusted IP, normalizes mapped addresses, and rotates the HMAC at UTC midnight', () => {
  const variables = {
    VERCEL: '1',
    ANALYTICS_IP_KEY: 'synthetic hash key',
    ANALYTICS_EXCLUDED_IPS: '192.0.2.5',
  }
  const saved = Object.keys(variables).map(name => [name, process.env[name]] as const)
  try {
    Object.assign(process.env, variables)
    const headers = new Headers({
      'x-vercel-forwarded-for': '::ffff:192.0.2.2',
      'x-forwarded-for': '192.0.2.5',
    })
    const before = analyticsVisitor(headers, new Date('2026-11-14T23:59:59Z'))
    const after = analyticsVisitor(headers, new Date('2026-11-15T00:00:00Z'))
    expect(before.ipId).toBe(createHmac('sha256', variables.ANALYTICS_IP_KEY).update('2026-11-14|192.0.2.2').digest('hex'))
    expect(after.ipId).toBe(createHmac('sha256', variables.ANALYTICS_IP_KEY).update('2026-11-15|192.0.2.2').digest('hex'))
    headers.set('x-vercel-forwarded-for', '::ffff:192.0.2.5')
    expect(analyticsVisitor(headers)).toEqual({ excluded: true, device: 'desktop' })
  } finally {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }
})
