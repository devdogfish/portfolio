import { NextResponse, type NextRequest } from 'next/server'
import { AUDIENCE_COOKIE, isAudience } from '@/lib/audience'

// Audience views live at /v/<audience> but are only ever served at `/`, picked by
// the cookie /r sets. Asking for /v/* directly is a 404, so the views can't be browsed.
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  if (url.pathname !== '/') {
    url.pathname = '/_not-found'
    return NextResponse.rewrite(url)
  }
  const audience = request.cookies.get(AUDIENCE_COOKIE)?.value
  if (!isAudience(audience)) return NextResponse.next()
  url.pathname = `/v/${audience}`
  return NextResponse.rewrite(url)
}

export const config = { matcher: ['/', '/v/:path*'] }
