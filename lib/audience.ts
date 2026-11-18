// Who a visitor is, as set by the tracked link they opened. Kept dependency-free
// because proxy.ts imports it.

export const tracks = ['web-cms', 'admin-excel', 'devops', 'frontend', 'backend', 'full-stack'] as const
export const audiences = ['client', ...tracks] as const
export type Audience = (typeof audiences)[number]

export const RESUME_SOURCE_COOKIE = 'from_resume'
export const AUDIENCE_COOKIE = 'audience'
export const AUDIENCE_MAX_AGE = 60 * 60 * 24 * 90

export const isAudience = (value: unknown): value is Audience => audiences.includes(value as Audience)

// Previously issued links and cookies can still contain the retired Software track.
export const normalizeTrack = <T>(track: T) => track === 'software' ? 'backend' as const : track
