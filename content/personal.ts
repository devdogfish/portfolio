// Personal widgets. A section only renders when its list has entries, so an empty
// list hides it cleanly. Put artwork in /public/personal/ and reference it here.

export type Film = { title: string; kind: 'movie' | 'series'; year: number; url: string; poster: string }
export type Album = { title: string; artist: string; cover: string; url?: string }

// Three or more. Posters are 2:3.
export const films: Film[] = [
  { title: 'Breaking Bad', kind: 'series', year: 2008, url: 'https://www.imdb.com/title/tt0903747/', poster: '/personal/breaking-bad.jpg' },
  { title: 'Faster', kind: 'movie', year: 2010, url: 'https://www.imdb.com/title/tt1433108/', poster: '/personal/faster.jpg' },
  { title: 'Aliens in the Attic', kind: 'movie', year: 2009, url: 'https://www.imdb.com/title/tt0775552/', poster: '/personal/aliens-in-the-attic.jpg' },
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

// The repository featured beside the GitHub heatmap.
export const featuredRepository = {
  name: 'devdogfish/etpzp-sms',
  summary: 'A Flash SMS system I built as my final project at my high school in Portugal, so staff can send urgent announcements.',
  live: 'https://etpzp-sms.demo.girke.dev',
  source: 'https://github.com/devdogfish/etpzp-sms',
}

// Keep square logos separated in the initial footer order.
export const logos = [
  { title: 'RBC Capital Markets', year: 2026, src: '/logos/rbccm-white.svg', width: 64, url: 'https://www.rbccm.com' },
  { title: 'Kristina Girke', year: 2026, src: '/logos/kristina-girke.png', width: 60, invertInDark: true, url: 'https://www.kristinagirke.com/' },
  { title: 'Young Drivers Academy', year: 2025, src: '/logos/yda.png', width: 66, url: 'https://yda-academy.nl/' },
  { title: 'ETPZP', year: 2024, src: '/logos/etpzp.jpg', width: 40, square: true, round: true, url: 'https://etpzp.pt' },
  { title: 'Apollotec', year: 2025, src: '/logos/apollotec.svg', width: 62, url: 'https://apollotec.pt/en/' },
  { title: 'Hope Media House', year: 2024, src: '/logos/hmh-sm.png', width: 36, square: true, url: 'https://hopemediahouse.com' },
] as const

export const hasMusic = Boolean(playlist || albums.length)
export const hasFilms = films.length >= 3
