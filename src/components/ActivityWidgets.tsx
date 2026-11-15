import { Badge, Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, Popover, PopoverContent, PopoverTrigger } from '@atom63/ui-react'
import { WidgetGrid, WidgetViewport, widgetTypeStyle } from '@atom63/widgets'
import {
  WidgetCard,
  WidgetCardContent,
  WidgetCardHeader,
  WidgetCardHeaderRight,
  WidgetCardTitle,
} from '@atom63/widgets/primitives'
import { Check, ChevronLeft, ChevronRight, ExternalLink, Eye, Link, Maximize2, Minimize2, Share2, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import './activity-widgets.css'

const github = 'https://github.com/atom63'
const heatmapDays = 26 * 7
const dayMs = 24 * 60 * 60 * 1000
const levels = [0, 1, 2, 3, 4]
const heatmapCatStyle = Object.fromEntries(levels.map((level) => [
  `--activity-cat-${level}`,
  `url(https://atom63.io/heatmap/heatmap-cat-0${level}.png)`,
]))
const dateWithYear = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})
const dateWithoutYear = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
const githubQuery = `
  query($from: DateTime!, $to: DateTime!) {
    user(login: "atom63") {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`

type ContributionDay = { date: string; contributionCount: number }
type ContributionResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: { weeks?: { contributionDays: ContributionDay[] }[] }
      }
    }
  }
}
type TooltipPosition = { label: string; left: number; top: number; below: boolean }

export const articles = [
  ['2026-08-23', 'design-system-is-a-decision-system', 'A Design System Is a Decision System', 'A design system records decisions a product team makes repeatedly so the team can spend more time on new choices.', 'Design System · Design Engineering · Product Design · Systems Thinking', '/images/blog/design-system-decision-system/hero-decision-council.jpg'],
  ['2026-07-07', 'becoming-a-design-engineer-2026', 'How to Become a Design Engineer in 2026', 'A practical look at the design judgment, technical fluency, and prototyping skills that matter as AI changes the work.', 'Design Engineering · AI · Career · Systems Thinking'],
  ['2026-06-05', 'connected-panel', 'Connected Panel', 'Three iterations refine a collapsible panel by joining the surfaces, keeping the content steady, and tuning what happens as it opens.', 'UI · Motion · Interaction · Craft'],
  ['2026-04-16', 'halftone', "Recreating Antimetal's Hero Animation With a Canvas Dot Grid", 'A Canvas 2D study recreates a WebGL hero animation with a moving grid of dots.', 'Creative Coding · Canvas · Halftone · Animation'],
  ['2026-04-10', 'ascii-player', 'A Procedural ASCII Art Engine with 27 Animations', 'A real-time ASCII animation engine combines procedural motion, six palettes, and a CRT-style display.', 'Creative Coding · ASCII · Animation'],
]

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656" />
    </svg>
  )
}

function contributionLevel(count: number) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

function dateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

function dateRange(first: string, last: string) {
  const firstDate = new Date(first)
  const lastDate = new Date(last)
  const formatter = firstDate.getUTCFullYear() === lastDate.getUTCFullYear()
    ? dateWithoutYear
    : dateWithYear
  return `${formatter.format(firstDate)} – ${dateWithYear.format(lastDate)}`
}

