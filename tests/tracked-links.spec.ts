import { createHmac } from 'node:crypto';
import { execFile, spawn, type ChildProcess } from 'node:child_process';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

const freshCode = 'k3Vw9QpX2nR7tLzA';
const issuedCode = '0123456789abcdef01234567';
const postCode = 'rbc-launch';
const fallbackCode = 'offline-test';
const unsafeCode = 'unsafe-target';
let registryOnline = false;
let releaseIngest: (() => void) | undefined;
const readKey = 'fixture-registry-read';
const ingestKey = 'fixture-event-ingest';
const lookups: string[] = [];
const events: { key: string | undefined; body: Record<string, unknown> }[] = [];
let site: string;
let fixtureDir: string;
let next: ChildProcess;

async function upstream(request: IncomingMessage, response: ServerResponse) {
  const path = request.url ?? '';
  const key = request.headers['x-api-key'] as string | undefined;
  if (path === '/api/v1/website-analytics/events' && request.method === 'POST') {
    let body = '';
    for await (const chunk of request) body += chunk;
    events.push({ key, body: JSON.parse(body) });
    if (request.headers['x-api-key'] === ingestKey && JSON.parse(body).events[0]?.props.ua === 'Browser waiting on ingest') {
      await new Promise<void>(resolve => { releaseIngest = resolve; });
    }
    response.writeHead(202).end();
    return;
  }
  const code = path.match(/^\/api\/v1\/tracked-links\/([a-zA-Z0-9-]+)$/)?.[1];
  if (!code || key !== readKey || request.method !== 'GET') {
    response.writeHead(401).end();
    return;
  }
  lookups.push(code);
  if (code === fallbackCode && !registryOnline) {
    response.writeHead(503).end();
    return;
  }
  if (code === postCode || code === fallbackCode || code === unsafeCode) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ code, kind: 'post', destinationPath: code === unsafeCode ? '//malicious.test/path' : '/projects/rbc' }));
    return;
  }
  if (code !== freshCode && code !== issuedCode) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ code, kind: 'application', track: 'software' }));
}

const api = createServer((request, response) => {
  void upstream(request, response).catch(() => response.writeHead(500).end());
});

