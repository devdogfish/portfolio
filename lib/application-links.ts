import { resolveCatalogSuffix } from './link-catalog';
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

export function resolveApplicationDestination(parts: string[]) {
  const item = resolveCatalogSuffix('/' + parts.join('/'));
  if (!item || item.kind === 'portfolio') return;
  return { path: item.targetUrl.startsWith('https://girke.dev/') ? item.targetUrl.slice('https://girke.dev'.length) : item.targetUrl,
    contentId: item.contentId, target: item.target };
}
