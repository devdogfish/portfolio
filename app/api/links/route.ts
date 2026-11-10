import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { applicationCodePattern } from '@/lib/application-links';
import { applicationLinks, linkDestinations, linkVariants } from '@/lib/link-catalog';
import { projects } from '@/lib/data';

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
const fieldHelp: Record<string, string> = Object.fromEntries(Object.entries(inputSchema.shape).map(([key, schema]) => [key, schema.description ?? 'Invalid field.']));

export function GET() {
  return Response.json({
    project: linkDestinations.filter(item => item.kind === 'project').map(item => ({
      key: item.suffix.slice('/project/'.length),
      description: item.target === 'case-study' ? projects.find(project => project.slug === item.contentId)!.subtitle : item.label,
    })),
    profile: linkDestinations.filter(item => item.kind === 'profile').map(item => ({ key: item.contentId, description: item.label })),
    variant: linkVariants.map(item => ({ key: item.id, description: item.label })),
  }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } });
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
