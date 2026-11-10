import { NextRequest, NextResponse } from 'next/server';
import { entryLinks, selectionCookie, selectionMaxAge } from './lib/profiles';
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-portfolio-entry');
  const match = request.nextUrl.pathname.match(/^\/r\/([^/]+)\/?$/);
  const code = match?.[1];
  const validEntry = code && Object.hasOwn(entryLinks, code) ? code : undefined;
  const savedCode = request.cookies.get(selectionCookie)?.value;
  const validSaved = savedCode && Object.hasOwn(entryLinks, savedCode) ? savedCode : undefined;
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
