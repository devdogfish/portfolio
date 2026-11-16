import { after, type NextRequest } from 'next/server';
import { site } from '@/content/site';
import { AUDIENCE_COOKIE, AUDIENCE_MAX_AGE, type Audience } from '@/lib/audience';
import { analyticsPath, type AnalyticsEvent } from './analytics/contract';
import { analyticsVisitor, sendAnalyticsBatch } from './analytics/server';

export function recordLinkOpen(request: Request, code: string, path: string, occurredAt: Date, key?: string) {
  const { method, headers } = request;
  if (method !== 'GET' && method !== 'HEAD') return;
  const { excluded, ipId, device } = analyticsVisitor(headers, occurredAt);
  if (excluded) return;
  const codePath = `/r/${code}`;
  const eventPath = path.length <= 240 && analyticsPath.test(path) ? path :
    codePath.length <= 240 && analyticsPath.test(codePath) ? codePath : '/r';
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    kind: 'link:open',
    occurred_at: occurredAt.toISOString(),
    path: eventPath,
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

const trackedLinkHeaders = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' };

export function trackedLinkRedirect(request: NextRequest, url: string, code?: string, audience?: Audience | null) {
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
  return response;
}
