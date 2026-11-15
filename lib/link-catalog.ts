import { projects } from '@/content/projects'
import { elsewhere, site } from '@/content/site'
import { tracks } from '@/content/views'

// Every place a tracked link can point. Keys are flat (`rbc`, `rbc-demo`,
// `etpzp-sms-source`, `github`); résumé PDFs embed /r/<code>/<key>.

export type Destination = {
  key: string
  url: string
  label: string
  kind: 'profile' | 'case-study' | 'demo' | 'repository' | 'view'
  // Older nested suffixes (`/project/<slug>/demo`) still printed on sent résumés.
  suffixes: string[]
}

const shortSlug = (slug: string) => (slug === 'rbc-analytics' ? 'rbc' : slug)

export const destinations: Destination[] = [
  ...elsewhere.map(({ label, href }) => ({
    key: label.toLowerCase(), url: href, label, kind: 'profile' as const, suffixes: [`/profile/${label.toLowerCase()}`],
  })),
  { key: 'contact', url: `${site.origin}/contact`, label: 'Contact page', kind: 'view', suffixes: [] },
  ...projects.flatMap(project => {
    const key = shortSlug(project.slug)
    const base = `/project/${project.slug}`
    const aliases = project.slug === 'rbc-analytics' ? ['/project/rbc'] : []
    const repos = project.github ?? []
    return [
      { key, url: `${site.origin}${base}`, label: `${project.title}: case study`, kind: 'case-study' as const, suffixes: [base, ...aliases] },
      ...(project.deployed ? [{
        key: `${key}-demo`, url: project.deployed, label: `${project.title}: live site or demo`, kind: 'demo' as const,
        suffixes: [`${base}/demo`, ...aliases.map(a => `${a}/demo`)],
      }] : []),
      ...repos.map((repo, index) => {
        const name = new URL(repo.url).pathname.split('/').filter(Boolean).at(-1)!
        const single = repos.length === 1
        return {
          key: single ? `${key}-source` : `${key}-source-${name}`, url: repo.url, label: `${project.title}: ${repo.label}`,
          kind: 'repository' as const,
          suffixes: [single ? `${base}/source` : `${base}/source/${name}`, ...(index === 0 && !single ? [`${base}/source`] : [])],
        }
      }),
    ]
  }),
]

export function publicLinkCatalog() {
  return {
    schemaVersion: 2,
    origin: site.origin,
    tracks: [...tracks],
    destinations: destinations.map(({ key, url, label, kind }) => ({ key, url, label, kind })),
  }
}

// `[]` is the bare link; one segment is a flat key; more is a legacy nested suffix.
export function resolveDestination(parts: string[]): Destination | null | undefined {
  if (parts.length === 0) return null
  if (parts.length === 1) return destinations.find(d => d.key === parts[0])
  const suffix = '/' + parts.join('/')
  return destinations.find(d => d.suffixes.includes(suffix))
}
