import { expect, test } from '@playwright/test';
import { resolveApplicationDestination } from '../lib/application-links';
import type { AnalyticsEvent } from '../lib/analytics-contract';

const code = process.env.APPLICATION_TEST_CODE;
test('destination routing accepts only registered targets', () => {
  expect(resolveApplicationDestination(['profile','github'])?.path).toBe('https://github.com/devdogfish');
  expect(resolveApplicationDestination(['project','rbc','demo'])?.path).toBe('https://rbc-analytics.demo.girke.dev');
  expect(resolveApplicationDestination(['project','rbc'])?.path).toBe('/project/rbc-analytics');
  expect(resolveApplicationDestination(['project','etpzp-sms','source'])?.path).toBe('https://github.com/devdogfish/etpzp-sms');
  for (const parts of [['profile','unknown'], ['project','rbc','https://evil.test'], ['profile','github','extra'], ['project','__proto__','constructor']]) {
    expect(resolveApplicationDestination(parts)).toBeUndefined();
  }
});

test('application links remember audience and keep attribution on website clicks', async ({ page, request }) => {
  test.skip(!code, 'Requires local application registry');
  const batches: AnalyticsEvent[] = [];
  await page.route('**/api/events', async route => {
    batches.push(...route.request().postDataJSON().events);
    await route.fulfill({status: 204});
  });
  await page.clock.install();
  await page.goto(`/r/${code}`);
  await expect(page).toHaveURL(/\/$/);
  await page.clock.runFor(16000);
  await expect.poll(() => batches.find(e => e.type === 'page_view')?.applicationCode).toBe(code);
  await page.locator('[data-track=project_open]').first().click();
  await page.clock.runFor(16000);
  await expect.poll(() => batches.find(e => e.type === 'cta_click')?.applicationCode).toBe(code);
  await page.goto('/');
  expect((await page.context().cookies()).find(c => c.name === 'portfolio_audience')?.value).toBe(code);
  for (const [suffix, destination] of [['profile/github', 'https://github.com/devdogfish'], ['project/rbc/demo', 'https://rbc-analytics.demo.girke.dev'], ['project/rbc','/project/rbc-analytics']]) {
    const response = await request.head(`/r/${code}/${suffix}`, {maxRedirects:0});
    expect(response.status()).toBe(302);
    expect(response.headers().location).toContain(destination);
  }
  expect((await request.get(`/r/${code}/profile/not-registered`)).status()).toBe(404);
});

test('catalog advertises only destinations resolved by the same router', async ({ request }) => {
  const response = await request.get('/api/link-catalog');
  expect(response.status()).toBe(200);
  const catalog = await response.json();
  expect(catalog.schemaVersion).toBe(1);
  expect(catalog.variants.map((v: {id:string}) => v.id)).toEqual(['default','client','software','web-cms','admin-excel']);
  const seen = new Map<string,string>();
  for (const destination of catalog.destinations) {
    for (const source of destination.sourceUrls) {
      expect(seen.get(source) ?? destination.urlTemplate).toBe(destination.urlTemplate);
      seen.set(source,destination.urlTemplate);
    }
    if (destination.kind === 'portfolio') continue;
    for (const template of [destination.urlTemplate,...destination.aliasTemplates]) {
      const suffix = template.split('/r/{code}/')[1];
      const resolved = resolveApplicationDestination(suffix.split('/'));
      expect(resolved,template).toBeDefined();
      expect(new URL(resolved!.path, 'https://girke.dev').href).toBe(new URL(destination.targetUrl).href);
    }
  }
  expect(catalog.destinations.some((d: {urlTemplate:string}) => d.urlTemplate.endsWith('/project/jobs/source/jobs-api'))).toBe(true);
});
