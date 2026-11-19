import { NextResponse, type NextRequest } from 'next/server'
import { AUDIENCE_COOKIE, RESUME_SOURCE_COOKIE, readAudienceCookie } from '@/lib/audience'

// Audience views live at /v/<audience> but are only ever served at `/`, picked by
// the cookie /r sets. Asking for /v/* directly is a 404, so the views can't be browsed.
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  if (url.pathname.startsWith('/book/cancel/')) {
    // Keep the private token in the browser URL and serve the same static shell for every link.
    url.pathname = '/book/cancel'
    url.search = ''
    return NextResponse.rewrite(url)
  }
  if (url.pathname !== '/') {
    url.pathname = '/_not-found'
    return NextResponse.rewrite(url)
  }
  const { audience } = readAudienceCookie(request.cookies.get(AUDIENCE_COOKIE)?.value)
  const entry = request.headers.get('sec-fetch-site')
  const freshVisit = (entry === 'none' || entry === 'cross-site')
    && !url.searchParams.has('via') && url.searchParams.get('from') !== 'resume'
    && request.cookies.has(RESUME_SOURCE_COOKIE)
  if (freshVisit) request.cookies.delete(RESUME_SOURCE_COOKIE)
  const options = freshVisit ? { request: { headers: request.headers } } : undefined
  const response = audience
    ? NextResponse.rewrite(new URL('/v/' + audience + url.search, url), options)
    : NextResponse.next(options)
  if (freshVisit) response.cookies.delete(RESUME_SOURCE_COOKIE)
  return response
}

export const config = { matcher: ['/', '/v/:path*', '/book/cancel/:token'] }
