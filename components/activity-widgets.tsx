'use client'

import { Badge, Button } from '@atom63/ui-react'
import { WidgetGrid, WidgetViewport, widgetTypeStyle } from '@atom63/widgets'
import { WidgetCard, WidgetCardContent, WidgetCardHeader, WidgetCardHeaderRight, WidgetCardTitle } from '@atom63/widgets/primitives'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { featuredRepository, writing } from '@/content/personal'
import { site } from '@/content/site'
import type { ContributionDay } from '@/lib/github'
import './activity-widgets.css'

const levels = [0, 1, 2, 3, 4]
const withYear = new Intl.DateTimeFormat('en-CA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const withoutYear = new Intl.DateTimeFormat('en-CA', { day: 'numeric', month: 'short', timeZone: 'UTC' })

function level(count: number) {
  if (count === 0) return 0
  if (count <= 2) return count
  return count <= 5 ? 3 : 4
}

function range(first: string, last: string) {
  const from = new Date(first)
  const to = new Date(last)
  return `${(from.getUTCFullYear() === to.getUTCFullYear() ? withoutYear : withYear).format(from)} – ${withYear.format(to)}`
}

export function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

type Tip = { label: string; left: number; top: number; below: boolean }

export function GithubActivityWidget({ days }: { days: ContributionDay[] }) {
  const [tip, setTip] = useState<Tip | null>(null)
  const total = days.reduce((sum, day) => sum + day.count, 0)

  return (
    <WidgetViewport className="activity-tile activity-tile--github" size="medium">
      <WidgetCard size="medium" aria-label="GitHub activity">
        <WidgetCardHeader className="activity-header">
          <WidgetCardTitle>GitHub Activity</WidgetCardTitle>
          <WidgetCardHeaderRight>
            <Badge variant="secondary" className="activity-range-chip" style={widgetTypeStyle('label')}>{total ? `${total.toLocaleString('en-CA')} in 6 months` : '6 months'}</Badge>
            <Button aria-label="View GitHub profile" render={<a href={site.github.url} target="_blank" rel="noreferrer" />} size="icon-sm" variant="ghost">
              <GitHubIcon />
            </Button>
          </WidgetCardHeaderRight>
        </WidgetCardHeader>
        <WidgetCardContent className="activity-github-body" style={{ gap: '6px' }}>
          {days.length ? (
            <>
              <div aria-label="Daily GitHub contributions" className="activity-heatmap" onMouseLeave={() => setTip(null)} role="list">
                {days.map(({ date, count }) => {
                  const label = `${date} | ${count} contribution${count === 1 ? '' : 's'}`
                  return (
                    <div className="activity-cell" aria-label={label} data-level={level(count)} key={date} role="listitem"
                      onMouseEnter={event => {
                        const rect = event.currentTarget.getBoundingClientRect()
                        const below = rect.top < 100
                        setTip({ label, below, left: Math.max(96, Math.min(innerWidth - 96, rect.left + rect.width / 2)), top: below ? rect.bottom + 8 : rect.top - 8 })
                      }} />
                  )
                })}
              </div>
              <div className="activity-heatmap-footer" style={widgetTypeStyle('label')}>
                <span>{range(days[0].date, days[days.length - 1].date)}</span>
                <span className="activity-legend" aria-hidden="true">
                  Less<span className="activity-legend-cells">{levels.map(l => <span className="activity-cell" data-level={l} key={l} />)}</span>More
                </span>
              </div>
            </>
          ) : (
            <div className="activity-status" role="status">
              <span>Activity is on GitHub.</span>
              <Button size="sm" variant="outline" render={<a href={site.github.url} target="_blank" rel="noreferrer" />}>Open profile</Button>
            </div>
          )}
        </WidgetCardContent>
      </WidgetCard>
      {tip && createPortal(
        <div className="activity-heatmap-tooltip" data-below={tip.below} role="tooltip" style={{ left: tip.left, top: tip.top }}>{tip.label}</div>,
        document.body,
      )}
    </WidgetViewport>
  )
}

export function RecentWritingWidget() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [shuffle, setShuffle] = useState(0)
  const [inView, setInView] = useState(false)
  const viewport = useRef<HTMLElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '80px 0px' })
    observer.observe(element)
    return () => {
      observer.disconnect()
      clearTimeout(timer.current)
    }
  }, [])

  const article = writing[index]
  const step = (by: number) => {
    setIndex(current => (current + by + writing.length) % writing.length)
    setDirection(by)
    setShuffle(by)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setShuffle(0), 420)
  }

  return (
    <WidgetViewport className="activity-tile activity-tile--writing" data-in-view={inView} data-shuffle={shuffle} ref={viewport} size="small"
      aria-label="Recent writing" aria-roledescription="carousel" role="region">
      <WidgetCard size="small">
        <WidgetCardHeader className="activity-header"><WidgetCardTitle>Recent Writing</WidgetCardTitle></WidgetCardHeader>
        <WidgetCardContent className="activity-writing-body">
          <div className="activity-writing-titles">
            <h3 aria-live="polite" className="activity-writing-headline" key={article.href} data-direction={direction} style={widgetTypeStyle('headline', 'small')}>
              <a href={article.href} target="_blank" rel="noreferrer">{article.title}</a>
            </h3>
          </div>
          <div className="activity-writing-footer" style={widgetTypeStyle('label', 'small', { leading: 1 })}>
            <time dateTime={article.date}>{withYear.format(new Date(article.date))}</time>
            {writing.length > 1 && (
              <div className="activity-writing-actions">
                <Button aria-label="Previous post" size="icon-xs" variant="ghost" onClick={() => step(-1)}><ChevronLeft aria-hidden="true" /></Button>
                <Button aria-label="Next post" size="icon-xs" variant="ghost" onClick={() => step(1)}><ChevronRight aria-hidden="true" /></Button>
              </div>
            )}
          </div>
        </WidgetCardContent>
      </WidgetCard>
    </WidgetViewport>
  )
}

export function OpenSourceWidget() {
  const repo = featuredRepository
  return (
    <WidgetViewport className="activity-tile activity-tile--opensource" size="small">
      <WidgetCard aria-label="Open source" size="small">
        <WidgetCardHeader className="activity-header"><WidgetCardTitle>Open Source</WidgetCardTitle></WidgetCardHeader>
        <WidgetCardContent className="activity-source-body">
          <div className="activity-source-copy">
            <h3 style={widgetTypeStyle('title', 'small', { leading: 1.18 })}>{repo.name}</h3>
            <p style={widgetTypeStyle('body', 'small', { leading: 1.45 })}>{repo.summary}</p>
          </div>
          <div className="activity-source-actions">
            <Button size="sm" variant="outline" render={<a href={repo.live} target="_blank" rel="noreferrer" />}>
              <ExternalLink aria-hidden="true" /> Try live
            </Button>
            <Button aria-label={`View ${repo.name} on GitHub`} size="icon-sm" variant="outline" render={<a href={repo.source} target="_blank" rel="noreferrer" />}>
              <GitHubIcon />
            </Button>
          </div>
        </WidgetCardContent>
      </WidgetCard>
    </WidgetViewport>
  )
}

export function ActivityWidgets({ days }: { days: ContributionDay[] }) {
  return (
    <WidgetGrid className="activity-widgets">
      <GithubActivityWidget days={days} />
      {writing.length > 0 && <RecentWritingWidget />}
      <OpenSourceWidget />
    </WidgetGrid>
  )
}
