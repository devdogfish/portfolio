import 'server-only';
import { cookies, headers } from 'next/headers';
import { resolveSelection, selectionCookie } from './profiles';
export async function selectedProfile() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  return resolveSelection(requestHeaders.get('x-portfolio-entry') ?? cookieStore.get(selectionCookie)?.value);
}
