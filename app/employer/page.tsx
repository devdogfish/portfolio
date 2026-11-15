import type { Metadata } from 'next'
import { PortfolioView } from '@/components/view'
import { employerView } from '@/content/views'

const view = employerView('software')

export const metadata: Metadata = {
  title: { absolute: view.title },
  description: view.description,
  alternates: { canonical: '/employer' },
  robots: { index: false },
}

export default function EmployerPage() {
  return <PortfolioView view={view} crumb="For employers" />
}
