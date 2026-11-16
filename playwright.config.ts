import { defineConfig } from '@playwright/test'

// Specs start their own `next start` against the existing build: run `npm run build` first.
export default defineConfig({ testDir: 'tests', timeout: 60_000 })
