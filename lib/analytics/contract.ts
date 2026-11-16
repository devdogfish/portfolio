export const analyticsMaxEvents = 50
export const analyticsMaxBytes = 32 * 1024
export const analyticsPath = /^\/(?:[A-Za-z0-9][A-Za-z0-9._~-]*(?:\/[A-Za-z0-9][A-Za-z0-9._~-]*)*\/?)?$/
export const analyticsReferrerHost = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/

type EventFields = {
  id: string
  occurred_at: string
  path: string
  visitor_id?: string | null
  ip_id?: string | null
  link_code?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  referrer_host?: string | null
  device?: 'desktop' | 'mobile' | null
}

export type BrowserAnalyticsEvent = EventFields & {
  session_id: string
  page_view_id: string
} & (
  | { kind: 'page:view'; props: { isRestore?: boolean } }
  | { kind: 'page:engagement'; props: { activeMs: number; maxScroll: number } }
  | { kind: 'cta:click'; props: { cta: string; target?: string } }
  | { kind: 'outbound:click'; props: { target: string } }
)

export type AnalyticsEvent = BrowserAnalyticsEvent | (EventFields & {
  session_id?: string | null
  page_view_id?: string | null
} & (
  | { kind: 'link:open'; link_code?: string; props: { method: 'GET' | 'HEAD'; key?: string; ua?: string } }
  | { kind: 'contact_form:submit'; props: { method?: 'form'; result?: 'ok' | 'validation_error' | 'server_error' } }
  | { kind: 'booking:confirm'; props: { minutes: 30 } }
))

export type AnalyticsInquiry = {
  id: string
  name: string
  email: string
  topic: string
  message: string
  link_code?: string | null
}
