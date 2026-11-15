import { z } from 'zod'
import { analyticsMaxBytes, analyticsMaxEvents, analyticsPath, analyticsReferrerHost } from './contract'

export const analyticsLinkCode = z.string().min(1).max(64).regex(/^[A-Za-z0-9][A-Za-z0-9-]*$/)
const label = z.string().min(1).max(100).regex(/^[A-Za-z0-9][A-Za-z0-9 ._-]*$/)
const target = z.string().min(1).max(100).regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)
const host = z.string().max(253).regex(analyticsReferrerHost)
const path = z.string().max(240).regex(analyticsPath)
const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
const base = z.object({
  id: uuid,
  occurred_at: z.string().datetime({ offset: true }),
  path,
  visitor_id: uuid.nullish(),
  session_id: uuid,
  page_view_id: uuid,
  link_code: analyticsLinkCode.nullish(),
  utm_source: label.nullish(),
  utm_medium: label.nullish(),
  utm_campaign: label.nullish(),
  referrer_host: host.nullish(),
}).strict()

export const browserBatch = z.object({
  events: z.array(z.discriminatedUnion('kind', [
    base.extend({
      kind: z.literal('page:view'),
      props: z.object({ isRestore: z.boolean().optional() }).strict(),
    }),
    base.extend({
      kind: z.literal('page:engagement'),
      props: z.object({ activeMs: z.number().int().min(0).max(86_400_000), maxScroll: z.number().min(0).max(100) }).strict(),
    }),
    base.extend({
      kind: z.literal('cta:click'),
      props: z.object({ cta: target, target: target.optional() }).strict(),
    }),
    base.extend({
      kind: z.literal('outbound:click'),
      props: z.object({ target }).strict(),
    }),
  ])).min(1).max(analyticsMaxEvents),
}).strict()

export async function readAnalyticsJson(request: Request, limit = analyticsMaxBytes) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return { status: 415 } as const
  }
  if (Number(request.headers.get('content-length')) > limit) return { status: 413 } as const

  const reader = request.body?.getReader()
  if (!reader) return { status: 400 } as const
  const chunks: Uint8Array[] = []
  let bytes = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > limit) {
        void reader.cancel().catch(() => {})
        return { status: 413 } as const
      }
      chunks.push(value)
    }
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks, bytes)))
    return { status: 200, value } as const
  } catch {
    return { status: 400 } as const
  } finally {
    reader.releaseLock()
  }
}
