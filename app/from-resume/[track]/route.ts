import type { NextRequest } from 'next/server'
import { isAudience, normalizeTrack } from '@/lib/audience'
import { trackedLinkRedirect } from '@/lib/tracked-link-opens'

export async function GET(request: NextRequest, { params }: { params: Promise<{ track: string }> }) {
  const track = normalizeTrack((await params).track)
  if (!isAudience(track) || track === 'client') return new Response(null, { status: 404 })
  return trackedLinkRedirect(request, '/?from=resume', undefined, track, true)
}
