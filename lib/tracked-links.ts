import { cacheLife } from 'next/cache'
import { z } from 'zod'
import { tracks } from '@/content/views'
import { audiences, normalizeTrack } from '@/lib/audience'

// The registry decides validity for new and previously issued codes.
export const validTrackedCode = (code: string) => /^[A-Za-z0-9]{1,24}$/.test(code)

const row = z.discriminatedUnion('kind', [
  z.object({ code: z.string(), kind: z.literal('application'), track: z.preprocess(normalizeTrack, z.enum(tracks)) }),
  z.object({ code: z.string(), kind: z.literal('share'), track: z.preprocess(normalizeTrack, z.enum(audiences)).nullable() }),
])
type TrackedLink = z.infer<typeof row>

async function fetchRow(code: string): Promise<TrackedLink | null> {
  const endpoint = process.env.TRACKED_LINKS_URL
  const token = process.env.TRACKED_LINKS_TOKEN
  if (!endpoint || !token) throw new Error('Tracked-link registry is not configured')
  const url = new URL(endpoint)
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) throw new Error('Invalid registry origin')
  url.pathname = url.pathname.replace(/\/$/, '') + '/' + encodeURIComponent(code)
  const response = await fetch(url, {
    headers: { 'X-API-Key': token },
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
