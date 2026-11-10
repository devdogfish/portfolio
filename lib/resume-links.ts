import { getProject } from './data';

export const resumeVariants = {
  software: '85c0fac356',
  'web-cms': 'da393208fe',
  'admin-excel': '79ddb560ef',
} as const;

const projectDestinations = {
  'rbc-analytics': { demo: 'https://rbc-analytics.demo.girke.dev' },
  'etpzp-sms': { repository: 'https://github.com/devdogfish/etpzp-sms' },
  sitings: { 'live-site': 'https://sitings.ca/property/' },
} as const;

const profileDestinations = {
  linkedin: 'https://www.linkedin.com/in/luigigirke',
  portfolio: 'https://luigigirke.com',
  github: 'https://github.com/devdogfish',
} as const;

export function resolveResumeLink(variant: string, kind: string, slug: string, destination: string) {
  if (!Object.hasOwn(resumeVariants, variant)) return;
  const entryCode = resumeVariants[variant as keyof typeof resumeVariants];
  if (kind === 'profile' && destination === 'external' && Object.hasOwn(profileDestinations, slug)) {
    if (slug === 'github' && variant === 'admin-excel') return;
    return { path: profileDestinations[slug as keyof typeof profileDestinations], entryCode };
  }
  if (kind !== 'project' || !Object.hasOwn(projectDestinations, slug) || !getProject(slug)) return;
  if (slug === 'etpzp-sms' && variant !== 'software') return;
  if (destination === 'case-study') return { path: `/project/${slug}`, entryCode };
  const destinations: Readonly<Record<string, string>> = projectDestinations[slug as keyof typeof projectDestinations];
  if (Object.hasOwn(destinations, destination)) return { path: destinations[destination], entryCode };
}
