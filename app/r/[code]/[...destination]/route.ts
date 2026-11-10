import { after, NextRequest, NextResponse } from 'next/server';
import { resolveApplication, resolveApplicationDestination } from '@/lib/application-links';
import { analyticsIp } from '@/lib/analytics-ip';
import { selectionCookie, selectionMaxAge } from '@/lib/profiles';

type Context = { params: Promise<{ code: string; destination: string[] }> };
export const runtime = 'nodejs';
export const maxDuration = 15;

async function redirect(request: NextRequest, context: Context, track: boolean) {
  const { code, destination } = await context.params;
  const link = resolveApplicationDestination(destination);
  if (!link) return new NextResponse(null, { status: 404 });
  let application;
  try { application = await resolveApplication(code); }
  catch { return new NextResponse('Link temporarily unavailable', { status: 503, headers: { 'Retry-After': '30' } }); }
  if (!application) return new NextResponse(null, { status: 404 });
  const response = NextResponse.redirect(new URL(link.path, request.nextUrl.origin), 302);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Referrer-Policy', 'no-referrer');
  if (track) response.cookies.set(selectionCookie, code, {
    httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: selectionMaxAge,
  });
  const { excluded, ipId } = analyticsIp(request.headers);
  const purpose = `${request.headers.get('purpose')} ${request.headers.get('sec-purpose')}`;
  if (track && !excluded && request.headers.get('dnt') !== '1' && request.headers.get('sec-gpc') !== '1' &&
      !/prefetch|prerender/i.test(purpose) && !/bot|crawler|spider|preview|headless/i.test(request.headers.get('user-agent') ?? '')) {
    const id = crypto.randomUUID();
    const event = {
      eventId: id, sessionId: id, pageViewId: id, seq: 1, occurredAt: new Date().toISOString(), ipId,
      applicationCode: code, cohort: application.profileId, path: `/r/${code}/${destination.join('/')}`,
      type: 'resume_link_open', properties: { source: application.source, contentId: link.contentId, target: link.target },
    };
    after(async () => {
      const endpoint = process.env.QUANTSELF_ANALYTICS_URL;
      const token = process.env.QUANTSELF_ANALYTICS_TOKEN;
      if (!endpoint || !token) { console.warn('Application analytics configuration unavailable'); return; }
      try {
        const result = await fetch(endpoint, {
          method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(4000),
          headers: { 'Content-Type': 'application/json', 'X-API-Key': token },
          body: JSON.stringify({ siteId: 'girke.dev', events: [event] }),
        });
        if (!result.ok) console.warn('Application analytics rejected', result.status);
      } catch { console.warn('Application analytics unavailable'); }
    });
  }
  return response;
}
export const GET = (request: NextRequest, context: Context) => redirect(request, context, true);
export const HEAD = (request: NextRequest, context: Context) => redirect(request, context, false);
