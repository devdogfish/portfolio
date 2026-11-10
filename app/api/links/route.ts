import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { applicationCodePattern } from '@/lib/application-links';
import { applicationLinks, linkVariants } from '@/lib/link-catalog';

const headers = { 'Cache-Control': 'private, no-store' };
const variants = linkVariants.filter(v => v.resumeTrack);
const inputSchema = z.object({
  applicationId: z.string().uuid(),
  variant: z.string().max(40),
  company: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  revision: z.number().int().positive().max(2147483646),
  format: z.enum(['replacements']).optional(),
}).strict();

export function GET() {
  return Response.json({ variants: variants.map(({ id, label, resumeTrack }) => ({ id, label, resumeTrack })) });
}

export async function POST(request: Request) {
  const token = process.env.APPLICATION_LINKS_TOKEN;
  const supplied = Buffer.from(request.headers.get('x-api-key') ?? '');
  const expected = Buffer.from(token ?? '');
  if (!token || expected.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return Response.json({ error: 'UNAUTHENTICATED' }, { status: 401, headers });
  }
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: 'INVALID_REQUEST' }, { status: 400, headers });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4096) { await reader.cancel(); return Response.json({ error: 'TOO_LARGE' }, { status: 413, headers }); }
      chunks.push(value);
    }
  } catch { return Response.json({ error: 'INVALID_REQUEST' }, { status: 400, headers }); }
  let json: unknown;
  try { json = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { /* invalid JSON */ }
  const parsed = inputSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: 'INVALID_REQUEST' }, { status: 400, headers });
  const { variant, format, ...registration } = parsed.data;
  const selected = variants.find(v => v.id === variant || v.resumeTrack === variant);
  if (!selected) return Response.json({ error: 'INVALID_VARIANT' }, { status: 400, headers });
  try {
    const endpoint = process.env.APPLICATION_LINKS_REGISTRY_URL;
    if (!endpoint) throw new Error('Missing registry');
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': token },
      body: JSON.stringify({ ...registration, cohort: selected.id }),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(4000),
    });
    if (response.status === 409) return Response.json({ error: 'APPLICATION_REVISION_CONFLICT' }, { status: 409, headers });
    if (!response.ok) throw new Error('Registry unavailable');
    const result = await response.json();
    if (typeof result.code !== 'string' || !applicationCodePattern.test(result.code) || result.cohort !== selected.id) throw new Error('Invalid registry response');
    return Response.json(applicationLinks(result.code, format === 'replacements'), { headers });
  } catch { return Response.json({ error: 'REGISTRY_UNAVAILABLE' }, { status: 503, headers }); }
}
