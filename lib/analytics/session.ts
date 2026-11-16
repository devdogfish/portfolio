import type { BrowserAnalyticsEvent } from './contract'

// The tracker (tracker.ts) writes this session to sessionStorage. Only the shape is
// shared here: importing values from this file into the tracker would split it into
// its own chunk and push the tracker past its size budget.
export type Attribution = Pick<BrowserAnalyticsEvent, 'link_code' | 'utm_source' | 'utm_medium' | 'utm_campaign'>
export type AnalyticsSession = { id: string; time: number; attribution: Attribution }

/** The tracked-link code of the current session, for the contact form. */
export function readAnalyticsLinkCode() {
  try {
    const session: AnalyticsSession | null = JSON.parse(sessionStorage.getItem('analytics:session') ?? 'null')
    if (session && Date.now() - session.time < 30 * 60_000) return session.attribution?.link_code ?? undefined
  } catch {}
}
