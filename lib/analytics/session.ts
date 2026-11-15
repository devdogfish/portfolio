import type { BrowserAnalyticsEvent } from './contract'

export const sessionIdleMs = 30 * 60_000
export const ownerStorageKey = 'analytics:owner'
const sessionKey = 'analytics:session'

export type Attribution = Pick<BrowserAnalyticsEvent, 'link_code' | 'utm_source' | 'utm_medium' | 'utm_campaign'>
export type AnalyticsSession = { id: string; time: number; attribution: Attribution }

export function readAnalyticsSession(): AnalyticsSession | undefined {
  try {
    const session: AnalyticsSession | null = JSON.parse(sessionStorage.getItem(sessionKey) ?? 'null')
    if (session && Date.now() - session.time < sessionIdleMs) return session
  } catch {}
}

export function storeAnalyticsSession(session: AnalyticsSession) {
  try { sessionStorage.setItem(sessionKey, JSON.stringify(session)) } catch {}
}

export function readAnalyticsLinkCode() {
  return readAnalyticsSession()?.attribution?.link_code ?? undefined
}
