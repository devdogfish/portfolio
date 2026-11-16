import { createServer } from 'node:http'
import { expect, test, type Page } from '@playwright/test'
import { startNext } from './next-server'

type Event = { kind: string; path: string; link_code?: string; session_id: string; props: Record<string, unknown> }
const via = 'k3Vw9QpX2nR7tLzA'
const owner = 'fixture-owner-secret'
const events: Event[] = []
const ingest = createServer(async (request, response) => {
  if (request.url === '/api/v1/website-analytics/events' && request.method === 'POST' &&
      request.headers['x-api-key'] === 'fixture-ingest') {
    let body = ''
    for await (const chunk of request) body += chunk
    events.push(...JSON.parse(body).events)
    return response.writeHead(202).end()
  }
  response.writeHead(401).end()
})

// The collection route drops bots, and isbot counts HeadlessChrome as one. Set the
// UA at launch: beacons sent while a page unloads ignore the per-context override.
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
test.use({ userAgent, launchOptions: { args: [`--user-agent=${userAgent}`] } })

let next: Awaited<ReturnType<typeof startNext>>
let site: string

test.beforeAll(async () => {
  await new Promise<void>(resolve => ingest.listen(0, '127.0.0.1', resolve))
  const address = ingest.address()
  if (!address || typeof address === 'string') throw Error('Missing fixture ingest address')
  next = await startNext({
    QUANTSELF_INGEST_URL: `http://127.0.0.1:${address.port}`,
    QUANTSELF_INGEST_TOKEN: 'fixture-ingest',
    OWNER_TRACKING_SECRET: owner,
  })
  site = next.url
})

test.afterAll(async () => {
  await next?.stop()
  ingest.closeAllConnections()
  await new Promise<void>(resolve => ingest.close(() => resolve()))
})

test.beforeEach(() => { events.length = 0 })

// Counts what the browser sends to the collection route.
function intakeRequests(page: Page) {
  const sent: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/e') sent.push(`${request.method()} ${request.resourceType()}`)
  })
  return sent
}

// Headless tabs never really hide, so fake the hide the way a tab switch would.
async function hide(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

async function trackerStarted(page: Page) {
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('analytics:session'))).not.toBeNull()
}

test('views, CTA clicks and engagement carry the via code across pages', async ({ page }) => {
  const sent = intakeRequests(page)
  await page.goto(`${site}/?via=${via}&utm_source=resume`)
  await trackerStarted(page)
  expect(new URL(page.url()).search).toBe('?utm_source=resume')

  await page.mouse.wheel(0, 600)
  await page.locator('[data-track="cta:copy-email"]').click()
  await page.goto(`${site}/contact`)
  await trackerStarted(page)
  const before = sent.length
  await page.mouse.wheel(0, 400)
  await page.waitForTimeout(11_000)
  await hide(page)

  await expect.poll(() => events.filter(event => event.kind === 'page:engagement' && event.path === '/contact')).toHaveLength(1)
  const views = events.filter(event => event.kind === 'page:view')
  expect(views.map(event => event.path)).toEqual(['/', '/contact'])
  expect(new Set(events.map(event => event.session_id)).size).toBe(1)
  for (const event of events) expect(event, event.kind).toMatchObject({ link_code: via, utm_source: 'resume' })
  expect(events).toContainEqual(expect.objectContaining({ kind: 'cta:click', path: '/', props: { cta: 'copy-email' } }))
  expect(events).toContainEqual(expect.objectContaining({
    kind: 'page:engagement', path: '/contact', props: expect.objectContaining({ activeMs: expect.any(Number) }),
  }))

  // A page read for over 10 s: one batched POST while reading, one beacon on leave.
  expect(sent.slice(before)).toEqual(['POST fetch', 'POST ping'])
})

test('an owner device sends nothing after visiting the owner link once', async ({ page }) => {
  const sent = intakeRequests(page)
  await page.goto(`${site}/?owner=${owner}`)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('analytics:owner'))).toBe('1')
  expect(new URL(page.url()).search).toBe('')
  expect(sent).toEqual(['PUT fetch'])

  await page.goto(`${site}/?via=${via}`)
  await expect.poll(() => new URL(page.url()).search).toBe('')
  await page.locator('[data-track="cta:copy-email"]').click()
  await hide(page)
  await page.waitForTimeout(500)
  expect(sent).toEqual(['PUT fetch'])
  expect(events).toEqual([])
})

test('a wrong owner secret does not opt out', async ({ page }) => {
  await page.goto(`${site}/?owner=wrong`)
  await page.waitForTimeout(1_000)
  expect(await page.evaluate(() => localStorage.getItem('analytics:owner'))).toBeNull()
})
