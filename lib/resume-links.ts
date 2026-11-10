import { entryLinks } from './profiles';
import { linkDestinations, linkVariants } from './link-catalog';

export const resumeVariants = Object.fromEntries(linkVariants.filter(v => v.audience === 'employer').map(v => [
  v.id, Object.keys(entryLinks).find(code => entryLinks[code].profileId === v.id)!,
]));

export function resolveResumeLink(variant: string, kind: string, slug: string, destination: string) {
  if (!Object.hasOwn(resumeVariants, variant)) return;
  const sourceUrl = `https://girke.dev/go/${variant}/${kind}/${slug}/${destination}`;
  const item = linkDestinations.find(link => link.sourceUrls.includes(sourceUrl));
  if (!item) return;
  return { path: item.targetUrl === 'https://girke.dev' ? '/' : item.targetUrl.startsWith('https://girke.dev/')
    ? item.targetUrl.slice('https://girke.dev'.length) : item.targetUrl, entryCode: resumeVariants[variant] };
}
