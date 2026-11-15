import { resolveTrackedDestination } from '@/lib/link-catalog';
import { issuedApplicationCode, lookupTrackedLink, validTrackedCode } from '@/lib/tracked-link-registry';
import { recordLinkOpen } from '@/lib/tracked-link-opens';

type Context = { params: Promise<{ code: string; key?: string[] }> };
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' };

function missing(method: string) {
  return new Response(method === 'HEAD' ? null : '<!doctype html><html lang="en"><title>Link not found</title><h1>Link not found</h1><p><a href="/">Visit the portfolio</a></p></html>', {
    status: 404, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function redirect(request: Request, { params }: Context) {
  const occurredAt = new Date();
  const { code, key = [] } = await params;
  const path = ['/r', code, ...key].join('/');
  if (!validTrackedCode(code) || path.length > 240 ||
      key.some(segment => !/^[A-Za-z0-9][A-Za-z0-9._~-]{0,99}$/.test(segment) || /\s/.test(segment))) {
    return missing(request.method);
  }
  const requested = resolveTrackedDestination(key, issuedApplicationCode.test(code));
  let row;
  try { row = await lookupTrackedLink(code); }
  catch { row = undefined; }
  if (row === null || (row?.kind === 'application' && !requested)) return missing(request.method);

  const siteOrigin = 'https://girke.dev';
  const destination = new URL(row?.kind === 'post' ? row.destinationPath : row && requested ? requested.targetUrl : '/', siteOrigin);
  let location = destination.href;
  if (destination.origin === siteOrigin) {
    destination.searchParams.set('via', code);
    location = destination.pathname + destination.search + destination.hash;
  }
  recordLinkOpen(request, code, path, occurredAt, requested?.key ?? undefined);
  return new Response(null, { status: 307, headers: { ...headers, Location: location } });
}

export const GET = redirect;
export const HEAD = redirect;
