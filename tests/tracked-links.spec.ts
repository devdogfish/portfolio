import { writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { expect, test } from '@playwright/test'
import { startNext } from './next-server'

const fresh = 'k3Vw9QpX2nR7tLzA'
const second = 'Hq2ZcP8wLm4XyR9b'
const events: unknown[] = []
const lookups: string[] = []
const longPost = 'p'.repeat(64)
const api = createServer(async (request, response) => {
  const code = request.url?.match(/^\/api\/v1\/tracked-links\/([A-Za-z0-9-]+)$/)?.[1]
  if (code && request.method === 'GET' && request.headers['x-api-key'] === 'fixture-read') {
    lookups.push(code)
    if (code === 'offline-test') return response.writeHead(503).end()
    const rows: Record<string, object> = {
      [fresh]: { kind: 'application', track: 'software' },
      [second]: { kind: 'application', track: 'web-cms' },
      'rbc-launch': { kind: 'post', destinationPath: '/contact' },
      x: { kind: 'post', destinationPath: '/writing' },
      [longPost]: { kind: 'post', destinationPath: '/contact' },
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

test('application and post codes redirect with via; only flat keys resolve', async ({ request }) => {
  for (const [path, location, audience] of [
    [fresh, `/?via=${fresh}`, 'software'],
    [`${fresh}/rbc`, `/project/rbc-analytics?via=${fresh}`, 'software'],
    [`${fresh}/github`, 'https://github.com/devdogfish', 'software'],
    [second, `/?via=${second}`, 'web-cms'],
    [`${second}/rbc-demo`, 'https://rbc-analytics.demo.girke.dev/', 'web-cms'],
    ['rbc-launch', '/contact?via=rbc-launch'],
    ['x', '/writing?via=x'],
    [longPost, `/contact?via=${longPost}`],
    ['offline-test', '/?via=offline-test'],
  ]) {
    const reply = await request.get(`${site}/r/${path}`, { maxRedirects: 0 })
    expect(reply.status(), path).toBe(307)
    expect(reply.headers()).toMatchObject({ location, 'cache-control': 'no-store', 'x-robots-tag': 'noindex' })
    const cookie = reply.headers()['set-cookie']
    if (audience) expect(cookie, path).toBe(`audience=${audience}; Path=/; Max-Age=7776000; SameSite=Lax; Secure; HttpOnly`)
    else expect(cookie, path).toBeUndefined()
  }

  const path = `/r/${second}/rbc-demo`
  const head = await request.head(site + path, { maxRedirects: 0 })
  expect(head.status()).toBe(307)
  expect((await head.body()).length).toBe(0)
  await expect.poll(() => events).toContainEqual(expect.objectContaining({
    kind: 'link:open', path, link_code: second, props: expect.objectContaining({ method: 'HEAD', key: 'rbc-demo' }),
  }))
  expect(lookups.filter(code => code === fresh)).toHaveLength(1)
  expect(lookups.filter(code => code === second)).toHaveLength(1)

  // Malformed codes and unknown or nested keys 404 without asking the registry.
  const before = lookups.length
  for (const path of [`${fresh}/missing`, `${fresh}/project/rbc`, `${fresh}/client`, 'bad--slug', `${longPost}p`]) {
    expect((await request.get(`${site}/r/${path}`, { maxRedirects: 0 })).status(), path).toBe(404)
  }
  expect(lookups).toHaveLength(before)
  expect((await request.get(`${site}/r/missing-code`, { maxRedirects: 0 })).status()).toBe(404)
  expect(lookups.slice(before)).toEqual(['missing-code'])
  expect((await request.get(`${site}/go/software/profile/github/external`, { maxRedirects: 0 })).status()).toBe(404)
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
    ['client', 'Luigi Girke: custom websites and business tools'],
    ['software', 'Luigi Girke: software developer'],
    ['web-cms', 'Luigi Girke: web content and CMS developer'],
    ['admin-excel', 'Luigi Girke: Excel, records and operations support'],
  ]) {
    const page = await request.get(site + '/?via=issued-code', { headers: { Cookie: `audience=${audience}` } })
    expect(page.status(), audience).toBe(200)
    expect((await page.text()).match(/<title>([^<]+)<\/title>/)?.[1], audience).toBe(title)
  }
})
