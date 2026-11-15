import { spawn } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const checkout = resolve(import.meta.dirname, '../..')
const scratch = mkdtempSync(join(tmpdir(), 'portfolio-analytics-fixture-'))
const sitePort = process.env.ANALYTICS_FIXTURE_SITE_PORT ?? '4179'
const upstreamPort = Number(process.env.ANALYTICS_FIXTURE_UPSTREAM_PORT ?? '4180')
const token = 'synthetic fixture analytics token'

for (const file of [
  'app/api/e/route.ts', 'app/contact/inquiry-action.ts', 'components/analytics-tracker.tsx',
  'components/portfolio-contact-form.tsx', 'lib/analytics', 'lib/analytics-ip.ts',
  'package.json', 'tsconfig.json', 'next.config.js',
]) {
  mkdirSync(dirname(join(scratch, file)), { recursive: true })
  cpSync(join(checkout, file), join(scratch, file), { recursive: true })
}
symlinkSync(join(checkout, 'node_modules'), join(scratch, 'node_modules'))
writeFileSync(join(scratch, 'app/layout.tsx'), `
import { Suspense, type ReactNode } from 'react'
import { AnalyticsTracker } from '@/components/analytics-tracker'
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><Suspense><AnalyticsTracker /></Suspense>{children}</body></html>
}
`)
writeFileSync(join(scratch, 'app/page.tsx'), `
import Link from 'next/link'
import { PortfolioContactForm } from '@/components/portfolio-contact-form'
export default function Page() {
  return <main style={{ minHeight: '220vh' }}>
    <h1>Analytics fixture</h1>
    <Link href="/next" prefetch={false}>Next page</Link>
    <button data-track="cta:contact" data-track-target="contact-form">Contact CTA</button>
    <a href="https://example.com/">External example</a>
    <PortfolioContactForm />
  </main>
}
`)
mkdirSync(join(scratch, 'app/next'))
writeFileSync(join(scratch, 'app/next/page.tsx'), "export { default } from '../page'\n")

let deliveries: { path: string; data: unknown }[] = []
let refuseNextInquiry = false
const upstream = createServer(async (request, response) => {
  if (request.url === '/deliveries' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(deliveries))
    return
  }
  if (request.url?.startsWith('/reset') && request.method === 'POST') {
    deliveries = []
    refuseNextInquiry = request.url === '/reset?refuse-inquiry'
    response.writeHead(204).end()
    return
  }
  if (request.method !== 'POST' || request.headers['x-api-key'] !== token ||
      !/^\/api\/v1\/website-analytics\/(events|inquiries)$/.test(request.url ?? '')) {
    response.writeHead(404).end()
    return
  }
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk)
  const data: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  deliveries.push({ path: request.url!, data })
  if (refuseNextInquiry && request.url!.endsWith('/inquiries')) {
    refuseNextInquiry = false
    response.writeHead(503).end()
  } else response.writeHead(202).end()
})
upstream.listen(upstreamPort, '127.0.0.1')

const next = spawn('node', [
  join(checkout, 'node_modules/next/dist/bin/next'), 'dev', scratch, '--webpack', '--hostname', '127.0.0.1', '--port', sitePort,
], {
  cwd: scratch,
  env: {
    ...process.env, VERCEL: '0', NEXT_TELEMETRY_DISABLED: '1',
    OWNER_TRACKING_SECRET: 'fixture-owner-only',
    QUANTSELF_ANALYTICS_ORIGIN: `http://127.0.0.1:${upstreamPort}`, QUANTSELF_ANALYTICS_INGEST_TOKEN: token,
  },
  stdio: 'inherit',
})
process.on('SIGTERM', () => next.kill('SIGTERM'))
process.on('SIGINT', () => next.kill('SIGINT'))
next.on('exit', code => {
  upstream.close()
  rmSync(scratch, { recursive: true, force: true })
  process.exit(code ?? 0)
})
