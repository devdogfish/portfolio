import { spawn, type ChildProcess } from 'node:child_process'
import { createServer, type IncomingMessage } from 'node:http'
import { expect, test, type Page } from '@playwright/test'

// Mocked booking API, Turnstile siteverify and analytics ingest, all on loopback.
const apiToken = 'fixture-booking-token-never-in-browser'
const zone = 'Asia/Tokyo'
const day = 24 * 60 * 60 * 1000
const base = new Date(Math.floor(Date.now() / day) * day + 2 * day)
const at = (hours: number, minutes = 0) => new Date(base.getTime() + (hours * 60 + minutes) * 60_000).toISOString()
const initialSlots = [at(15), at(15, 30), at(16)]

let slots = [...initialSlots]
let createStatus: 201 | 409 | 429 = 201
let failTurnstile = false
const verified: string[] = []
const created: { body: Record<string, unknown>; key?: string }[] = []
const availability: URLSearchParams[] = []
const cancels: string[] = []
const leaks: string[] = []
const events: { kind: string; path: string; props: unknown }[] = []

async function read(request: IncomingMessage) {
  let body = ''
  for await (const chunk of request) body += chunk
  return body
}

const api = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://fixture')
  const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
    response.writeHead(status, { 'content-type': 'application/json', ...headers }).end(JSON.stringify(body))

  if (url.pathname === '/siteverify' && request.method === 'POST') {
    const form = new URLSearchParams(await read(request))
    if (form.get('secret') !== 'fixture-secret') return json(200, { success: false })
    verified.push(form.get('response') ?? '')
    return json(200, { success: !failTurnstile })
  }
  if (url.pathname === '/api/v1/website-analytics/events' && request.method === 'POST') {
    events.push(...JSON.parse(await read(request)).events)
    return response.writeHead(202).end()
  }
  if (!url.pathname.startsWith('/booking/api/v1/meetings')) return response.writeHead(404).end()
  if (request.headers['x-api-key'] !== apiToken || request.headers.authorization) {
    return response.writeHead(401).end()
  }

  if (url.pathname === '/booking/api/v1/meetings/availability' && request.method === 'GET') {
    availability.push(url.searchParams)
    return json(200, { slots })
  }
  if (url.pathname === '/booking/api/v1/meetings' && request.method === 'POST') {
    const body = JSON.parse(await read(request))
    created.push({ body, key: request.headers['idempotency-key'] as string | undefined })
    if (createStatus === 429) return json(429, { error: 'rate_limited' }, { 'retry-after': '120' })
    if (createStatus === 409) {
      slots = slots.filter(slot => slot !== body.start)
      return json(409, { error: 'slot_taken' })
    }
    const end = new Date(Date.parse(body.start) + 30 * 60_000).toISOString()
    return json(201, { id: 'meeting-1', start: body.start, end })
  }
  if (url.pathname === '/booking/api/v1/meetings/cancel' && request.method === 'POST') {
    const { token } = JSON.parse(await read(request))
    cancels.push(token)
    return token === 'valid-cancel-token' ? json(200, { ok: true }) : json(404, { error: 'not_found' })
  }
  response.writeHead(404).end()
})

// Stands in for Cloudflare's script: every render or reset issues a fresh token.
const fakeTurnstile = `
  let count = 0; const widgets = {};
  window.turnstile = {
    render(element, options) {
      const id = 'w' + (++count); widgets[id] = options;
      setTimeout(() => options.callback('token-' + id + '-' + count), 10); return id;
    },
    reset(id) { const options = widgets[id]; setTimeout(() => options.callback('token-' + id + '-' + (++count)), 10) },
    remove(id) { delete widgets[id] },
  };`

let next: ChildProcess
let site: string
let fixture: string

test.use({ timezoneId: zone, locale: 'en-US' })

