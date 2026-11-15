import { cacheLife } from 'next/cache'
import { site } from '@/content/site'

export type ContributionDay = { date: string; count: number }

const days = 26 * 7

// Reads GitHub's public contribution calendar at build time and refreshes daily,
// so visitors never wait on GitHub and no token is needed.
export async function getContributions(): Promise<ContributionDay[]> {
  'use cache'
  cacheLife('days')
  try {
    const response = await fetch(`https://github.com/users/${site.github.user}/contributions`, {
      headers: { 'User-Agent': 'portfolio-build', Accept: 'text/html' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return []
    const html = await response.text()
    const dates = new Map<string, string>()
    for (const [, attributes] of html.matchAll(/<td([^>]*ContributionCalendar-day[^>]*)>/g)) {
      const id = attributes.match(/id="([^"]+)"/)?.[1]
      const date = attributes.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1]
      if (id && date) dates.set(id, date)
    }
    const counts = new Map<string, number>()
    for (const [, id, label] of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const date = dates.get(id)
      if (date) counts.set(date, Number(label.match(/^(\d+)/)?.[1] ?? 0))
    }
    return [...counts].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-days)
  } catch {
    return []
  }
}
