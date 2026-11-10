import { z } from "zod"

export const scrollThresholds = [25, 50, 75, 90] as const
export const analyticsBatchLimit = 20
export const analyticsToken = z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/)

const base = z.object({
  eventId: z.string().uuid(),
  visitorId: z.string().uuid(),
  sessionId: z.string().uuid(),
  pageViewId: z.string().uuid(),
  seq: z.number().int().positive(),
  occurredAt: z.string().datetime(),
  cohort: analyticsToken,
  path: z.string().min(1).max(240).regex(/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]*$/),
}).strict()

export const analyticsEventSchema = z.discriminatedUnion("type", [
  base.extend({
    type: z.literal("page_view"),
    properties: z.object({
      source: analyticsToken,
      entryCode: analyticsToken.optional(),
      referrer: z.string().max(253).regex(/^[a-z0-9.-]+$/).optional(),
      device: z.enum(["mobile", "tablet", "desktop"]),
    }).strict(),
  }),
  base.extend({
    type: z.literal("engagement"),
    properties: z.object({
      activeMs: z.number().int().nonnegative().max(86_400_000),
      visibleMs: z.number().int().nonnegative().max(86_400_000),
    }).strict(),
  }),
  base.extend({
    type: z.literal("scroll"),
    properties: z.object({
      threshold: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(90)]),
    }).strict(),
  }),
  base.extend({
    type: z.literal("cta_click"),
    properties: z.object({
      action: analyticsToken,
      target: analyticsToken.optional(),
    }).strict(),
  }),
])

export const analyticsBatchSchema = z.object({
  events: z.array(analyticsEventSchema).min(1).max(analyticsBatchLimit),
}).strict()

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>
