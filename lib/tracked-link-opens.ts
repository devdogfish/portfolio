import { after } from 'next/server';
import { site } from '@/content/site';
import { AUDIENCE_COOKIE, AUDIENCE_MAX_AGE, type Audience } from '@/lib/audience';
import type { AnalyticsEvent } from './analytics/contract';
import { analyticsVisitor, sendAnalyticsBatch } from './analytics/server';

export function recordLinkOpen(request: Request, code: string, path: string, occurredAt: Date, key?: string) {
  const { method, headers } = request;
  if (method !== 'GET' && method !== 'HEAD') return;
  const { excluded, ipId, device } = analyticsVisitor(headers, occurredAt);
  if (excluded) return;
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    kind: 'link:open',
    occurred_at: occurredAt.toISOString(),
    path,
    link_code: code,
    ip_id: ipId,
    device,
    props: { method, key, ua: headers.get('user-agent')?.slice(0, 512) },
  };
  after(async () => {
    try {
      await sendAnalyticsBatch([event]);
    } catch {
      console.warn('Tracked-link ingest unavailable');
    }
  });
}

export const trackedLinkHeaders = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' };

export function trackedLinkRedirect(url: string, code: string, audience?: Audience) {
  const target = new URL(url, site.origin);
  let location = target.href;
  if (target.origin === site.origin) {
    target.searchParams.set('via', code);
    location = target.pathname + target.search + target.hash;
  }
  const response = new Response(null, { status: 307, headers: { ...trackedLinkHeaders, Location: location } });
  if (audience) {
    response.headers.append('Set-Cookie', `${AUDIENCE_COOKIE}=${audience}; Path=/; Max-Age=${AUDIENCE_MAX_AGE}; SameSite=Lax; Secure; HttpOnly`);
  }
  return response;
}
