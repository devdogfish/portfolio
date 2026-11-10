import { expect, test } from '@playwright/test';
import { GET, POST } from '../app/api/links/route';

const token = 'a'.repeat(32);
const payload = { applicationId: '11111111-1111-4111-8111-111111111111', variant: 'engineering', company: 'Example', role: 'Developer', revision: 1 };
const request = (body: string, key = token) => new Request('http://localhost/api/links', { method: 'POST', headers: { 'X-API-Key': key }, body });

test('links API validates, registers and generates links from the catalog', async () => {
  const oldToken = process.env.APPLICATION_LINKS_TOKEN;
  const oldUrl = process.env.APPLICATION_LINKS_REGISTRY_URL;
  const oldFetch = globalThis.fetch;
  process.env.APPLICATION_LINKS_TOKEN = token;
  process.env.APPLICATION_LINKS_REGISTRY_URL = 'https://registry.example.test';
  let forwarded: Record<string, unknown> = {};
  globalThis.fetch = async (_input, init) => {
    expect(new Headers(init?.headers).get('X-API-Key')).toBe(token);
    forwarded = JSON.parse(String(init?.body));
    return Response.json({ code: 'a'.repeat(24), cohort: 'software' });
  };
  try {
    const discovery = await GET().json();
    expect(discovery.variants.map((v: { id: string }) => v.id)).toEqual(['software', 'web-cms', 'admin-excel']);
    expect(discovery.sourceUrls).toContain('https://github.com/devdogfish/jobs-api');
    expect(new Set(discovery.sourceUrls).size).toBe(discovery.sourceUrls.length);
    expect(discovery.help.fields.applicationId.required).toBe(true);
    expect(discovery.help.fields.format.required).toBe(false);
    const html = await GET(new Request('http://localhost/api/links', { headers: { Accept: 'text/html' } }));
    expect(html.headers.get('vary')).toBe('Accept');
    expect(await html.text()).toContain(discovery.help.authentication);
    const invalid = await POST(request(JSON.stringify({ ...payload, company: '' })));
    const problem = await invalid.json();
    expect(problem.fields.company).toContain('200');
    expect(problem.documentation).toBe('https://girke.dev/api/links');
    expect((await POST(request('{}', 'wrong'))).status).toBe(401);
    expect((await POST(request('{'))).status).toBe(400);
    expect((await POST(request(JSON.stringify({ ...payload, variant: 'bogus' })))).status).toBe(400);
    expect((await POST(request('x'.repeat(4097)))).status).toBe(413);
    const response = await POST(request(JSON.stringify(payload)));
    expect(response.status).toBe(200);
    expect(forwarded).toEqual({ applicationId: payload.applicationId, company: 'Example', role: 'Developer', revision: 1, cohort: 'software' });
    const links = await response.json();
    expect(links.portfolio).toBe(`https://girke.dev/r/${'a'.repeat(24)}`);
    expect(links.profiles.github).toBe(`${links.portfolio}/profile/github`);
    expect(links.projects.jobs.sources['jobs-api']).toBe(`${links.portfolio}/project/jobs/source/jobs-api`);
    const replacements = await (await POST(request(JSON.stringify({ ...payload, format: 'replacements' })))).json();
    expect(replacements['https://github.com/devdogfish/jobs-api']).toBe(links.projects.jobs.sources['jobs-api']);
    globalThis.fetch = async () => new Response(null, { status: 409 });
    expect((await POST(request(JSON.stringify(payload)))).status).toBe(409);
    globalThis.fetch = async () => { throw new Error('offline'); };
    expect((await POST(request(JSON.stringify(payload)))).status).toBe(503);
  } finally {
    if (oldToken === undefined) delete process.env.APPLICATION_LINKS_TOKEN; else process.env.APPLICATION_LINKS_TOKEN = oldToken;
    if (oldUrl === undefined) delete process.env.APPLICATION_LINKS_REGISTRY_URL; else process.env.APPLICATION_LINKS_REGISTRY_URL = oldUrl;
    globalThis.fetch = oldFetch;
  }
});
