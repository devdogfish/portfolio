import { cacheLife } from 'next/cache'
import { z } from 'zod'
import { tracks } from '@/content/views'

// New codes are 16-char base62, post codes are slugs, older résumé codes are
// 24-char hex and entry codes 10-char hex. Accept the shape; the registry decides.
export const trackedCode = /^[A-Za-z0-9-]{4,32}$/

const audience = z.enum(['software', 'web-cms', 'admin-excel', 'client']) satisfies z.ZodType<(typeof tracks)[number] | 'client'>
const row = z.union([
  z.object({
    code: z.string(), kind: z.literal('post'),
    destinationPath: z.string().max(240).regex(/^\/[A-Za-z0-9._~/-]*$/).refine(path => !path.includes('//')),
  }),
  // Applications (résumés) and any other link kind: the track picks the landing view.
  z.object({ code: z.string(), kind: z.string(), track: audience.nullish() }),
])
export type TrackedLink = z.infer<typeof row>

async function fetchRow(code: string): Promise<TrackedLink | null> {
  const endpoint = process.env.TRACKED_LINKS_URL
  const token = process.env.TRACKED_LINKS_TOKEN
  if (!endpoint || !token) throw new Error('Tracked-link registry is not configured')
  const url = new URL(endpoint)
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) throw new Error('Invalid registry origin')
  url.pathname = url.pathname.replace(/\/$/, '') + '/' + encodeURIComponent(code)
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-API-Key': token },
    cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(1500),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Tracked-link registry unavailable')
  const parsed = row.parse(await response.json())
  if (parsed.code !== code) throw new Error('Tracked-link code mismatch')
  return parsed
}

type Lookup = TrackedLink | null | undefined

// Found rows are cached for days (they never change). Misses and outages are not
// cached, so a newly registered code or a recovered registry works immediately.
async function cachedLookup(code: string): Promise<Lookup> {
  'use cache'
  let result: Lookup
  try {
    result = await fetchRow(code)
  } catch {
    result = undefined
  }
  if (result) cacheLife('days')
  else cacheLife({ stale: 0, revalidate: 0, expire: 0 })
  return result
}

const pending = new Map<string, Promise<Lookup>>()

/** Row, `null` for an unknown code, `undefined` when the registry is unreachable. */
export function lookupTrackedLink(code: string): Promise<Lookup> {
  const inFlight = pending.get(code)
  if (inFlight) return inFlight
  const result = cachedLookup(code).finally(() => pending.delete(code))
  pending.set(code, result)
  return result
}
