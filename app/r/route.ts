import type { NextRequest } from 'next/server'
import { trackedLinkRedirect } from '@/lib/tracked-link-opens'

function redirect(request: NextRequest) {
  return trackedLinkRedirect(request, '/')
}

export const GET = redirect
export const HEAD = redirect
