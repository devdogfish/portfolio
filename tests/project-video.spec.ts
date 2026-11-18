import { expect, test } from '@playwright/test'
import { startNext } from './next-server'

test('a project walkthrough delegates clipboard writes to the YouTube frame', async ({ page }) => {
  const next = await startNext({})
  try {
    await page.route('https://www.youtube-nocookie.com/embed/**', route => route.fulfill({
      contentType: 'text/html',
      body: '<body>Walkthrough</body>',
    }))
    await page.goto(`${next.url}/project/home-infrastructure`)
    const video = page.locator('iframe[title="Home Infrastructure walkthrough"]')
    await video.scrollIntoViewIfNeeded()
    const clipboardWriteAllowed = await video.contentFrame().locator('body').evaluate(body => {
      const embeddedDocument = body.ownerDocument as Document & {
        featurePolicy: { allowsFeature: (feature: string) => boolean }
      }
      return embeddedDocument.featurePolicy.allowsFeature('clipboard-write')
    })
    expect(clipboardWriteAllowed).toBe(true)
  } finally {
    await next.stop()
  }
})
