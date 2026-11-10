export const profileIds = ['default', 'client', 'software', 'web-cms', 'admin-excel'] as const;
export type ProfileId = (typeof profileIds)[number];
export const selectionCookie = 'portfolio_audience';
export const selectionMaxAge = 60 * 60 * 24 * 90;
// Public presentation only; codes never authorize access.
export const entryLinks: Record<string, { profileId: ProfileId; source: string }> = {
  '85c0fac356': { profileId: 'software', source: 'resume-software' },
  'da393208fe': { profileId: 'web-cms', source: 'resume-web-cms' },
  '79ddb560ef': { profileId: 'admin-excel', source: 'resume-admin-excel' },
  '67be457ba8': { profileId: 'client', source: 'kristina-footer' },
};
export function resolveSelection(code?: string) {
  const selection = code && Object.hasOwn(entryLinks, code) ? entryLinks[code] : undefined;
  return selection ? { ...selection, code } : { profileId: 'default' as ProfileId, source: 'direct', code: undefined };
}
export const profileMetadata: Record<ProfileId, { title: string; description: string }> = {
  default: { title: 'Luigi Girke — Software, websites & practical tools', description: 'Software developer in Halifax. Thoughtful websites, reliable applications, and practical tools for the people who use them.' },
  client: { title: 'Luigi Girke — Custom websites, apps & AI enablement', description: 'Carefully designed websites, custom business applications, and practical AI enablement. Work directly with an experienced developer.' },
  software: { title: 'Luigi Girke — Software Developer', description: 'Software developer building internal tools and web applications. Experience at RBC Capital Markets and agencies in Canada and Portugal.' },
  'web-cms': { title: 'Luigi Girke — Web Content & CMS Developer', description: 'Accurate enterprise web publishing and hands-on development with TeamSite, WordPress, Shopify, accessibility, and SEO.' },
  'admin-excel': { title: 'Luigi Girke — Excel, Records & Operations Support', description: 'Accurate records, high-volume requests, Excel reporting, and practical workflow improvements. Experience at RBC Capital Markets.' },
};
