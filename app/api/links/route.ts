import { publicLinkCatalog } from '@/lib/link-catalog'

// Read by the Quantself Jobs runner to pick destination keys for résumé links.
// Built once at build time and served from the CDN.
export function GET() {
  return Response.json(publicLinkCatalog(), {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=86400', 'Access-Control-Allow-Origin': '*' },
  })
}
