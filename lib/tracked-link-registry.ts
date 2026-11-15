import { unstable_cache } from 'next/cache';
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
class UnknownCode extends Error {}

// Cache the validated row only; transient failures and misses must not hide new registrations.
const cachedLookup = unstable_cache(async (endpoint: string, code: string) => {
  const token = process.env.QUANTSELF_TRACKED_LINKS_READ_TOKEN;
  if (!token) throw new Error('Missing registry read token');
  const response = await fetch(endpoint.replace(/\/$/, '') + '/' + code, {
    headers: { 'X-API-Key': token }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(1500),
  });
  if (response.status === 404) throw new UnknownCode();
  if (!response.ok) throw new Error('Tracked-link registry unavailable');
  const row = rowSchema.parse(await response.json());
  if (row.code !== code) throw new Error('Tracked-link code mismatch');
  return row;
}, ['tracked-link-v1'], { revalidate: 86_400 });

const pending = new Map<string, Promise<TrackedLink | null>>();

export async function lookupTrackedLink(code: string) {
  const endpoint = process.env.QUANTSELF_TRACKED_LINKS_URL;
  if (!endpoint) throw new Error('Missing registry URL');
  const inFlight = pending.get(code);
  if (inFlight) return inFlight;
  const result = cachedLookup(endpoint, code).catch(error => {
    if (error instanceof UnknownCode) return null;
    throw error;
  }).finally(() => pending.delete(code));
  pending.set(code, result);
  return result;
}
