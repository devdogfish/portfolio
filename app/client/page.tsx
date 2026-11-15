import type { Metadata } from 'next'
import { PortfolioView } from '@/components/view'
import { clientView } from '@/content/views'

export const metadata: Metadata = {
  title: { absolute: clientView.title },
  description: clientView.description,
  alternates: { canonical: '/client' },
}

export default function ClientPage() {
  return <PortfolioView view={clientView} crumb="For clients" />
}
