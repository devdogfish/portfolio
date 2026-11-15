export const audienceProfiles = ['client', 'software', 'web-cms', 'admin-excel'] as const;
export type AudienceProfile = (typeof audienceProfiles)[number];
export const profileIds = ['default', ...audienceProfiles] as const;
export type ProfileId = (typeof profileIds)[number];

export function isAudienceProfile(value: string | null): value is AudienceProfile {
  return audienceProfiles.some(profile => profile === value);
}

export function profileHome(profile: ProfileId) {
  return profile === 'default' ? '/' : `/audience/${profile}`;
}
// Source aliases for old résumés and the collector being replaced in #1.
export const entryLinks: Record<string, { profileId: ProfileId; source: string }> = {
  '85c0fac356': { profileId: 'software', source: 'resume-software' },
  'da393208fe': { profileId: 'web-cms', source: 'resume-web-cms' },
  '79ddb560ef': { profileId: 'admin-excel', source: 'resume-admin-excel' },
  '67be457ba8': { profileId: 'client', source: 'kristina-footer' },
};
export const profileMetadata: Record<ProfileId, { title: string; description: string }> = {
  default: { title: 'Luigi Girke — Software, websites & practical tools', description: 'Software developer in Halifax. Thoughtful websites, reliable applications, and practical tools for the people who use them.' },
  client: { title: 'Luigi Girke — Custom websites, apps & AI enablement', description: 'Carefully designed websites, custom business applications, and practical AI enablement. Work directly with an experienced developer.' },
  software: { title: 'Luigi Girke — Software Developer', description: 'Software developer building internal tools and web applications. Experience at RBC Capital Markets and agencies in Canada and Portugal.' },
  'web-cms': { title: 'Luigi Girke — Web Content & CMS Developer', description: 'Accurate enterprise web publishing and hands-on development with TeamSite, WordPress, Shopify, accessibility, and SEO.' },
  'admin-excel': { title: 'Luigi Girke — Excel, Records & Operations Support', description: 'Accurate records, high-volume requests, Excel reporting, and practical workflow improvements. Experience at RBC Capital Markets.' },
};
