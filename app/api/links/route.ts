import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { applicationCodePattern } from '@/lib/application-links';
import { applicationLinks, linkDestinations, linkVariants } from '@/lib/link-catalog';

const headers = { 'Cache-Control': 'private, no-store' };
const variants = linkVariants.filter(v => v.resumeTrack);
const inputSchema = z.object({
  applicationId: z.string().uuid().describe('UUID; keep the same ID for the same application.'),
  variant: z.string().max(40).describe(`Variant ID or resume track: ${variants.map(v => `${v.id} (${v.resumeTrack})`).join(', ')}.`),
  company: z.string().trim().min(1).max(200).describe('Nonempty string, at most 200 characters.'),
  role: z.string().trim().min(1).max(200).describe('Nonempty string, at most 200 characters.'),
  revision: z.number().int().positive().max(2147483646).describe('Positive integer, at most 2147483646.'),
  format: z.enum(['replacements']).optional().describe('Use replacements for a flat original URL to tracked URL map; omit for named links.'),
}).strict();

const documentation = 'https://girke.dev/api/links';
const fields = Object.fromEntries(Object.entries(inputSchema.shape).map(([key, schema]) => [key, {
  required: !schema.isOptional(), description: schema.description,
}]));
const fieldHelp: Record<string, string> = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.description ?? 'Invalid field.']));
const example = { applicationId: '11111111-1111-4111-8111-111111111111', variant: 'software', company: 'Example', role: 'Developer', revision: 1 };
const guide = {
  purpose: 'Create application-specific portfolio links for a résumé or job application.',
  authentication: 'POST requires the owner-provided credential in the X-API-Key header. Keep it private; do not put it in a URL or client-side code. GET requires no credential.',
  method: 'POST JSON to https://girke.dev/api/links. Maximum body size: 4096 bytes.',
  fields,
  revisions: 'Use a stable UUID per application. Identical retries are safe. Increment revision when details change; an older revision or different details at the same revision returns 409.',
  destinations: linkDestinations.filter(item => item.kind !== 'portfolio').map(({ id, label }) => ({ id, label })),
  requestExample: example,
  responseExample: applicationLinks('0123456789abcdef01234567'),
  replacements: 'Set format to replacements to receive only a flat map of source URLs to tracked URLs. GET sourceUrls lists recognized originals.',
  errors: { '400': 'Invalid JSON or fields; check field messages.', '401': 'Provide the owner credential as X-API-Key.', '409': 'Revision conflict; use the current application details or a newer revision.', '413': 'Body exceeds 4096 bytes.', '503': 'Registration unavailable; retry later.' },
  privacy: 'Application links associate visits and clicks with an application, not an individual reader. A first-party selection cookie can retain attribution for 90 days; a new audience link changes it. Analytics respects Do Not Track and Global Privacy Control. Activity is retained up to 90 days in a private dashboard. See https://girke.dev/privacy.',
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function GET(request?: Request) {
  const available = variants.map(({ id, label, resumeTrack }) => ({ id, label, resumeTrack }));
  const responseHeaders = { 'Cache-Control': 'public, max-age=60, s-maxage=300', Vary: 'Accept' };
  if (request?.headers.get('accept')?.includes('text/html')) {
    const sections = Object.entries({ ...guide, variants: available }).map(([title, value]) =>
      `<section><h2>${escapeHtml(title)}</h2><pre>${escapeHtml(typeof value === 'string' ? value : JSON.stringify(value, null, 2))}</pre></section>`).join('');
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Application links API</title><style>body{font:16px/1.5 system-ui;max-width:860px;margin:2rem auto;padding:0 1rem}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}h2{font-size:1.1rem;margin-top:2rem}</style></head><body><h1>Application links API</h1>${sections}</body></html>`, { headers: { ...responseHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return Response.json({ variants: available, sourceUrls: [...new Set(linkDestinations.flatMap(item => item.sourceUrls))], help: guide }, { headers: responseHeaders });
}

function failure(error: string, status: number, message: string, fields?: Record<string, string>) {
  return Response.json({ error, message, documentation, ...(fields && { fields }) }, { status, headers });
}

export async function POST(request: Request) {
  const token = process.env.APPLICATION_LINKS_TOKEN;
  const supplied = Buffer.from(request.headers.get('x-api-key') ?? '');
  const expected = Buffer.from(token ?? '');
  if (!token || expected.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return failure('UNAUTHENTICATED', 401, 'Provide the owner credential in the X-API-Key header.');
  }
  const reader = request.body?.getReader();
  if (!reader) return failure('INVALID_REQUEST', 400, 'Send a valid JSON object with the required fields.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4096) { await reader.cancel(); return failure('TOO_LARGE', 413, 'Keep the request body within 4096 bytes.'); }
      chunks.push(value);
    }
  } catch { return failure('INVALID_REQUEST', 400, 'Send a valid JSON object with the required fields.'); }
  let json: unknown;
  try { json = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { /* invalid JSON */ }
  const parsed = inputSchema.safeParse(json);
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map(issue => {
      const field = String(issue.path[0] ?? 'body');
      return [field, fieldHelp[field] ?? 'Only the documented fields are accepted.'];
    }));
    return failure('INVALID_REQUEST', 400, 'Correct the indicated fields.', fields);
  }
  const { variant, format, ...registration } = parsed.data;
  const selected = variants.find(v => v.id === variant || v.resumeTrack === variant);
  if (!selected) return failure('INVALID_VARIANT', 400, fieldHelp.variant, { variant: fieldHelp.variant });
  try {
    const endpoint = process.env.APPLICATION_LINKS_REGISTRY_URL;
    if (!endpoint) throw new Error('Missing registry');
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': token },
      body: JSON.stringify({ ...registration, cohort: selected.id }),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(4000),
    });
    if (response.status === 409) return failure('APPLICATION_REVISION_CONFLICT', 409, 'Use the current application details or a newer revision.');
    if (!response.ok) throw new Error('Registry unavailable');
    const result = await response.json();
    if (typeof result.code !== 'string' || !applicationCodePattern.test(result.code) || result.cohort !== selected.id) throw new Error('Invalid registry response');
    return Response.json(applicationLinks(result.code, format === 'replacements'), { headers });
  } catch { return failure('REGISTRY_UNAVAILABLE', 503, 'Registration is temporarily unavailable; retry later.'); }
}
