import type { ReactNode } from 'react'
import { projects } from '@/content/projects'
import { GridChrome } from './atoms'
import { PortfolioFooter } from './footer'
import { SiteHeader } from './site-header'

const build = (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7)
const searchable = projects.map(({ slug, title }) => ({ slug, title }))

export function Shell({ home, crumb, email, resume, children }: { home: string; crumb: string; email: string; resume: string; children: ReactNode }) {
  return (
    <GridChrome maxWidth="narrowest" lineStyle="dashed" tone="default" id="top">
      <SiteHeader home={home} crumb={crumb} email={email} resume={resume} projects={searchable} />
      <main className="main-content">{children}</main>
      <PortfolioFooter email={email} build={build} />
    </GridChrome>
  )
}
