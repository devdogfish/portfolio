import type { ReactNode } from 'react'
import { site } from '@/content/site'
import { Shell } from './shell'

// Shared frame for document pages (case studies, contact, privacy).
export function DocPage({ children, email = site.email.client, crumb }: { children: ReactNode; email?: string; crumb: string }) {
  return (
    <Shell home="/" crumb={crumb} email={email} resume="/resumes/software.pdf">
      <article className="content-column doc">{children}</article>
    </Shell>
  )
}
