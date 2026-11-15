import { expect, test } from '@playwright/test';
import { GET } from '../app/api/links/route';

test('the public catalog exposes flat renderer keys and preserves discovery lists', async () => {
  const response = GET();
  expect(response.headers.get('cache-control')).toMatch(/^public,.*s-maxage=\d+/);
  const catalog = await response.json();
  expect(catalog.schemaVersion).toBe(1);
  expect(catalog.variant.map((row: { key: string }) => row.key)).toEqual(['default', 'client', 'software', 'web-cms', 'admin-excel']);
  expect(catalog.project).toContainEqual({ key: 'jobs/source/jobs-api', description: 'Job Search Automation — Backend API' });
  expect(catalog.profile).toContainEqual({ key: 'github', description: 'Code repositories and contributions on GitHub.' });

  const entries = catalog.destinations as { key: string | null; sourceUrls: string[] }[];
  const sources = entries.flatMap(entry => entry.sourceUrls);
  expect(new Set(entries.map(entry => entry.key)).size).toBe(entries.length);
  expect(new Set(sources).size).toBe(sources.length);
  expect(entries.filter(entry => entry.key === null)).toHaveLength(1);
  for (const entry of entries) {
    if (entry.key !== null) expect(entry.key).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(Object.keys(entry).sort()).toEqual(['key', 'sourceUrls']);
    expect(entry.sourceUrls.length).toBeGreaterThan(0);
    for (const source of entry.sourceUrls) expect(new URL(source).protocol).toBe('https:');
  }
  expect(entries.find(entry => entry.key === null)?.sourceUrls).toEqual(expect.arrayContaining([
    'https://girke.dev', 'https://girke.dev/', 'https://luigigirke.com/',
  ]));
  expect(entries.find(entry => entry.key === 'rbc-demo')?.sourceUrls).toEqual(expect.arrayContaining([
    'https://rbc-analytics.demo.girke.dev', 'https://rbc-analytics.demo.girke.dev/',
  ]));
  expect(entries.find(entry => entry.key === 'github')?.sourceUrls).toEqual(expect.arrayContaining([
    'https://github.com/devdogfish', 'https://github.com/devdogfish/',
    'https://girke.dev/go/software/profile/github/external',
  ]));
});
