import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortfolioView } from '@/components/view'
import { employerView, tracks, type TrackId } from '@/content/views'

// One prerendered page per résumé track. The /r redirect lands here, so no
// request-time lookup decides what a visitor sees.
export function generateStaticParams() {
  return tracks.map(track => ({ track }))
}

type Props = { params: Promise<{ track: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track } = await params
  const view = employerView(track as TrackId)
  return { title: { absolute: view.title }, description: view.description, alternates: { canonical: view.path }, robots: { index: false } }
}

export default async function TrackPage({ params }: Props) {
  const { track } = await params
  if (!tracks.includes(track as TrackId)) notFound()
  return <PortfolioView view={employerView(track as TrackId)} crumb="For employers" />
}
