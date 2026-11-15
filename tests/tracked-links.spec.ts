import { spawn, type ChildProcess } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { expect, test } from '@playwright/test'

const fresh = 'k3Vw9QpX2nR7tLzA'
const legacy = '0123456789abcdef01234567'
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
      [legacy]: { kind: 'application', track: 'web-cms' },
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

let next: ChildProcess
let site: string

// Run after `npm run build`. Next and both fixture callers only receive loopback URLs.
test.beforeAll(async () => {
  await new Promise<void>(resolve => api.listen(0, '127.0.0.1', resolve))
  const address = api.address()
  if (!address || typeof address === 'string') throw Error('Missing fixture API address')
  const upstream = `http://127.0.0.1:${address.port}`
  // Next normalizes loopback rewrites to localhost. Bind there so rewrites stay internal.
  next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', 'localhost', '--port', '0'], {
    env: {
      PATH: process.env.PATH,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      TRACKED_LINKS_URL: `${upstream}/api/v1/tracked-links`,
      TRACKED_LINKS_TOKEN: 'fixture-read',
      QUANTSELF_INGEST_URL: upstream,
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

test('the public catalog serves renderer aliases and discovery lists', async ({ request }) => {
  const response = await request.get(site + '/api/links')
  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toMatch(/^public,.*s-maxage=\d+/)
  const body = await response.text()
  const catalog = JSON.parse(body)
  expect(catalog.schemaVersion).toBe(1)
  expect(catalog.variant.map(({ key }: { key: string }) => key))
    .toEqual(['default', 'client', 'software', 'web-cms', 'admin-excel'])
  expect(catalog.profile).toContainEqual({ key: 'github', description: 'GitHub' })
  expect(catalog.project).toContainEqual(expect.objectContaining({ key: 'jobs/source/jobs-api' }))
  expect(catalog.destinations).toContainEqual({
    key: null, sourceUrls: expect.arrayContaining(['https://girke.dev/', 'https://luigigirke.com']),
  })
  expect(catalog.destinations).toContainEqual({
    key: 'rbc-demo', sourceUrls: expect.arrayContaining(['https://rbc-analytics.demo.girke.dev/']),
  })
  if (process.env.PORTFOLIO_CATALOG_OUTPUT) await writeFile(process.env.PORTFOLIO_CATALOG_OUTPUT, body)
})

test('new flat codes, issued nested codes, and post slugs reach the v2 destinations', async ({ request }) => {
  for (const [path, location, audience] of [
    [fresh, `/?via=${fresh}`, 'software'],
    [`${fresh}/rbc`, `/project/rbc-analytics?via=${fresh}`],
    [`${fresh}/github`, 'https://github.com/devdogfish', 'software'],
    [`${fresh}/client`, `/?via=${fresh}`, 'client'],
    [legacy, `/?via=${legacy}`, 'web-cms'],
    [`${legacy}/project/rbc`, `/project/rbc-analytics?via=${legacy}`],
    [`${legacy}/project/rbc/demo`, 'https://rbc-analytics.demo.girke.dev/'],
    [`${legacy}/profile/github`, 'https://github.com/devdogfish'],
    [`${legacy}/project/jobs/source/jobs-api`, 'https://github.com/devdogfish/jobs-api'],
    ['rbc-launch', '/contact?via=rbc-launch'],
    ['x', '/writing?via=x'],
    [longPost, `/contact?via=${longPost}`],
    ['offline-test', '/?via=offline-test'],
  ]) {
    const reply = await request.get(`${site}/r/${path}`, { maxRedirects: 0 })
    expect(reply.status(), path).toBe(307)
    expect(reply.headers()).toMatchObject({ location, 'cache-control': 'no-store', 'x-robots-tag': 'noindex' })
    if (audience) {
      expect(reply.headers()['set-cookie']).toBe(`audience=${audience}; Path=/; Max-Age=7776000; SameSite=Lax; Secure; HttpOnly`)
    }
  }

  const path = `/r/${legacy}/project/rbc/demo`
  const head = await request.head(site + path, { maxRedirects: 0 })
  expect(head.status()).toBe(307)
  expect((await head.body()).length).toBe(0)
  await expect.poll(() => events).toContainEqual(expect.objectContaining({
    kind: 'link:open', path, link_code: legacy, props: expect.objectContaining({ method: 'HEAD', key: 'rbc-demo' }),
  }))
  expect(lookups.filter(code => code === fresh)).toHaveLength(1)
  expect(lookups.filter(code => code === legacy)).toHaveLength(1)
  for (const unknown of ['missing-code', `${fresh}/missing`, `${legacy}/project/rbc/missing`]) {
    expect((await request.get(`${site}/r/${unknown}`, { maxRedirects: 0 })).status(), unknown).toBe(404)
  }
})

test('the current audience and navigation pages are preserved', async ({ request }) => {
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

test('issued static entries and older résumé links use allowlisted v2 targets', async ({ request }) => {
  const before = lookups.length
  for (const [code, audience, suffix = ''] of [
    ['85c0fac356', 'software'],
    ['da393208fe', 'web-cms'],
    ['79ddb560ef', 'admin-excel'],
    ['67be457ba8', 'client'],
    ['67be457ba8', 'client', '/client'],
  ]) {
    const response = await request.get(`${site}/r/${code}${suffix}`, { maxRedirects: 0 })
    expect(response.status(), code).toBe(307)
    expect(response.headers()['location']).toBe(`/?via=${code}`)
    expect(response.headers()['set-cookie']).toContain(`audience=${audience};`)
  }
  for (const [path, target, audience] of [
    ['/go/software/profile/portfolio/external', '/?via=85c0fac356', 'software'],
    ['/go/web-cms/profile/github/external', 'https://github.com/devdogfish'],
    ['/go/admin-excel/profile/linkedin/external', 'https://www.linkedin.com/in/luigigirke'],
    ['/go/software/project/rbc-analytics/case-study', '/project/rbc-analytics?via=85c0fac356', 'software'],
    ['/go/software/project/rbc-analytics/demo?url=https://outside.example.test/', 'https://rbc-analytics.demo.girke.dev/'],
    ['/go/web-cms/project/sitings/live-site', 'https://sitings.ca/property/?available=true'],
    ['/go/software/project/etpzp-sms/repository', 'https://github.com/devdogfish/etpzp-sms'],
  ]) {
    const response = await request.get(site + path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(307)
    expect(response.headers()['location']).toBe(target)
    const cookie = response.headers()['set-cookie']
    if (audience) expect(cookie).toContain(`audience=${audience};`)
    else expect(cookie).toBeUndefined()
  }
  const head = await request.head(site + '/go/software/profile/portfolio/external', { maxRedirects: 0 })
  expect(head.status()).toBe(307)
  expect(head.headers()['set-cookie']).toBeUndefined()
  for (const path of [
    '/go/admin-excel/profile/github/external',
    '/go/web-cms/project/etpzp-sms/repository',
    '/go/software/project/rbc-analytics/repository',
    '/go/software/profile/unknown/external',
    '/r/bad--slug',
    `/r/${longPost}p`,
  ]) {
    expect((await request.get(site + path, { maxRedirects: 0 })).status(), path).toBe(404)
  }
  expect(lookups).toHaveLength(before)
  const unknown = '0f0e0d0c0b'
  expect((await request.get(`${site}/r/${unknown}`, { maxRedirects: 0 })).status()).toBe(404)
  expect(lookups.slice(before)).toEqual([unknown])
})
