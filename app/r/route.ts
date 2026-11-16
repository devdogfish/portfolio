import type { NextRequest } from 'next/server'
import { recordLinkOpen, trackedLinkRedirect } from '@/lib/tracked-link-opens'

function redirect(request: NextRequest) {
  recordLinkOpen(request, new Date())
  return trackedLinkRedirect(request, '/')
}

export const GET = redirect
export const HEAD = redirect
