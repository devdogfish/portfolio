import { writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { expect, test } from '@playwright/test'
import { startNext } from './next-server'

const application = 'k3Vw9QpX'
const legacyBase62 = 'Hq2ZcP8wLm4XyR9b'
const legacyHex = '506aafc54ea944d64c543396'
const clientShare = 'P8fV1aSz'
const defaultShare = 'x'
const offlineCode = 'offlineTest'
const clientTitle = 'Luigi Girke: custom websites and business tools'
const defaultTitle = 'Luigi Girke: software, websites and practical tools'
const events: unknown[] = []
const lookups: string[] = []
const api = createServer(async (request, response) => {
  const code = request.url?.match(/^\/api\/v1\/tracked-links\/([A-Za-z0-9-]+)$/)?.[1]
  if (code && request.method === 'GET' && request.headers['x-api-key'] === 'fixture-read') {
    lookups.push(code)
    if (code === offlineCode) return response.writeHead(503).end()
    const rows: Record<string, object> = {
      [application]: { kind: 'application', track: 'software' },
      [legacyBase62]: { kind: 'application', track: 'web-cms' },
      [legacyHex]: { kind: 'application', track: 'admin-excel' },
      [clientShare]: { kind: 'share', track: 'client' },
      [defaultShare]: { kind: 'share', track: null },
    }
    if (!rows[code]) return response.writeHead(404).end()
    return response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ code, ...rows[code] }))
  }
  if (request.url === '/api/v1/website-analytics/events' && request.method === 'POST' &&
      request.headers['x-api-key'] === 'fixture-ingest') {
    let body = ''
    for await (const chunk of request) body += chunk
    events.push(...JSON.parse(body).events)
    return response.writeHead(202).end()
  }
  response.writeHead(401).end()
})

let next: Awaited<ReturnType<typeof startNext>>
let site: string

test.beforeAll(async () => {
  await new Promise<void>(resolve => api.listen(0, '127.0.0.1', resolve))
  const address = api.address()
  if (!address || typeof address === 'string') throw Error('Missing fixture API address')
  const upstream = `http://127.0.0.1:${address.port}`
  next = await startNext({
    TRACKED_LINKS_URL: `${upstream}/api/v1/tracked-links`,
    TRACKED_LINKS_TOKEN: 'fixture-read',
    QUANTSELF_INGEST_URL: upstream,
    QUANTSELF_INGEST_TOKEN: 'fixture-ingest',
  })
  site = next.url
})

test.afterAll(async () => {
  await next?.stop()
  api.closeAllConnections()
  await new Promise<void>(resolve => api.close(() => resolve()))
})

test('the public catalog lists flat keys and renderer source URLs', async ({ request }) => {
  const response = await request.get(site + '/api/links')
  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toMatch(/^public,.*s-maxage=\d+/)
  const body = await response.text()
  const catalog = JSON.parse(body)
  expect(catalog.schemaVersion).toBe(1)
  expect(catalog.variant.map(({ key }: { key: string }) => key))
    .toEqual(['default', 'client', 'software', 'web-cms', 'admin-excel'])
  expect(catalog.profile).toContainEqual({ key: 'github', description: 'GitHub' })
  expect(catalog.project).toContainEqual(expect.objectContaining({ key: 'rbc-demo' }))
  expect(catalog.project).toContainEqual(expect.objectContaining({ key: 'jobs-source-jobs-api' }))
  expect(catalog.destinations).toContainEqual({ key: null, sourceUrls: ['https://girke.dev', 'https://girke.dev/'] })
  expect(catalog.destinations).toContainEqual({
    key: 'rbc-demo', sourceUrls: expect.arrayContaining(['https://rbc-analytics.demo.girke.dev/']),
  })
  const sources = catalog.destinations.flatMap(({ sourceUrls }: { sourceUrls: string[] }) => sourceUrls)
  expect(new Set(sources).size).toBe(sources.length)
  if (process.env.PORTFOLIO_CATALOG_OUTPUT) await writeFile(process.env.PORTFOLIO_CATALOG_OUTPUT, body)
})

