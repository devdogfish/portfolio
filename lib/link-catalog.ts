import { projects } from '@/content/projects'
import { elsewhere, site } from '@/content/site'
import { clientView, defaultView, employerView, tracks, type TrackId } from '@/content/views'

// Every place a tracked link can point. Keys are flat (`rbc`, `rbc-demo`,
// `etpzp-sms-source`, `github`); résumé PDFs embed /r/<code>/<key>.

export type Destination = {
  key: string
  url: string
  label: string
  kind: 'profile' | 'case-study' | 'demo' | 'repository' | 'view'
  // Older nested suffixes (`/project/<slug>/demo`) still printed on sent résumés.
  suffixes: string[]
  sourceAliases?: string[]
}

const resumeEntryCodes = {
  software: '85c0fac356',
  'web-cms': 'da393208fe',
  'admin-excel': '79ddb560ef',
} as const

export function staticEntryTrack(code: string): TrackId | 'client' | undefined {
  if (code === '67be457ba8') return 'client'
  return tracks.find(track => resumeEntryCodes[track] === code)
}

const shortSlug = (slug: string) => (slug === 'rbc-analytics' ? 'rbc' : slug)

function oldResumeUrls(suffix: string) {
  return tracks.filter(track =>
    !(suffix === 'profile/github/external' && track === 'admin-excel') &&
    !(suffix.startsWith('project/etpzp-sms/') && track !== 'software'),
  ).map(track => `${site.origin}/go/${track}/${suffix}`)
}

function sourceUrls(urls: string[]) {
  return [...new Set(urls.flatMap(url => {
    const separator = url.search(/[?#]/)
    const base = separator === -1 ? url : url.slice(0, separator)
    const tail = separator === -1 ? '' : url.slice(separator)
    return [url, (base.endsWith('/') ? base.slice(0, -1) : base + '/') + tail]
  }))]
}

export const destinations: Destination[] = [
  ...elsewhere.map(({ label, href }) => {
    const key = label.toLowerCase()
    return {
      key, url: href, label, kind: 'profile' as const, suffixes: [`/profile/${key}`],
      sourceAliases: key === 'youtube' ? [] : oldResumeUrls(`profile/${key}/external`),
    }
  }),
  { key: 'contact', url: `${site.origin}/contact`, label: 'Contact page', kind: 'view', suffixes: [] },
  ...projects.flatMap(project => {
    const key = shortSlug(project.slug)
    const base = `/project/${project.slug}`
    const aliases = project.slug === 'rbc-analytics' ? ['/project/rbc'] : []
    const repos = project.github ?? []
    return [
      {
        key, url: `${site.origin}${base}`, label: `${project.title}: case study`,
        kind: 'case-study' as const, suffixes: [base, ...aliases],
        sourceAliases: [...aliases.map(path => site.origin + path), ...oldResumeUrls(`project/${project.slug}/case-study`)],
      },
      ...(project.deployed ? [{
        key: `${key}-demo`, url: project.deployed, label: `${project.title}: live site or demo`, kind: 'demo' as const,
        suffixes: [`${base}/demo`, ...aliases.map(a => `${a}/demo`)],
        sourceAliases: [
          ...oldResumeUrls(`project/${project.slug}/demo`),
          ...oldResumeUrls(`project/${project.slug}/live-site`),
          ...(project.slug === 'sitings' ? ['https://sitings.ca/property/'] : []),
        ],
      }] : []),
      ...repos.map((repo, index) => {
        const name = new URL(repo.url).pathname.split('/').filter(Boolean).at(-1)!
        const single = repos.length === 1
        return {
          key: single ? `${key}-source` : `${key}-source-${name}`, url: repo.url, label: `${project.title}: ${repo.label}`,
          kind: 'repository' as const,
          suffixes: [single ? `${base}/source` : `${base}/source/${name}`, ...(index === 0 && !single ? [`${base}/source`] : [])],
          sourceAliases: index === 0 ? oldResumeUrls(`project/${project.slug}/repository`) : [],
        }
      }),
    ]
  }),
]

export function publicLinkCatalog() {
  const home = sourceUrls([
    site.origin,
    'https://luigigirke.com',
    ...tracks.flatMap(track => [
      track === 'software' ? `${site.origin}/employer` : `${site.origin}/employer/${track}`,
      `${site.origin}/audience/${track}`,
    ]),
    // Earlier fixed résumé entry links are valid renderer source URLs.
    ...Object.values(resumeEntryCodes).map(code => `${site.origin}/r/${code}`),
    ...oldResumeUrls('profile/portfolio/external'),
  ])
  return {
    schemaVersion: 1,
    origin: site.origin,
    tracks: [...tracks],
    project: destinations.filter(({ kind }) => kind !== 'profile' && kind !== 'view').map(({ suffixes, label }) => ({
      key: suffixes[0].slice('/project/'.length), description: label,
    })),
    profile: destinations.filter(({ kind }) => kind === 'profile').map(({ key, label }) => ({
      key, description: label,
    })),
    variant: [
      { key: 'default', description: defaultView.description },
      { key: 'client', description: clientView.description },
      ...tracks.map(key => ({ key, description: employerView(key).description })),
    ],
    destinations: [
      { key: null, sourceUrls: home },
      ...destinations.map(({ key, url, sourceAliases = [] }) => ({ key, sourceUrls: sourceUrls([url, ...sourceAliases]) })),
    ],
  }
}

// `[]` is the bare link; one segment is a flat key; more is a legacy nested suffix.
export function resolveDestination(parts: string[]): Destination | null | undefined {
  if (parts.length === 0) return null
  if (parts.length === 1) return destinations.find(d => d.key === parts[0])
  const suffix = '/' + parts.join('/')
  return destinations.find(d => d.suffixes.includes(suffix))
}

// The old /go route accepted only these catalog-backed audience aliases.
export function resolveLegacyResumeLink(variant: string, path: string) {
  const track = tracks.find(track => track === variant)
  if (!track) return
  const code = resumeEntryCodes[track]
  if (path === `/go/${track}/profile/portfolio/external`) {
    return { code, url: site.origin, key: undefined, audience: track }
  }
  const destination = destinations.find(item => item.sourceAliases?.includes(site.origin + path))
  if (destination) return { code, url: destination.url, key: destination.key, audience: track }
}