async function getContributions(signal: AbortSignal): Promise<ContributionDay[]> {
  const now = new Date()
  const to = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - 1)
  const from = new Date(to.getTime() - heatmapDays * dayMs + 1)
  const response = await fetch('https://atom63.io/api/github/graphql', {
    body: JSON.stringify({
      query: githubQuery,
      variables: { from: from.toISOString(), to: to.toISOString() },
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal,
  })

  if (!response.ok) throw new Error('GitHub activity request failed')
  const result: ContributionResponse = await response.json()
  const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks
  if (!weeks?.length) throw new Error('GitHub contribution calendar is missing')

  const counts = new Map(
    weeks.flatMap(({ contributionDays }) => contributionDays)
      .map(({ date, contributionCount }) => [date, contributionCount]),
  )
  return Array.from({ length: heatmapDays }, (_, index) => {
    const date = dateString(new Date(from.getTime() + index * dayMs))
    return { date, contributionCount: counts.get(date) ?? 0 }
  })
}

export function GithubActivityWidget() {
  const [days, setDays] = useState<ContributionDay[]>([])
  const [hasError, setHasError] = useState(false)
  const [isSnapshot, setIsSnapshot] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [tooltip, setTooltip] = useState<TooltipPosition | null>(null)
  const [catMode, setCatMode] = useState(() => localStorage.getItem('activity-cat-mode') === 'true')
  const [heatmapAnnouncement, setHeatmapAnnouncement] = useState('')
  const lastTitleClick = useRef({ count: 0, time: 0 })

  useEffect(() => {
    const controller = new AbortController()
    setHasError(false)

    void (async () => {
      try {
        setDays(await getContributions(controller.signal))
        setIsSnapshot(false)
      } catch {
        if (controller.signal.aborted) return
        try {
          const response = await fetch(import.meta.env.BASE_URL + 'assets/activity-github-snapshot.json', {
            signal: controller.signal,
          })
          if (!response.ok) throw new Error('GitHub snapshot unavailable')
          const snapshot: ContributionDay[] = await response.json()
          setDays(snapshot)
          setIsSnapshot(true)
        } catch {
          if (!controller.signal.aborted) setHasError(true)
        }
      }
    })()

    return () => controller.abort()
  }, [retryCount])

  const toggleAppearance = (event: MouseEvent<HTMLButtonElement>) => {
    const elapsed = event.timeStamp - lastTitleClick.current.time
    const count = elapsed > 700 ? 1 : lastTitleClick.current.count + 1
    lastTitleClick.current = { count, time: event.timeStamp }
    if (count < 3 && event.detail > 0) return
    lastTitleClick.current.count = 0
    setCatMode(!catMode)
    localStorage.setItem('activity-cat-mode', String(!catMode))
    setHeatmapAnnouncement(`Contribution heatmap cat sprites ${catMode ? 'disabled' : 'enabled'}`)
    setTooltip(null)
  }

  return (
    <WidgetViewport className="activity-tile activity-tile--github" size="medium">
      <WidgetCard size="medium" aria-label="GitHub Activity">
        <WidgetCardHeader className="activity-header">
          <button
            type="button"
            className="activity-title-trigger"
            aria-label="Toggle contribution heatmap appearance"
            aria-pressed={catMode}
            title="Triple-click to toggle cat sprites"
            onClick={toggleAppearance}
          >
            <WidgetCardTitle>GitHub Activity</WidgetCardTitle>
          </button>
          <WidgetCardHeaderRight>
            <Badge variant="secondary" className="activity-range-chip" style={widgetTypeStyle('label')}>6 Months</Badge>
            <Button
              aria-label="View GitHub profile"
              render={<a href={github} target="_blank" rel="noreferrer" />}
              size="icon-sm"
              variant="ghost"
            >
              <GitHubIcon />
            </Button>
          </WidgetCardHeaderRight>
        </WidgetCardHeader>
        <span aria-live="polite" className="activity-visually-hidden">{heatmapAnnouncement}</span>
        <WidgetCardContent className="activity-github-body" style={{ gap: '6px', ...(catMode ? heatmapCatStyle : {}) }}>
          {days.length > 0 ? (
            <>
              <div
                aria-label="Daily GitHub contributions"
                className="activity-heatmap"
                data-cats={catMode}
                onMouseLeave={() => setTooltip(null)}
                role="list"
              >
                {days.map(({ date, contributionCount }) => {
                  const label = `${date} | ${contributionCount} Contribution${contributionCount === 1 ? '' : 's'}`
                  return (
                    <div
                      className="activity-cell"
                      aria-label={label}
                      data-level={contributionLevel(contributionCount)}
                      key={date}
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect()
                        const below = rect.top < 100
                        setTooltip({
                          label,
                          left: Math.max(96, Math.min(window.innerWidth - 96, rect.left + rect.width / 2)),
                          top: below ? rect.bottom + 8 : rect.top - 8,
                          below,
                        })
                      }}
                      role="listitem"
                    />
                  )
                })}
              </div>
              <div className="activity-heatmap-footer" style={widgetTypeStyle('label')}>
                <span>
                  {dateRange(days[0].date, days[days.length - 1].date)}
                  {isSnapshot && <small className="activity-snapshot"> · Cached</small>}
                </span>
                <span className="activity-legend" aria-hidden="true" data-cats={catMode}>
                  Less
                  <span className="activity-legend-cells">
                    {levels.map((level) => <span className="activity-cell" data-level={level} key={level} />)}
                  </span>
                  More
                </span>
              </div>
            </>
          ) : (
            <div className="activity-status" role="status">
              {hasError ? (
                <>
                  <span>GitHub activity unavailable.</span>
                  <Button size="sm" variant="outline" onClick={() => setRetryCount(retryCount + 1)}>Retry</Button>
                </>
              ) : 'Loading GitHub activity…'}
            </div>
          )}
        </WidgetCardContent>
      </WidgetCard>
      {tooltip && createPortal(
        <div
          className="activity-heatmap-tooltip"
          data-below={tooltip.below}
          role="tooltip"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          {tooltip.label}
        </div>,
        document.body,
      )}
    </WidgetViewport>
  )
}

