import { projects } from './data';
import { entryLinks, profileIds, profileMetadata } from './profiles';

const origin = 'https://girke.dev';
const tracks: Record<string, string> = { software: 'engineering', 'web-cms': 'web', 'admin-excel': 'admin' };
export const linkVariants = profileIds.map(id => ({
  id, label: profileMetadata[id].title.replace('Luigi Girke — ', ''),
  audience: id === 'default' ? 'balanced' : id === 'client' ? 'client' : 'employer',
  resumeTrack: tracks[id] ?? null,
  url: origin + (id === 'default' ? '/' : `/r/${Object.keys(entryLinks).find(code => entryLinks[code].profileId === id)}`),
}));

type Destination = {
  id: string; kind: 'portfolio' | 'profile' | 'project'; label: string;
  suffix: string; targetUrl: string; contentId: string;
  target: 'external' | 'case-study' | 'demo' | 'repository';
  sourceUrls: string[]; aliases: string[];
};
function destination(input: Omit<Destination, 'sourceUrls' | 'aliases'> & { sourceUrls?: string[]; aliases?: string[] }): Destination {
  return { ...input, sourceUrls: [...new Set([input.targetUrl, ...(input.sourceUrls ?? [])])], aliases: input.aliases ?? [] };
}
function legacyUrls(suffix: string) {
  return linkVariants.filter(v => v.audience === 'employer' &&
    !(suffix === 'profile/github/external' && v.id === 'admin-excel') &&
    !(suffix.startsWith('project/etpzp-sms/') && v.id !== 'software'))
    .map(v => `${origin}/go/${v.id}/${suffix}`);
}

export const linkDestinations: Destination[] = [
  destination({ id: 'portfolio', kind: 'portfolio', label: 'Portfolio', suffix: '', targetUrl: origin,
    contentId: 'portfolio', target: 'case-study', sourceUrls: [origin + '/', 'https://luigigirke.com', 'https://luigigirke.com/',
      ...linkVariants.filter(v => v.audience === 'employer').map(v => v.url), ...legacyUrls('profile/portfolio/external')] }),
  ...[
    ['github', 'GitHub', 'https://github.com/devdogfish'],
    ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/luigigirke'],
  ].map(([slug, label, targetUrl]) => destination({ id: `profile.${slug}`, kind: 'profile', label,
    suffix: `/profile/${slug}`, targetUrl, contentId: slug, target: 'external',
    sourceUrls: [targetUrl + '/', ...legacyUrls(`profile/${slug}/external`)] })),
  ...projects.flatMap(project => {
    const prefix = `/project/${project.slug}`;
    const aliases = project.slug === 'rbc-analytics' ? ['/project/rbc'] : [];
    return [
      destination({ id: `project.${project.slug}`, kind: 'project', label: `${project.title} — Case study`,
        suffix: prefix, targetUrl: origin + prefix, contentId: project.slug, target: 'case-study', aliases,
        sourceUrls: legacyUrls(`project/${project.slug}/case-study`) }),
      ...(project.deployed ? [destination({ id: `project.${project.slug}.demo`, kind: 'project', label: `${project.title} — Live site / demo`,
        suffix: `${prefix}/demo`, targetUrl: project.deployed, contentId: project.slug, target: 'demo', aliases: aliases.map(a => a + '/demo'),
        sourceUrls: [...legacyUrls(`project/${project.slug}/demo`), ...legacyUrls(`project/${project.slug}/live-site`),
          ...(project.slug === 'sitings' ? ['https://sitings.ca/property/'] : [])] })] : []),
      ...(project.github ?? []).map((repo, index, repos) => {
        const repositorySlug = new URL(repo.url).pathname.split('/').filter(Boolean).at(-1)!;
        const suffix = `${prefix}/source${repos.length > 1 ? `/${repositorySlug}` : ''}`;
        return destination({ id: `project.${project.slug}.source.${repositorySlug}`, kind: 'project', label: `${project.title} — ${repo.label}`,
          suffix, targetUrl: repo.url, contentId: project.slug, target: 'repository',
          aliases: index === 0 && repos.length > 1 ? [`${prefix}/source`] : [],
          sourceUrls: index === 0 ? legacyUrls(`project/${project.slug}/repository`) : [] });
      }),
    ];
  }),
];

export function resolveCatalogSuffix(suffix: string) {
  return linkDestinations.find(item => item.suffix === suffix || item.aliases.includes(suffix));
}

export function publicLinkCatalog() {
  return {
    schemaVersion: 1,
    variants: linkVariants,
    destinations: linkDestinations.map(({ suffix, aliases, ...item }) => ({
      ...item, urlTemplate: `${origin}/r/{code}${suffix}`,
      aliasTemplates: aliases.map(alias => `${origin}/r/{code}${alias}`),
    })),
  };
}


export function applicationLinks(code: string, replacements = false) {
  const base = `${origin}/r/${code}`;
  if (replacements) return Object.fromEntries(linkDestinations.flatMap(item => item.sourceUrls.map(source => [source, base + item.suffix])));
  const links: { portfolio: string; profiles: Record<string, string>; projects: Record<string, { page?: string; demo?: string; sources: Record<string, string> }> } =
    { portfolio: base, profiles: {}, projects: {} };
  for (const item of linkDestinations) {
    const url = base + item.suffix;
    if (item.kind === 'profile') links.profiles[item.contentId] = url;
    if (item.kind === 'project') {
      const project = links.projects[item.contentId] ??= { sources: {} };
      if (item.target === 'case-study') project.page = url;
      if (item.target === 'demo') project.demo = url;
      if (item.target === 'repository') project.sources[new URL(item.targetUrl).pathname.split('/').filter(Boolean).at(-1)!] = url;
    }
  }
  return links;
}