test.beforeAll(async () => {
  test.setTimeout(120_000);
  const root = process.cwd();
  await mkdir(join(root, '.next'), { recursive: true });
  fixtureDir = await mkdtemp(join(root, '.next', 'tracked-links-'));
  // Build and run the full portfolio against loopback APIs and synthetic credentials.
  const paths = ['app', 'components', 'hooks', 'lib', 'public', 'styles', 'next.config.js', 'postcss.config.mjs', 'tsconfig.json'];
  if (existsSync(join(root, 'proxy.ts'))) paths.push('proxy.ts');
  await Promise.all(paths.map(path => cp(join(root, path), join(fixtureDir, path), { recursive: true })));
  await new Promise<void>(resolve => api.listen(0, '127.0.0.1', resolve));
  const address = api.address();
  if (!address || typeof address === 'string') throw Error('Missing fixture API address');
  const upstreamOrigin = `http://127.0.0.1:${address.port}`;
  const env = {
    PATH: process.env.PATH,
    NODE_ENV: 'production' as const,
    NEXT_TELEMETRY_DISABLED: '1',
    QUANTSELF_TRACKED_LINKS_URL: upstreamOrigin + '/api/v1/tracked-links',
    QUANTSELF_TRACKED_LINKS_READ_TOKEN: readKey,
    QUANTSELF_ANALYTICS_ORIGIN: upstreamOrigin,
    QUANTSELF_ANALYTICS_INGEST_TOKEN: ingestKey,
    VERCEL: '1',
    ANALYTICS_EXCLUDED_IPS: '192.0.2.1',
    ANALYTICS_IP_KEY: 'fixture-ip-secret',
  };
  const cli = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  await promisify(execFile)(process.execPath, [cli, 'build', '--webpack'], { cwd: fixtureDir, env });
  next = spawn(process.execPath, [cli, 'start', '--hostname', '127.0.0.1', '--port', '0'], {
    cwd: fixtureDir, env, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  site = await new Promise<string>((resolve, reject) => {
    const handle = (chunk: Buffer) => {
      output += chunk.toString();
      const url = output.match(/http:\/\/127\.0\.0\.1:[0-9]+/)?.[0];
      if (url && output.includes('Ready')) resolve(url);
    };
    next.stdout?.on('data', handle);
    next.stderr?.on('data', handle);
    next.once('error', reject);
    next.once('exit', code => reject(Error(`Fixture Next exited (${code}):\n${output}`)));
  });
});

test.afterAll(async () => {
  if (next?.exitCode === null && next.pid) {
    await new Promise<void>(resolve => {
      next.once('exit', () => resolve());
      next.kill();
    });
  }
  await new Promise<void>(resolve => api.close(() => resolve()));
  if (fixtureDir) await rm(fixtureDir, { recursive: true, force: true });
});

test('new résumé and issued résumé links reach the intended destinations', async ({ request }) => {
  const timings: number[] = [];
  for (const [path, location] of [
    [freshCode, `/audience/software?via=${freshCode}`],
    [`${freshCode}/rbc`, `/project/rbc-analytics?via=${freshCode}`],
    [`${issuedCode}/project/jobs/source/jobs-api`, 'https://github.com/devdogfish/jobs-api'],
    [`${issuedCode}/project/rbc`, `/project/rbc-analytics?via=${issuedCode}`],
    [`${issuedCode}/profile/github`, 'https://github.com/devdogfish'],
    [`${issuedCode}/project/rbc/demo`, 'https://rbc-analytics.demo.girke.dev/'],
  ]) {
    const start = performance.now();
    const reply = await request.get(`${site}/r/${path}`, { maxRedirects: 0 });
    timings.push(performance.now() - start);
    expect(reply.status(), path).toBe(307);
    expect(reply.headers()).toMatchObject({
      location,
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    });
    expect(reply.headers()['set-cookie']).toBeUndefined();
  }
  const page = await request.get(`${site}/r/${freshCode}`);
  expect(page.url()).toBe(`${site}/audience/software?via=${freshCode}`);
  expect(await page.text()).toContain('Download résumé');
  const first = timings[0];
  const warm: number[] = [];
  for (let i = 0; i < 12; i++) {
    const before = performance.now();
    const reply = await request.head(`${site}/r/${freshCode}/rbc`, { maxRedirects: 0 });
    warm.push(performance.now() - before);
    expect(reply.status()).toBe(307);
  }
  expect(lookups).toEqual([freshCode, issuedCode]);
  console.log(`Synthetic redirect: first ${first.toFixed(1)} ms; warm max ${Math.max(...warm).toFixed(1)} ms (12 HEAD requests)`);
});


test('posts redirect locally; misses return 404 and outages fall back without caching the failure', async ({ request }) => {
  const get = (path: string) => request.get(`${site}/r/${path}`, {
    maxRedirects: 0, headers: { 'x-vercel-forwarded-for': '192.0.2.42', 'user-agent': 'Fallback fixture' },
  });
  const post = await get(postCode);
  expect(post.status()).toBe(307);
  expect(post.headers().location).toBe('/projects/rbc?via=rbc-launch');

  const missing = await get('unknown-code');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('Link not found');
  expect(missing.headers()['cache-control']).toBe('no-store');
  expect((await get(`${freshCode}/profile/github`)).status()).toBe(404);
  expect((await get(`${issuedCode}/project/unknown`)).status()).toBe(404);
  expect((await get('Bad_Code')).status()).toBe(404);
  expect(lookups).not.toContain('Bad_Code');

  const fallback = await get(`${fallbackCode}/github`);
  expect(fallback.status()).toBe(307);
  expect(fallback.headers().location).toBe('/?via=offline-test');
  expect(fallback.headers()['cache-control']).toBe('no-store');
  registryOnline = true;
  expect((await get(fallbackCode)).headers().location).toBe('/projects/rbc?via=offline-test');
  expect(lookups.filter(code => code === fallbackCode)).toHaveLength(2);
  expect((await get(unsafeCode)).headers().location).toBe('/?via=unsafe-target');
  await expect.poll(() => recorded().find(event => event.link_code === fallbackCode && event.path.endsWith('/github'))).toMatchObject({
    kind: 'link:open', props: { method: 'GET', key: 'github' },
  });
});

type Open = { kind: string; id: string; path: string; link_code: string; occurred_at: string; ip_id: string; props: { ua?: string; key?: string; method: string } };

function recorded() {
  return events.flatMap(event => event.body.events as Open[]);
}

test('GET and HEAD record opens after the redirect and suppress owner IPs', async ({ request }) => {
  const publicIp = '192.0.2.42';
  const getHeaders = { 'x-vercel-forwarded-for': publicIp, 'user-agent': 'Browser waiting on ingest' };
  try {
    const reply = await request.get(`${site}/r/${freshCode}/rbc?ignored=1`, { maxRedirects: 0, headers: getHeaders, timeout: 2500 });
    expect(reply.status()).toBe(307);
    await expect.poll(() => releaseIngest !== undefined).toBe(true);
  } finally {
    releaseIngest?.();
  }

  const head = await request.head(`${site}/r/${issuedCode}/profile/github`, {
    maxRedirects: 0, headers: { 'x-vercel-forwarded-for': publicIp, 'user-agent': 'Headless scanner' },
  });
  expect(head.status()).toBe(307);
  expect(await head.body()).toHaveLength(0);
  expect(head.headers().location).toBe('https://github.com/devdogfish');
  const owner = await request.get(`${site}/r/${freshCode}`, {
    maxRedirects: 0, headers: { 'x-vercel-forwarded-for': '::ffff:192.0.2.1', 'user-agent': 'Owner fixture' },
  });
  expect(owner.status()).toBe(307);
  const ownerDevice = await request.get(`${site}/r/${freshCode}`, {
    maxRedirects: 0, headers: { 'x-vercel-forwarded-for': publicIp, 'user-agent': 'Owner device', cookie: 'analytics_owner=1' },
  });
  expect(ownerDevice.status()).toBe(307);

  await expect.poll(() => recorded().find(event => event.props.ua === 'Headless scanner')).toBeDefined();
  const opens = recorded().filter(event => ['Browser waiting on ingest', 'Headless scanner'].includes(event.props.ua ?? ''));
  expect(opens).toHaveLength(2);
  expect(new Set(opens.map(event => event.id)).size).toBe(2);
  expect(opens[0]).toMatchObject({ kind: 'link:open', link_code: freshCode, path: `/r/${freshCode}/rbc`, props: { method: 'GET', key: 'rbc' } });
  expect(opens[1]).toMatchObject({ kind: 'link:open', link_code: issuedCode, path: `/r/${issuedCode}/profile/github`, props: { method: 'HEAD', key: 'github' } });
  for (const open of opens) {
    const date = open.occurred_at.slice(0, 10);
    expect(open.ip_id).toBe(createHmac('sha256', 'fixture-ip-secret').update(`${date}|${publicIp}`).digest('hex'));
    expect(JSON.stringify(open)).not.toContain(publicIp);
  }
  expect(recorded().some(event => event.props.ua?.startsWith('Owner '))).toBe(false);
  expect(events.every(event => event.key === ingestKey && Object.keys(event.body).join() === 'events')).toBe(true);
});


test('the catalog is public, cacheable, and read only over HTTP', async ({ request }) => {
  const catalog = await request.get(`${site}/api/links`);
  expect(catalog.status()).toBe(200);
  expect(catalog.headers()).toMatchObject({
    'cache-control': 'public, max-age=60, s-maxage=300',
    'access-control-allow-origin': '*',
  });
  expect((await catalog.json()).destinations).toContainEqual({
    key: 'github',
    sourceUrls: expect.arrayContaining(['https://github.com/devdogfish']),
  });
  expect((await request.post(`${site}/api/links`, { data: {} })).status()).toBe(405);
});


test('portfolio and audience pages are prerendered and the retired routes are gone', async ({ request }) => {
  for (const path of ['/', '/contact', '/audience/software', '/audience/client/contact', '/project/rbc-analytics', '/job/rbc', '/privacy']) {
    const page = await request.get(`${site}${path}`);
    expect(page.status(), path).toBe(200);
    expect(page.headers()['cache-control'], path).not.toContain('no-store');
    expect(page.headers()['set-cookie'], path).toBeUndefined();
  }
  expect((await request.get(`${site}/audience/unknown`)).status()).toBe(404);
  expect((await request.get(`${site}/go/software/profile/github/external`)).status()).toBe(404);
  expect((await request.get(`${site}/api/link-catalog`)).status()).toBe(404);
});