export function RecentWritingWidget() {
  const [index, setIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState(0)
  const [shuffle, setShuffle] = useState(0)
  const [inView, setInView] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const viewport = useRef<HTMLElement>(null)
  const shuffleTimer = useRef<number | undefined>(undefined)
  useEffect(() => {
    const element = viewport.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '80px 0px' })
    observer.observe(element)
    return () => {
      observer.disconnect()
      window.clearTimeout(shuffleTimer.current)
    }
  }, [])
  const [date, slug, title] = articles[index]
  const href = `https://atom63.io/writing/${slug}`
  const step = (direction: number) => {
    setPreviousIndex(index)
    setIndex((current) => (current + direction + articles.length) % articles.length)
    setDirection(direction)
    setShuffle(direction)
    window.clearTimeout(shuffleTimer.current)
    shuffleTimer.current = window.setTimeout(() => {
      setShuffle(0)
      setPreviousIndex(null)
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
      <WidgetViewport
        className="activity-tile activity-tile--writing"
        data-in-view={inView}
        data-shuffle={shuffle}
        ref={viewport}
        size="small"
        aria-label="Recent Writing"
        aria-roledescription="carousel"
        role="region"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            step(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}
      >
        <WidgetCard size="small">
          <WidgetCardHeader className="activity-header"><WidgetCardTitle>Recent Writing</WidgetCardTitle></WidgetCardHeader>
          <WidgetCardContent className="activity-writing-body">
            <div className="activity-writing-titles">
              {previousIndex !== null && (
                <h3
                  aria-hidden="true"
                  className="activity-writing-headline activity-writing-headline--outgoing"
                  key={`outgoing-${previousIndex}`}
                  data-direction={direction}
                  style={widgetTypeStyle('headline', 'small')}
                ><span>{articles[previousIndex][2]}</span></h3>
              )}
              <h3 aria-live="polite" className="activity-writing-headline" key={slug} data-direction={direction} style={widgetTypeStyle('headline', 'small')}><a href={href} onClick={openPreview}>{title}</a></h3>
            </div>
            <div className="activity-writing-footer" style={widgetTypeStyle('label', 'small', { leading: 1 })}>
              <time dateTime={date}>{dateWithYear.format(new Date(date))}</time>
              <div className="activity-writing-actions">
                <Button aria-label="Previous writing" size="icon-xs" variant="ghost" onClick={() => step(-1)}><ChevronLeft aria-hidden="true" /></Button>
                <Button aria-label="Next writing" size="icon-xs" variant="ghost" onClick={() => step(1)}><ChevronRight aria-hidden="true" /></Button>
                <Button aria-label={`Open ${title}`} size="icon-xs" variant="ghost" render={<a href={href} onClick={openPreview} />}><Eye aria-hidden="true" /></Button>
              </div>
            </div>
          </WidgetCardContent>
        </WidgetCard>
      </WidgetViewport>
      <WritingPreview index={previewIndex} open={previewOpen} onChange={setPreviewIndex} onClose={() => setPreviewOpen(false)} />
    </>
  )
}

export function WritingPreview({ index, open, onChange, onClose }: { index: number; open: boolean; onChange: (index: number) => void; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [date, slug, title, description, tags, hero] = articles[index]
  const href = `https://atom63.io/writing/${slug}`
  const scroll = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0 })
    setCopied(false)
    if (!open) setExpanded(false)
  }, [slug, open])
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(href)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <DialogContent
        className="activity-preview"
        data-expanded={expanded}
        mobilePlacement="bottom"
        showCloseButton={false}
        onKeyDown={(event) => {
          if (event.key.toLowerCase() === 'f' && !event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            setExpanded(!expanded)
          }
        }}
      >
        <header className="activity-preview-toolbar" onDoubleClick={(event) => {
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
                <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(href)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noreferrer">Post to X</a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(href)}`} target="_blank" rel="noreferrer">LinkedIn</a>
                <Button size="sm" variant="ghost" onClick={copyLink}>{copied ? 'Copied' : 'Copy link'}</Button>
              </PopoverContent>
            </Popover>
            {index > 0 && <Button size="icon-sm" variant="ghost" aria-label={`Previous: ${articles[index - 1][2]}`} onClick={() => onChange(index - 1)}><ChevronLeft /></Button>}
            {index < articles.length - 1 && <Button size="icon-sm" variant="ghost" aria-label={`Next: ${articles[index + 1][2]}`} onClick={() => onChange(index + 1)}><ChevronRight /></Button>}
          </div>
        </header>
        <div className="activity-preview-scroll" ref={scroll}>
          <div className="activity-preview-layout" key={slug}>
            <div className="activity-preview-meta">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
              <p className="activity-preview-byline"><time dateTime={date}>{date}</time>{hero && ' · 6 min read'}</p>
              <p>{tags}</p>
            </div>
            <article className="activity-preview-article">
              {hero ? (
                <>
                  <p>A design system helps a team make consistent product choices. Its components give those choices a form people can reuse.</p>
                  <p>Tokens, components, and Figma libraries establish a common vocabulary. Teams still have to decide which response fits each situation a person encounters in the product.</p>
                  <ul>
                    <li>When does confirmation deserve an interruption?</li>
                    <li>What should someone be able to do from an empty view?</li>
                    <li>Where can a person best understand and fix an error?</li>
                    <li>What circumstances justify departing from the default pattern?</li>
                    <li>How should that exception change the guidance for next time?</li>
                  </ul>
                  <p>A large component library can still take considerable time to use if each of those questions sends people back into the same meeting.</p>
                  <p>Documenting the reasoning gives the next team a starting point and a way to refine the guidance when a new case comes up.</p>
                  <img alt="Illustration of cats gathered around a map of design decisions" src={`https://atom63.io${hero}`} />
                </>
              ) : <p>{description}</p>}
              <Button size="sm" variant="outline" render={<a href={href} target="_blank" rel="noreferrer" />}><ExternalLink /> Read full article</Button>
            </article>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function OpenSourceWidget() {
  return (
    <WidgetViewport className="activity-tile activity-tile--opensource" size="small">
      <WidgetCard aria-label="Open Source" size="small">
        <WidgetCardHeader className="activity-header"><WidgetCardTitle>Open Source</WidgetCardTitle></WidgetCardHeader>
        <WidgetCardContent className="activity-source-body">
          <div className="activity-source-copy">
            <h3 style={widgetTypeStyle('title', 'small', { leading: 1.18 })}>@atom63/resume</h3>
            <p style={widgetTypeStyle('body', 'small', { leading: 1.45 })}>Write your resume and CV as MDX — paginated, print-ready, ATS-friendly PDF.</p>
          </div>
          <div className="activity-source-actions">
            <Button size="sm" variant="outline" render={<a href="https://resume.atom63.io" target="_blank" rel="noreferrer" />}>
              <ExternalLink aria-hidden="true" /> Try live
            </Button>
            <Button aria-label="View @atom63/resume on GitHub" size="icon-sm" variant="outline" render={<a href={github + '/resume'} target="_blank" rel="noreferrer" />}>
              <GitHubIcon />
            </Button>
          </div>
        </WidgetCardContent>
      </WidgetCard>
    </WidgetViewport>
  )
}

export function ActivityWidgets() {
  return (
    <WidgetGrid className="activity-widgets">
      <GithubActivityWidget />
      <RecentWritingWidget />
      <OpenSourceWidget />
    </WidgetGrid>
  )
}
