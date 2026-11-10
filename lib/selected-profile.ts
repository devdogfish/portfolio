import 'server-only';
import { cookies, headers } from 'next/headers';
import { selectionCookie, type ProfileId } from './profiles';
import { applicationCodePattern, resolveEntry } from './application-links';
export async function selectedProfile(): Promise<{ code?: string; profileId: ProfileId; source: string }> {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const code = requestHeaders.get('x-portfolio-entry');
  const profile = requestHeaders.get('x-portfolio-resolved-profile');
  // Proxy removes inbound values; reuse its lookup for this initial server render.
  if (code && applicationCodePattern.test(code) && (profile === 'software' || profile === 'web-cms' || profile === 'admin-excel')) {
    return { code, profileId: profile, source: `resume-${profile}` };
  }
  return resolveEntry(code ?? cookieStore.get(selectionCookie)?.value);
}
