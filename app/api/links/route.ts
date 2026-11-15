import { publicLinkCatalog } from '@/lib/link-catalog';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(publicLinkCatalog(), {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300', 'Access-Control-Allow-Origin': '*' },
  });
}
