// Personal widgets. A section only renders when its list has entries, so an empty
// list hides it cleanly. Put artwork in /public/personal/ and reference it here.

export type Film = { title: string; year: number; url: string; poster: string }
export type Album = { title: string; artist: string; cover: string; url?: string }
export type Article = { date: string; title: string; summary: string; tags: string; href: string }

// Three or more. Posters are 2:3.
export const films: Film[] = [
  { title: 'Breaking Bad', year: 2008, url: 'https://www.imdb.com/title/tt0903747/', poster: '/personal/breaking-bad.jpg' },
  { title: 'Faster', year: 2010, url: 'https://www.imdb.com/title/tt1433108/', poster: '/personal/faster.jpg' },
  { title: 'Aliens in the Attic', year: 2009, url: 'https://www.imdb.com/title/tt0775552/', poster: '/personal/aliens-in-the-attic.jpg' },
]

// Cover art for the rotating shelf. Square images.
export const albums: Album[] = [
  { title: 'Feel', artist: 'Franky Rizardo', cover: '/personal/albums/e7Y_rFWsD3w.webp', url: 'https://www.youtube.com/watch?v=e7Y_rFWsD3w' },
  { title: 'Shinjuku', artist: 'Franky Rizardo', cover: '/personal/albums/iAh8LnvJsBI.webp', url: 'https://www.youtube.com/watch?v=iAh8LnvJsBI' },
  { title: 'Paraiso', artist: 'Maladona', cover: '/personal/albums/2KgY1j7WAic.webp', url: 'https://www.youtube.com/watch?v=2KgY1j7WAic' },
]

// A public YouTube playlist ID for the vinyl player, or null to hide it.
export const playlist: { videoIds: string[]; label: string } | null = {
  videoIds: ['e7Y_rFWsD3w', 'iAh8LnvJsBI', '2KgY1j7WAic'],
  label: 'On repeat',
}

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
  { title: 'RBC Capital Markets', year: 2026, mark: 'RBC', bg: '#005daa', url: 'https://www.rbccm.com' },
  { title: 'Young Drivers Academy', year: 2025, src: '/logos/yda.png', bg: '#ffffff', size: 78, url: 'https://app.yda-kart.com/' },
  { title: 'Apollotec', year: 2025, src: '/logos/apollotec.svg', bg: '#000000', size: 62, url: 'https://apollotec.pt/en/' },
  { title: 'ETPZP', year: 2024, src: '/logos/etpzp.jpg', bg: '#ffffff', size: 82, url: 'https://etpzp.pt' },
  { title: 'Hope Media House', year: 2024, src: '/logos/hmh-sm.png', bg: '#1b2a49', size: 44, url: 'https://hopemediahouse.ca' },
] as const

export const hasMusic = Boolean(playlist || albums.length)
export const hasFilms = films.length >= 3
