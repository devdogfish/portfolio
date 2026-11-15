import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortfolioView } from '@/components/view'
import { viewFor } from '@/content/views'
import { audiences, isAudience } from '@/lib/audience'

// Served only through proxy.ts, which rewrites `/` here for visitors who arrived
// by a tracked link. The URL in the address bar stays `/`.
export function generateStaticParams() {
  return audiences.map(audience => ({ audience }))
}

type Props = { params: Promise<{ audience: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { audience } = await params
  if (!isAudience(audience)) return {}
  const view = viewFor(audience)
  return { title: { absolute: view.title }, description: view.description, alternates: { canonical: '/' }, robots: { index: false } }
}

export default async function AudiencePage({ params }: Props) {
  const { audience } = await params
  if (!isAudience(audience)) notFound()
  return <PortfolioView view={viewFor(audience)} />
}
