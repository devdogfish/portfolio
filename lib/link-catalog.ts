import { projects } from '@/content/projects'
import { elsewhere, site } from '@/content/site'
import { clientView, defaultView, employerView, tracks } from '@/content/views'

// Every place a tracked link can point. Keys are flat (`rbc`, `rbc-demo`,
// `etpzp-sms-source`, `github`); résumé PDFs embed /r/<code>/<key>.

export type Destination = {
  key: string
  url: string
  label: string
  kind: 'profile' | 'case-study' | 'demo' | 'repository' | 'view'
}

const shortSlug = (slug: string) => (slug === 'rbc-analytics' ? 'rbc' : slug)

export const destinations: Destination[] = [
  ...elsewhere.map(({ label, href }) => ({ key: label.toLowerCase(), url: href, label, kind: 'profile' as const })),
  { key: 'contact', url: `${site.origin}/contact`, label: 'Contact page', kind: 'view' },
  ...projects.flatMap(project => {
    const key = shortSlug(project.slug)
    const repos = project.github ?? []
    return [
      { key, url: `${site.origin}/project/${project.slug}`, label: `${project.title}: case study`, kind: 'case-study' as const },
      ...(project.deployed
        ? [{ key: `${key}-demo`, url: project.deployed, label: `${project.title}: live site or demo`, kind: 'demo' as const }]
        : []),
      ...repos.map(repo => ({
        key: repos.length === 1 ? `${key}-source` : `${key}-source-${new URL(repo.url).pathname.split('/').filter(Boolean).at(-1)}`,
        url: repo.url, label: `${project.title}: ${repo.label}`, kind: 'repository' as const,
      })),
    ]
  }),
]

// The exact hrefs a source résumé may use for a destination, with and without a
// trailing slash (the PDF compiler adds its own `https://girke.dev/`).
function sourceUrls(url: string) {
  const separator = url.search(/[?#]/)
  const base = separator === -1 ? url : url.slice(0, separator)
  const tail = separator === -1 ? '' : url.slice(separator)
  return [url, (base.endsWith('/') ? base.slice(0, -1) : base + '/') + tail]
}

// GET /api/links. `project`, `profile` and `variant` feed Quantself's `jobs:links`
// chooser; `destinations` feeds the résumé renderer.
export function publicLinkCatalog() {
  return {
    schemaVersion: 1,
    origin: site.origin,
    tracks: [...tracks],
    project: destinations.filter(({ kind }) => kind !== 'profile' && kind !== 'view').map(({ key, label }) => ({ key, description: label })),
    profile: destinations.filter(({ kind }) => kind === 'profile').map(({ key, label }) => ({ key, description: label })),
    variant: [
      { key: 'default', description: defaultView.description },
      { key: 'client', description: clientView.description },
      ...tracks.map(key => ({ key, description: employerView(key).description })),
    ],
    destinations: [
      { key: null, sourceUrls: sourceUrls(site.origin) },
      ...destinations.map(({ key, url }) => ({ key, sourceUrls: sourceUrls(url) })),
    ],
  }
}

/** `null` for a bare link, the destination for a known key, `undefined` otherwise. */
export function resolveDestination(key: string | undefined): Destination | null | undefined {
  return key === undefined ? null : destinations.find(destination => destination.key === key)
}