// Run after `npm run build`.
test.beforeAll(async () => {
  await new Promise<void>(resolve => api.listen(0, '127.0.0.1', resolve))
  const address = api.address()
  if (!address || typeof address === 'string') throw Error('Missing fixture API address')
  fixture = `http://127.0.0.1:${address.port}`
  next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', 'localhost', '--port', '0'], {
    env: {
      PATH: process.env.PATH,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      BOOKING_API_URL: `${fixture}/booking`,
      BOOKING_API_TOKEN: apiToken,
      TURNSTILE_SITE_KEY: 'fixture-site-key',
      TURNSTILE_SECRET_KEY: 'fixture-secret',
      TURNSTILE_VERIFY_URL: `${fixture}/siteverify`,
      QUANTSELF_INGEST_URL: fixture,
      QUANTSELF_INGEST_TOKEN: 'fixture-ingest',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  site = await new Promise<string>((resolve, reject) => {
    let output = ''
    const ready = (chunk: Buffer) => {
      output += chunk.toString()
      const match = output.match(/http:\/\/localhost:\d+/)
      if (match && output.includes('Ready')) resolve(match[0])
    }
    next.stdout?.on('data', ready)
    next.stderr?.on('data', ready)
    next.once('error', reject)
    next.once('exit', code => reject(Error(`Fixture Next exited (${code})`)))
  })
})

test.afterAll(async () => {
  if (next?.pid && next.exitCode === null && next.signalCode === null) {
    await new Promise<void>(resolve => {
      next.once('exit', () => resolve())
      next.kill()
    })
  }
  api.closeAllConnections()
  await new Promise<void>(resolve => api.close(() => resolve()))
})

test.beforeEach(async ({ page }) => {
  slots = [...initialSlots]
  createStatus = 201
  failTurnstile = false
  created.length = 0
  availability.length = 0
  await page.route('https://challenges.cloudflare.com/**', route =>
    route.fulfill({ contentType: 'text/javascript', body: fakeTurnstile }))
  // The browser must never talk to the booking API or see its token.
  leaks.length = 0
  page.on('request', request => { if (request.url().startsWith(fixture)) leaks.push(request.url()) })
  page.on('response', async response => {
    if (!response.url().startsWith(site)) return
    if ((await response.text().catch(() => '')).includes(apiToken)) leaks.push(response.url())
  })
})

test.afterEach(() => expect(leaks).toEqual([]))

const label = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' })
const alert = (page: Page) => page.locator('.status[role="alert"]')
const slotButtons = (page: Page) => page.getByRole('list', { name: 'Open times' }).getByRole('button')

async function fillDetails(page: Page) {
  await page.getByRole('textbox', { name: 'Name' }).fill('Ada Lovelace')
  await page.getByRole('textbox', { name: 'Email' }).fill('ada@example.test')
}

test('lists open slots in the visitor’s timezone', async ({ page }) => {
  await page.goto(site + '/book')
  await expect(page.getByText(`Times in ${zone}`)).toBeVisible()
  await expect(slotButtons(page)).toHaveText(initialSlots.map(label))
  // 15:00 UTC is midnight in Tokyo, so the offset is really applied.
  expect(label(initialSlots[0])).toBe('12:00 AM')
  expect(availability).toHaveLength(1)
  const from = Date.parse(availability[0].get('from')!)
  const to = Date.parse(availability[0].get('to')!)
  expect(to - from).toBe(28 * day)
  expect(verified.length).toBeGreaterThan(0)
})

test('books a slot and records a confirmed-booking event', async ({ page }) => {
  await page.goto(site + '/book')
  await slotButtons(page).nth(1).click()
  await fillDetails(page)
  await page.getByLabel(/Anything I should know/).fill('About a website')
  await page.getByRole('button', { name: 'Confirm booking' }).click()
  await expect(page.getByRole('heading', { name: 'You’re booked' })).toBeVisible()
  await expect(page.locator('.booking-done')).toContainText(label(initialSlots[1]))
  expect(created).toHaveLength(1)
  expect(created[0].body).toEqual({ start: initialSlots[1], name: 'Ada Lovelace', email: 'ada@example.test', note: 'About a website' })
  expect(created[0].key).toMatch(/^[0-9a-f-]{36}$/)
  await expect.poll(() => events).toContainEqual(expect.objectContaining({
    kind: 'booking:confirm', path: '/book', props: { minutes: 30 },
  }))
})

test('a taken slot (409) refreshes the list', async ({ page }) => {
  createStatus = 409
  await page.goto(site + '/book')
  await slotButtons(page).first().click()
  await fillDetails(page)
  await page.getByRole('button', { name: 'Confirm booking' }).click()
  await expect(alert(page)).toContainText('Someone just booked that time')
  await expect(slotButtons(page)).toHaveText(initialSlots.slice(1).map(label))
  await expect(page.getByRole('button', { name: 'Confirm booking' })).toHaveCount(0)
  expect(availability).toHaveLength(2)
})

test('rate limiting (429) asks the visitor to wait', async ({ page }) => {
  createStatus = 429
  await page.goto(site + '/book')
  await slotButtons(page).first().click()
  await fillDetails(page)
  await page.getByRole('button', { name: 'Confirm booking' }).click()
  await expect(alert(page)).toHaveText('Too many booking attempts. Please try again in 2 minutes.')
  await expect(page.getByRole('button', { name: 'Confirm booking' })).toBeVisible()
})

test('a failed Turnstile check never reaches the booking API', async ({ page }) => {
  await page.goto(site + '/book')
  await slotButtons(page).first().click()
  await fillDetails(page)
  failTurnstile = true
  await page.getByRole('button', { name: 'Confirm booking' }).click()
  await expect(alert(page)).toContainText('couldn’t confirm you’re not a bot')
  expect(created).toHaveLength(0)

  availability.length = 0
  await page.goto(site + '/book')
  await expect(alert(page)).toContainText('couldn’t confirm you’re not a bot')
  await expect(slotButtons(page)).toHaveCount(0)
  expect(availability).toHaveLength(0)
})

test('cancel links confirm first and handle expired tokens', async ({ page }) => {
  const url = site + '/book/cancel/valid-cancel-token'
  const response = await page.goto(url)
  await expect(page).toHaveURL(url)
  expect(await response?.text()).not.toContain('valid-cancel-token')
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer')
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer')
  expect(cancels).toHaveLength(0)
  await page.getByRole('button', { name: 'Cancel my call' }).click()
  await expect(page.locator('.booking-done')).toContainText('Your call is cancelled')
  expect(cancels).toEqual(['valid-cancel-token'])

  await page.goto(site + '/book/cancel/expired-token')
  await page.getByRole('button', { name: 'Cancel my call' }).click()
  await expect(alert(page)).toContainText('isn’t valid anymore')
})

test('the contact page links to /book with tracking', async ({ request }) => {
  const html = await (await request.get(site + '/contact')).text()
  expect(html).toContain('<a data-track="cta:book" href="/book">')
  expect(html).toContain('30-minute call')
})