test('application and share links resolve bare links and flat keys', async ({ request }) => {
  for (const [path, location, audience] of [
    [defaultShare, `/?via=${defaultShare}`],
    [application, `/?via=${application}`, 'software'],
    [`${application}/rbc`, `/project/rbc-analytics?via=${application}`, 'software'],
    [legacyBase62, `/?via=${legacyBase62}`, 'web-cms'],
    [legacyHex, `/?via=${legacyHex}`, 'admin-excel'],
    [clientShare, `/?via=${clientShare}`, 'client'],
    [`${clientShare}/contact`, `/contact?via=${clientShare}`, 'client'],
    [`${clientShare}/github`, 'https://github.com/devdogfish', 'client'],
  ]) {
    const reply = await request.get(`${site}/r/${path}`, { maxRedirects: 0 })
    expect(reply.status(), path).toBe(307)
    expect(reply.headers()).toMatchObject({ location, 'cache-control': 'no-store', 'x-robots-tag': 'noindex' })
    const cookie = reply.headers()['set-cookie']
    if (audience) expect(cookie, path).toBe(`audience=${audience}; Path=/; Max-Age=7776000; SameSite=Lax; Secure; HttpOnly`)
    else expect(cookie, path).toBeUndefined()
  }

  const path = `/r/${clientShare}/rbc-demo`
  const head = await request.head(site + path, { maxRedirects: 0 })
  expect(head.status()).toBe(307)
  expect((await head.body()).length).toBe(0)
  await expect.poll(() => events).toContainEqual(expect.objectContaining({
    kind: 'link:open', path, link_code: clientShare, props: expect.objectContaining({ method: 'HEAD', key: 'rbc-demo' }),
  }))
  expect(lookups.filter(code => code === application)).toHaveLength(1)
  expect(lookups.filter(code => code === clientShare)).toHaveLength(1)
})

test('invalid links redirect to the homepage and still record opens', async ({ request }) => {
  const missing = 'missingCode'
  const malformed = 'bad-slug'
  const oversized = 'z'.repeat(25)
  const before = lookups.length
  for (const code of [missing, malformed, oversized, offlineCode]) {
    const path = `/r/${code}/contact`
    const reply = await request.get(site + path, { maxRedirects: 0 })
    expect(reply.status(), code).toBe(307)
    expect(reply.headers().location, code).toBe('/')
    expect(reply.headers()['set-cookie'], code).toBeUndefined()
    await expect.poll(() => events).toContainEqual(expect.objectContaining({
      kind: 'link:open', path, link_code: code, props: expect.objectContaining({ method: 'GET' }),
    }))
  }
  expect(lookups.slice(before)).toEqual([missing, offlineCode])
  const bare = await request.get(`${site}/r`, { maxRedirects: 0 })
  expect(bare.status()).toBe(307)
  expect(bare.headers().location).toBe('/')

  const bareMissing = await request.get(`${site}/r/${defaultShare}/missing`, { maxRedirects: 0 })
  expect(bareMissing.status()).toBe(307)
  expect(bareMissing.headers().location).toBe('/')
  expect(bareMissing.headers()['set-cookie']).toBeUndefined()

  for (const key of ['missing', 'project/rbc', 'client']) {
    const reply = await request.get(`${site}/r/${clientShare}/${key}`, { maxRedirects: 0 })
    expect(reply.status(), key).toBe(307)
    expect(reply.headers().location, key).toBe('/')
    expect(reply.headers()['set-cookie'], key).toContain('audience=client;')
  }
  const eventsBeforeMalformedKey = events.length
  const malformedKey = await request.get(`${site}/r/${clientShare}/%40invalid`, { maxRedirects: 0 })
  expect(malformedKey.headers().location).toBe('/')
  await expect.poll(() => events.slice(eventsBeforeMalformedKey)).toContainEqual(expect.objectContaining({
    path: `/r/${clientShare}`, kind: 'link:open', link_code: clientShare,
  }))
})

test('client and default views render at the clean homepage URL in a browser', async ({ page }) => {
  await page.goto(`${site}/r/${clientShare}`)
  await expect(page).toHaveTitle(clientTitle)
  await expect(page).toHaveURL(`${site}/`)

  await page.goto(`${site}/r/${defaultShare}`)
  await expect(page).toHaveTitle(defaultTitle)
  await expect(page).toHaveURL(`${site}/`)

  await page.goto(`${site}/r/${clientShare}/missing`)
  await expect(page).toHaveTitle(clientTitle)
  await expect(page).toHaveURL(`${site}/`)

  await page.goto(`${site}/r/missingCode`)
  await expect(page).toHaveTitle(defaultTitle)
  await expect(page).toHaveURL(`${site}/`)
})

test('pages render, and the audience cookie picks the view at /', async ({ request }) => {
  const paths = ['/', '/project/rbc-analytics', '/project/jobs', '/project/sitings', '/contact', '/writing', '/privacy']
  await Promise.all(paths.map(async path => expect((await request.get(site + path)).status(), path).toBe(200)))
  for (const path of ['/client', '/employer']) {
    expect((await request.get(site + path, { maxRedirects: 0 })).status(), path).toBe(404)
  }
  const direct = await request.get(site + '/v/client', { maxRedirects: 0 })
  expect(await direct.text()).toContain('>Nothing here</h1>')
  for (const [audience, title] of [
    ['client', clientTitle],
    ['software', 'Luigi Girke: software developer'],
    ['web-cms', 'Luigi Girke: web content and CMS developer'],
    ['admin-excel', 'Luigi Girke: Excel, records and operations support'],
  ]) {
    const page = await request.get(site + '/?via=issued-code', { headers: { Cookie: `audience=${audience}` } })
    expect(page.status(), audience).toBe(200)
    expect((await page.text()).match(/<title>([^<]+)<\/title>/)?.[1], audience).toBe(title)
  }
})
