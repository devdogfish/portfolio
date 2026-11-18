import { after, type NextRequest } from 'next/server';
import { site } from '@/content/site';
import { AUDIENCE_COOKIE, AUDIENCE_MAX_AGE, RESUME_SOURCE_COOKIE, type Audience } from '@/lib/audience';
import { analyticsPath, type AnalyticsEvent } from './analytics/contract';
import { analyticsLinkCode } from './analytics/intake';
import { analyticsVisitor, sendAnalyticsBatch } from './analytics/server';

export function recordLinkOpen(request: NextRequest, occurredAt: Date, code?: string, key?: string) {
  const { method, headers } = request;
  if (method !== 'GET' && method !== 'HEAD') return;
  const { excluded, ipId, device } = analyticsVisitor(headers, occurredAt);
  if (excluded) return;
  const parsedCode = analyticsLinkCode.safeParse(code);
  const path = request.nextUrl.pathname;
  let eventPath = '/r';
  if (parsedCode.success) {
    eventPath = path.length <= 240 && analyticsPath.test(path) ? path : `/r/${parsedCode.data}`;
  }
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    kind: 'link:open',
    occurred_at: occurredAt.toISOString(),
    path: eventPath,
    link_code: parsedCode.data,
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

const trackedLinkHeaders = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' };

export function trackedLinkRedirect(request: NextRequest, url: string, code?: string, audience?: Audience | null, fromResume = false) {
  const target = new URL(url, site.origin);
  let location = target.href;
  if (target.origin === site.origin) {
    if (code) target.searchParams.set('via', code);
    location = target.pathname + target.search + target.hash;
  }
  const response = new Response(null, { status: 307, headers: { ...trackedLinkHeaders, Location: location } });
  // Clear a previous audience so untracked and trackless links show the default view.
  if (audience || request.cookies.has(AUDIENCE_COOKIE)) {
    const maxAge = audience ? AUDIENCE_MAX_AGE : 0;
    response.headers.append('Set-Cookie', `${AUDIENCE_COOKIE}=${audience ?? ''}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure; HttpOnly`);
  }
  if (fromResume || request.cookies.has(RESUME_SOURCE_COOKIE)) {
    const value = fromResume ? '1' : '; Max-Age=0';
    response.headers.append('Set-Cookie', `${RESUME_SOURCE_COOKIE}=${value}; Path=/; SameSite=Lax; Secure; HttpOnly`);
  }
  return response;
}
