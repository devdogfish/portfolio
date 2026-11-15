export const site = {
  name: 'Luigi Girke',
  firstName: 'Luigi',
  handle: 'devdogfish',
  initial: 'L',
  origin: 'https://girke.dev',
  location: 'Halifax',
  region: 'Nova Scotia',
  timeZone: 'America/Halifax',
  coordinates: { latitude: 44.6488, longitude: -63.5752 },
  email: {
    client: 'contact@luigigirke.com',
    employer: 'job@luigigirke.com',
  },
  github: { user: 'devdogfish', url: 'https://github.com/devdogfish' },
  linkedin: 'https://www.linkedin.com/in/luigigirke',
  youtube: 'https://www.youtube.com/@devdogfish',
  shipped: 'Nov 2026',
} as const

export const elsewhere = [
  { label: 'GitHub', href: site.github.url },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'YouTube', href: site.youtube },
] as const

export const resumes = {
  software: '/resumes/software.pdf',
  'web-cms': '/resumes/web-cms.pdf',
  'admin-excel': '/resumes/admin-excel.pdf',
} as const
