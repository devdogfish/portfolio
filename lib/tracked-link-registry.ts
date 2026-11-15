import { cacheLife } from 'next/cache';
import { z } from 'zod';

export const issuedApplicationCode = /^[a-f0-9]{24}$/;
export const validTrackedCode = (code: string) =>
  code.length <= 64 && !/\s/.test(code) &&
  (/^[A-Za-z0-9]{16}$/.test(code) || issuedApplicationCode.test(code) || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code));

const rowSchema = z.discriminatedUnion('kind', [
  z.object({ code: z.string(), kind: z.literal('application'), track: z.enum(['software', 'web-cms', 'admin-excel']) }),
  z.object({
    code: z.string(), kind: z.literal('post'),
    destinationPath: z.string().max(240).regex(/^\/(?:[A-Za-z0-9_~-][A-Za-z0-9._~-]*(?:\/[A-Za-z0-9_~-][A-Za-z0-9._~-]*)*\/?)?$/).refine(path => !/\s/.test(path)),
  }),
]);
type TrackedLink = z.infer<typeof rowSchema>;

async function fetchRegistry(endpoint: string, code: string): Promise<TrackedLink | null> {
  const token = process.env.QUANTSELF_TRACKED_LINKS_READ_TOKEN;
  if (!token) throw new Error('Missing registry read token');
  const url = new URL(endpoint);
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
    throw new Error('Invalid registry origin');
  }
  url.pathname = url.pathname.replace(/\/$/, '') + '/' + code;

  const response = await fetch(url, {
    headers: { 'X-API-Key': token }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(1500),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Tracked-link registry unavailable');
  const row = rowSchema.parse(await response.json());
  if (row.code !== code) throw new Error('Tracked-link code mismatch');
  return row;
}

type Lookup = TrackedLink | null | undefined;

async function cachedLookup(endpoint: string, code: string): Promise<Lookup> {
  'use cache';
  let row;
  try { row = await fetchRegistry(endpoint, code); }
  catch { row = undefined; }
  // A 404 can become valid after registration; an outage should recover on the next request.
  if (row) cacheLife('days');
  else cacheLife({ stale: 0, revalidate: 0, expire: 0 });
  return row;
}

const pending = new Map<string, Promise<Lookup>>();

export async function lookupTrackedLink(code: string): Promise<Lookup> {
  const endpoint = process.env.QUANTSELF_TRACKED_LINKS_URL;
  if (!endpoint) return;
  const inFlight = pending.get(code);
  if (inFlight) return inFlight;
  const result = cachedLookup(endpoint, code).finally(() => pending.delete(code));
  pending.set(code, result);
  return result;
}
