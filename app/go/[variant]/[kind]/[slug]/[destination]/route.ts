import { site } from '@/content/site'
import { resolveLegacyResumeLink } from '@/lib/link-catalog'
import { recordLinkOpen, trackedLinkHeaders, trackedLinkRedirect } from '@/lib/tracked-link-opens'

type Context = { params: Promise<{ variant: string; kind: string; slug: string; destination: string }> }

async function redirect(request: Request, { params }: Context) {
  const occurredAt = new Date()
  const { variant, kind, slug, destination } = await params
  const path = ['/go', variant, kind, slug, destination].join('/')
  const link = resolveLegacyResumeLink(variant, path)
  if (!link) return new Response(null, { status: 404, headers: trackedLinkHeaders })

  const isGet = request.method === 'GET'
  if (isGet) recordLinkOpen(request, link.code, path, occurredAt, link.key)
  const audience = isGet && new URL(link.url).origin === site.origin ? link.audience : undefined
  return trackedLinkRedirect(link.url, link.code, audience)
}

export const GET = redirect
export const HEAD = redirect
