import type { Metadata } from 'next'
import { PortfolioView } from '@/components/view'
import { defaultView } from '@/content/views'

export const metadata: Metadata = {
  title: { absolute: defaultView.title },
  description: defaultView.description,
  alternates: { canonical: '/' },
}

export default function Home() {
  return <PortfolioView view={defaultView} />
}
