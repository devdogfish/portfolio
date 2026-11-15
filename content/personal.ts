// Personal widgets. A section only renders when its list has entries, so an empty
// list hides it cleanly. Put artwork in /public/personal/ and reference it here.

export type Film = { title: string; year: number; url: string; poster: string }
export type Album = { title: string; artist: string; cover: string; url?: string }
export type Article = { date: string; title: string; summary: string; tags: string; href: string }

// Three or more. Posters are 2:3.
export const films: Film[] = []

// Album covers for the rotating record shelf. Square images.
export const albums: Album[] = []

// A public YouTube playlist ID for the vinyl player, or null to hide it.
export const playlist: { id: string; label: string } | null = null

// Short posts or notes. Each links to the full piece wherever it lives.
export const writing: Article[] = []

// The repository featured beside the GitHub heatmap.
export const featuredRepository = {
  name: 'devdogfish/etpzp-sms',
  summary: 'A self-hosted Flash SMS system my old high school in Portugal still uses for urgent announcements.',
  live: 'https://etpzp-sms.demo.girke.dev',
  source: 'https://github.com/devdogfish/etpzp-sms',
}

// Logo strip. Places I have worked or built for.
export const logos = [
  { title: 'RBC Capital Markets', year: 2026, mark: 'RBC', url: 'https://www.rbccm.com' },
  { title: 'Young Drivers Academy', year: 2025, src: '/logos/yda.png', url: 'https://app.yda-kart.com/' },
  { title: 'Apollotec', year: 2025, src: '/logos/apollotec.svg', url: 'https://apollotec.pt/en/' },
  { title: 'ETPZP', year: 2024, src: '/logos/etpzp.jpg', url: 'https://etpzp.pt' },
  { title: 'Hope Media House', year: 2024, src: '/logos/hmh-sm.png', url: 'https://hopemediahouse.ca' },
] as const

export const hasMusic = Boolean(playlist || albums.length)
export const hasFilms = films.length >= 3
