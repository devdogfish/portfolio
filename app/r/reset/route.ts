import type { NextRequest } from 'next/server'
import { recordLinkOpen, trackedLinkRedirect } from '@/lib/tracked-link-opens'

// The only link that clears a résumé-set audience.
function redirect(request: NextRequest) {
  recordLinkOpen(request, new Date())
  return trackedLinkRedirect(request, '/', undefined, null, false, true)
}

export const GET = redirect
export const HEAD = redirect
