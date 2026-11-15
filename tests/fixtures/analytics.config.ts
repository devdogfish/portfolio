import { resolve } from 'node:path'
import { defineConfig } from '@playwright/test'

const checkout = resolve(__dirname, '../..')
const site = 'http://127.0.0.1:' + (process.env.ANALYTICS_FIXTURE_SITE_PORT ?? '4179')

export default defineConfig({
  testDir: '.',
  testMatch: 'analytics.e2e.ts',
  outputDir: resolve(checkout, '.next/analytics-fixture-results'),
  workers: 1,
  use: {
    baseURL: site,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  },
  webServer: {
    command: 'bun tests/fixtures/analytics-server.ts',
    cwd: checkout,
    url: site,
    timeout: 60_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
})
