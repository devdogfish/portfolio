// Who a visitor is, as set by the tracked link they opened. Kept dependency-free
// because proxy.ts imports it.

export const audiences = ['client', 'software', 'web-cms', 'admin-excel'] as const
export type Audience = (typeof audiences)[number]

export const AUDIENCE_COOKIE = 'audience'
export const AUDIENCE_MAX_AGE = 60 * 60 * 24 * 90

export const isAudience = (value: unknown): value is Audience => audiences.includes(value as Audience)
