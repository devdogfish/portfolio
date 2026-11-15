'use client'

import { Badge, Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, Popover, PopoverContent, PopoverTrigger } from '@atom63/ui-react'
import { WidgetGrid, WidgetViewport, widgetTypeStyle } from '@atom63/widgets'
import { WidgetCard, WidgetCardContent, WidgetCardHeader, WidgetCardHeaderRight, WidgetCardTitle } from '@atom63/widgets/primitives'
import { Check, ChevronLeft, ChevronRight, ExternalLink, Eye, Link, Maximize2, Minimize2, Share2, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { featuredRepository } from '@/content/personal'
import { site } from '@/content/site'
import type { ContributionDay } from '@/lib/github'
import type { Post } from '@/lib/writing'
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

export function RecentWritingWidget({ writing }: { writing: Post[] }) {
  const [index, setIndex] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [direction, setDirection] = useState(0)
  const [shuffle, setShuffle] = useState(0)
  const [inView, setInView] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
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
  const href = `/writing/${article.slug}`
  const step = (by: number) => {
    setPrevious(index)
    setIndex(current => (current + by + writing.length) % writing.length)
    setDirection(by)
    setShuffle(by)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setShuffle(0)
      setPrevious(null)
    }, 420)
  }
  const openPreview = (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  return (
    <>
      <WidgetViewport className="activity-tile activity-tile--writing" data-in-view={inView} data-shuffle={shuffle} ref={viewport} size="small"
        aria-label="Recent writing" aria-roledescription="carousel" role="region"
        onKeyDown={event => {
          if (writing.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault()
            step(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}>
        <WidgetCard size="small">
          <WidgetCardHeader className="activity-header"><WidgetCardTitle>Recent Writing</WidgetCardTitle></WidgetCardHeader>
          <WidgetCardContent className="activity-writing-body">
            <div className="activity-writing-titles">
              {previous !== null && (
                <h3 aria-hidden="true" className="activity-writing-headline activity-writing-headline--outgoing" data-direction={direction}
                  style={widgetTypeStyle('headline', 'small')}><span>{writing[previous].title}</span></h3>
              )}
              <h3 aria-live="polite" className="activity-writing-headline" key={article.slug} data-direction={direction} style={widgetTypeStyle('headline', 'small')}>
                <a href={href} onClick={openPreview}>{article.title}</a>
              </h3>
            </div>
            <div className="activity-writing-footer" style={widgetTypeStyle('label', 'small', { leading: 1 })}>
              <time dateTime={article.date}>{withYear.format(new Date(article.date))}</time>
              <div className="activity-writing-actions">
                {writing.length > 1 && <Button aria-label="Previous post" size="icon-xs" variant="ghost" onClick={() => step(-1)}><ChevronLeft aria-hidden="true" /></Button>}
                {writing.length > 1 && <Button aria-label="Next post" size="icon-xs" variant="ghost" onClick={() => step(1)}><ChevronRight aria-hidden="true" /></Button>}
                <Button aria-label={`Open ${article.title}`} size="icon-xs" variant="ghost" render={<a href={href} onClick={openPreview} />}><Eye aria-hidden="true" /></Button>
              </div>
            </div>
          </WidgetCardContent>
        </WidgetCard>
      </WidgetViewport>
      <WritingPreview writing={writing} index={previewIndex} open={previewOpen} onChange={setPreviewIndex} onClose={() => setPreviewOpen(false)} />
    </>
  )
}

function WritingPreview({ writing, index, open, onChange, onClose }: { writing: Post[]; index: number; open: boolean; onChange: (index: number) => void; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const scroll = useRef<HTMLDivElement>(null)
  const post = writing[index]
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0 })
    setCopied(false)
    if (!open) setExpanded(false)
  }, [post.slug, open])
  const url = `${site.origin}/writing/${post.slug}`
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent className="activity-preview" data-expanded={expanded} mobilePlacement="bottom" showCloseButton={false}
        onKeyDown={event => {
          if (event.key.toLowerCase() === 'f' && !event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            setExpanded(!expanded)
          }
        }}>
        <header className="activity-preview-toolbar" onDoubleClick={event => {
          if (!(event.target as HTMLElement).closest('button,a')) setExpanded(!expanded)
        }}>
          <div>
            <DialogClose render={<Button size="icon-sm" variant="ghost" aria-label="Close" />}><X /></DialogClose>
            <Button className="activity-preview-expand" size="icon-sm" variant="ghost" aria-label={expanded ? 'Restore (F)' : 'Expand (F)'} aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? <Minimize2 /> : <Maximize2 />}</Button>
          </div>
          <div>
            <Button size="sm" variant="ghost" onClick={copyLink}>{copied ? <Check /> : <Link />}{copied ? 'Copied' : 'Copy link'}</Button>
            <Popover>
              <PopoverTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Share" />}><Share2 /></PopoverTrigger>
              <PopoverContent className="activity-preview-share">
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">LinkedIn</a>
                <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer">Post to X</a>
              </PopoverContent>
            </Popover>
            {index > 0 && <Button size="icon-sm" variant="ghost" aria-label={`Previous: ${writing[index - 1].title}`} onClick={() => onChange(index - 1)}><ChevronLeft /></Button>}
            {index < writing.length - 1 && <Button size="icon-sm" variant="ghost" aria-label={`Next: ${writing[index + 1].title}`} onClick={() => onChange(index + 1)}><ChevronRight /></Button>}
          </div>
        </header>
        <div className="activity-preview-scroll" ref={scroll}>
          <div className="activity-preview-layout" key={post.slug}>
            <div className="activity-preview-meta">
              <DialogTitle>{post.title}</DialogTitle>
              <DialogDescription>{post.summary}</DialogDescription>
              <p className="activity-preview-byline"><time dateTime={post.date}>{withYear.format(new Date(post.date))}</time> · {post.minutes} min read</p>
              <p>{post.tags}</p>
            </div>
            <article className="activity-preview-article">
              <div dangerouslySetInnerHTML={{ __html: post.html }} />
              <Button size="sm" variant="outline" render={<a href={`/writing/${post.slug}`} />}><ExternalLink /> Open as a page</Button>
            </article>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

export function ActivityWidgets({ days, writing }: { days: ContributionDay[]; writing: Post[] }) {
  return (
    <WidgetGrid className="activity-widgets">
      <GithubActivityWidget days={days} />
      {writing.length > 0 && <RecentWritingWidget writing={writing} />}
      <OpenSourceWidget />
    </WidgetGrid>
  )
}
