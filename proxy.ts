import { NextRequest, NextResponse } from 'next/server';
import { entryLinks, selectionCookie, selectionMaxAge } from './lib/profiles';
import { applicationCodePattern, resolveApplication } from './lib/application-links';
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/go/') || /^\/r\/[^/]+\//.test(request.nextUrl.pathname.replace(/\/$/, ''))) return NextResponse.next();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-portfolio-entry');
  requestHeaders.delete('x-portfolio-resolved-profile');
  const match = request.nextUrl.pathname.match(/^\/r\/([^/]+)\/?$/);
  const code = match?.[1];
  let validEntry: string | undefined;
  try {
    const application = code && !Object.hasOwn(entryLinks, code) ? await resolveApplication(code) : undefined;
    validEntry = code && (Object.hasOwn(entryLinks, code) || application) ? code : undefined;
    if (application) requestHeaders.set('x-portfolio-resolved-profile', application.profileId);
  }
  catch { return new NextResponse('This link is temporarily unavailable. Please try again.', { status: 503, headers: { 'Retry-After': '30', 'Cache-Control': 'no-store' } }); }
  if (code && applicationCodePattern.test(code) && !validEntry) return new NextResponse('Link not found', { status: 404 });
  const savedCode = request.cookies.get(selectionCookie)?.value;
  const validSaved = savedCode;
  if (validEntry) requestHeaders.set('x-portfolio-entry', validEntry);
  const url = request.nextUrl.clone();
  url.pathname = '/';
  const response = match
    ? NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });
  const selection = validEntry ?? validSaved;
  if (selection) response.cookies.set(selectionCookie, selection, {
    httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax',
    path: '/', maxAge: selectionMaxAge,
  });
  response.headers.set('Cache-Control', 'private, no-store');
  if (match) response.headers.set('X-Robots-Tag', 'noindex, follow');
  return response;
}
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
