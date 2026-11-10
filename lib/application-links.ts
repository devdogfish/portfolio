import { getProject } from './data';
import { entryLinks, resolveSelection, type ProfileId } from './profiles';

export const applicationCodePattern = /^[a-f0-9]{24}$/;
type Application = { code: string; profileId: ProfileId; source: string };
const cache = new Map<string, { expires: number; value: Promise<Application | undefined> }>();

export async function resolveApplication(code: string): Promise<Application | undefined> {
  if (!applicationCodePattern.test(code)) return;
  const saved = cache.get(code);
  if (saved && saved.expires > Date.now()) return saved.value;
  const value = (async () => {
    const endpoint = process.env.APPLICATION_LINKS_REGISTRY_URL;
    const token = process.env.APPLICATION_LINKS_TOKEN;
    if (!endpoint || !token) throw new Error('Application registry unavailable');
    const url = new URL(endpoint);
    url.searchParams.set('code', code);
    const response = await fetch(url, {
      headers: { 'X-API-Key': token }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(4000),
    });
    if (response.status === 404) return;
    if (!response.ok) throw new Error('Application registry unavailable');
    const row = await response.json();
    if (row.code !== code || !['software', 'web-cms', 'admin-excel'].includes(row.cohort)) throw new Error('Invalid application registry response');
    return { code, profileId: row.cohort as ProfileId, source: `resume-${row.cohort}` };
  })();
  if (cache.size >= 1000) cache.delete(cache.keys().next().value!);
  cache.set(code, { expires: Date.now() + 300_000, value });
  try {
    const result = await value;
    if (!result) cache.delete(code);
    return result;
  } catch (error) { cache.delete(code); throw error; }
}

export async function resolveEntry(code?: string) {
  if (!code || Object.hasOwn(entryLinks, code)) return resolveSelection(code);
  return await resolveApplication(code) ?? resolveSelection();
}

const profiles: Record<string, string> = {
  github: 'https://github.com/devdogfish', linkedin: 'https://www.linkedin.com/in/luigigirke',
};
const externalProjects: Record<string, Record<string, string>> = {
  'rbc-analytics': { demo: 'https://rbc-analytics.demo.girke.dev' },
  'etpzp-sms': { source: 'https://github.com/devdogfish/etpzp-sms' },
  sitings: { demo: 'https://sitings.ca/property/' },
};

export function resolveApplicationDestination(parts: string[]) {
  const [kind, rawSlug, destination] = parts;
  const slug = rawSlug === 'rbc' ? 'rbc-analytics' : rawSlug;
  if (parts.length === 2 && kind === 'profile' && Object.hasOwn(profiles, slug)) {
    return { path: profiles[slug], contentId: slug, target: 'external' };
  }
  if (kind !== 'project' || !slug || !getProject(slug)) return;
  if (parts.length === 2) return { path: `/project/${slug}`, contentId: slug, target: 'case-study' };
  const project = Object.hasOwn(externalProjects, slug) ? externalProjects[slug] : undefined;
  if (parts.length === 3 && project && Object.hasOwn(project, destination)) {
    return { path: project[destination], contentId: slug, target: destination === 'source' ? 'repository' : 'demo' };
  }
}
