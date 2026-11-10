import { after, NextRequest, NextResponse } from 'next/server';
import { resolveResumeLink } from '@/lib/resume-links';
import { entryLinks, selectionCookie, selectionMaxAge } from '@/lib/profiles';

export const runtime = 'nodejs';
export const maxDuration = 15;

type Params = { params: Promise<{ variant: string; kind: string; slug: string; destination: string }> };

async function redirect(request: NextRequest, { params }: Params, track: boolean) {
  const { variant, kind, slug, destination } = await params;
  const link = resolveResumeLink(variant, kind, slug, destination);
  if (!link) return new NextResponse(null, { status: 404 });
  const { path, entryCode } = link;
  const internal = path.startsWith('/');
  const response = NextResponse.redirect(new URL(path, request.nextUrl.origin), 302);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Referrer-Policy', 'no-referrer');
  if (internal) {
    response.cookies.set(selectionCookie, entryCode, {
      httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: selectionMaxAge,
    });
  }

  const purpose = [request.headers.get('sec-purpose'), request.headers.get('purpose')].join(' ');
  if (track && request.headers.get('dnt') !== '1' && request.headers.get('sec-gpc') !== '1' &&
      !/prefetch|prerender/i.test(purpose) && !/bot|crawler|spider|preview|headless/i.test(request.headers.get('user-agent') ?? '')) {
    const id = crypto.randomUUID();
    const event = {
      eventId: id, sessionId: id, pageViewId: id, seq: 1, occurredAt: new Date().toISOString(),
      cohort: entryLinks[entryCode].profileId, path: `/go/${variant}/${kind}/${slug}/${destination}`,
      type: 'resume_link_open', properties: { source: entryLinks[entryCode].source, contentId: slug, target: destination },
    };
    after(async () => {
      const endpoint = process.env.QUANTSELF_ANALYTICS_URL;
      const token = process.env.QUANTSELF_ANALYTICS_TOKEN;
      if (!endpoint || !token) {
        console.warn('Résumé link analytics configuration unavailable.');
        return;
      }
      try {
        const result = await fetch(endpoint, {
          method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(4000),
          headers: { 'Content-Type': 'application/json', 'X-API-Key': token },
          body: JSON.stringify({ siteId: 'girke.dev', events: [event] }),
        });
        if (!result.ok) console.warn('Résumé link analytics rejected', result.status);
      } catch {
        console.warn('Résumé link analytics unavailable.');
      }
    });
  }
  return response;
}

export function GET(request: NextRequest, params: Params) {
  return redirect(request, params, true);
}

export function HEAD(request: NextRequest, params: Params) {
  return redirect(request, params, false);
}
