'use client'

import { VideoDialog } from '@atom63/ui-react/media'
import { WidgetGrid, WidgetViewport } from '@atom63/widgets'
import { WidgetCard } from '@atom63/widgets/primitives'
import { ArrowUpRight, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './motion-showcase.css'

export type Slide = { slug: string; title: string; youtubeId: string | null }

const glyphs: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '·': [0, 0, 4, 14, 4, 0, 0],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  J: [7, 2, 2, 2, 2, 18, 12],
  M: [17, 27, 21, 21, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
}

const marquee = [...'PROJECT DEMOS ·    '].flatMap(letter => [
  ...Array.from({ length: 5 }, (_, column) => glyphs[letter].map(row => Boolean(row & (16 >> column)))),
  glyphs[' '].map(() => false),
])

const thumbnail = (youtubeId: string) => `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

function DotMarquee({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    let offset = 0
    let inView = true

    function paint() {
      if (!canvas || !context) return
      const width = canvas.clientWidth
      const ratio = devicePixelRatio || 1
      canvas.width = width * ratio
      canvas.height = 28 * ratio
      context.scale(ratio, ratio)
      context.fillStyle = getComputedStyle(canvas).color
      for (let column = 0; column < Math.floor(width / 4); column += 1) {
        marquee[(column + offset) % marquee.length].forEach((lit, row) => {
          context.globalAlpha = lit ? 0.88 : 0.14
          context.fillRect(column * 4 + 1, row * 4 + 1, 2, 2)
        })
      }
    }

    paint()
    const resize = new ResizeObserver(paint)
    resize.observe(canvas)
    const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting })
    intersection.observe(canvas)
    const interval = reducedMotion ? undefined : window.setInterval(() => {
      if (!inView || document.hidden || canvas.parentElement?.matches(':hover')) return
      offset = (offset + 1) % marquee.length
      paint()
    }, 32000 / marquee.length)

    return () => {
      clearInterval(interval)
      resize.disconnect()
      intersection.disconnect()
    }
  }, [reducedMotion])

  return <div className="motion-widget-marquee" aria-hidden="true"><canvas ref={ref} /></div>
}

function previewSource(slide: Slide & { youtubeId: string }) {
  const params = new URLSearchParams({
    autoplay: '1', controls: '0', enablejsapi: '1', iv_load_policy: '3', loop: '1', mute: '1',
    playlist: slide.youtubeId, playsinline: '1', rel: '0', fs: '0', disablekb: '1', origin: location.origin,
  })
  return `https://www.youtube-nocookie.com/embed/${slide.youtubeId}?${params}`
}

function SoonCard({ slide, link }: { slide: Slide; link: boolean }) {
  const body = (
    <>
      <span className="motion-widget-soon-title">{slide.title}</span>
      <span className="motion-widget-soon-label">Video coming soon</span>
    </>
  )
  return link
    ? <a className="motion-widget-soon" href={`/project/${slide.slug}`} data-track="cta:project" data-track-target={slide.slug}>{body}</a>
    : <div className="motion-widget-soon" aria-hidden="true">{body}</div>
}

function MotionPreview({ slide, play, visible, live }: { slide: Slide & { youtubeId: string }; play: boolean; visible: boolean; live: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [ready, setReady] = useState(false)
  const [frameWidth, setFrameWidth] = useState(0)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !live) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setFrameWidth(Math.max(width, (height * 16) / 9) * 1.18)
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [live])

  useEffect(() => {
    if (!loaded) return
    const timeout = setTimeout(() => setReady(true), 1600)
    return () => clearTimeout(timeout)
  }, [loaded])

  useEffect(() => {
    if (!loaded) return
    const message = { event: 'command', func: play ? 'playVideo' : 'pauseVideo', args: [] }
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), 'https://www.youtube-nocookie.com')
  }, [loaded, play])

  return (
    <div className="motion-widget-preview" ref={stageRef} aria-hidden="true">
      <img src={thumbnail(slide.youtubeId)} alt="" decoding="async" loading="lazy" />
      {live && (
        <div className="motion-widget-iframe" data-visible={ready && play && visible ? '' : undefined}>
          <iframe ref={iframeRef} onLoad={() => setLoaded(true)} src={previewSource(slide)} title={`${slide.title} preview`}
            tabIndex={-1} allow="autoplay; encrypted-media; picture-in-picture" style={{ width: frameWidth || '100%' }} />
        </div>
      )}
    </div>
  )
}

export function MotionShowcase({ slides }: { slides: Slide[] }) {
  const reducedMotion = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  const [current, setCurrent] = useState(0)
  const [peekFocused, setPeekFocused] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const element = root.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true)
        observer.disconnect()
      }
    }, { rootMargin: '200px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // One video: the medium widget is a 2:1 cell, which crops a landscape video.
  // Measure the stage and grow the row (in cell units) until it comes out 16:9.
  // The widget scales its chrome differently per width, so a fixed ratio drifts.
  const single = slides.length === 1
  useEffect(() => {
    const element = root.current
    if (!single || !element) return
    const fit = () => {
      const tile = element.querySelector('.motion-widget-tile[data-slot="main"]')
      const viewport = element.querySelector('[data-widget-viewport]')
      if (!tile || !viewport) return
      const { width, height } = tile.getBoundingClientRect()
      const rowHeight = viewport.getBoundingClientRect().height
      const rows = Number(getComputedStyle(element).getPropertyValue('--motion-rows')) || 1
      const next = rows * (rowHeight + width * 9 / 16 - height) / rowHeight
      if (Math.abs(next - rows) > 0.002) element.style.setProperty('--motion-rows', next.toFixed(4))
    }
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [single])

  useEffect(() => {
    if (slides.length < 2 || !seen || reducedMotion || peekFocused || advancing || dialogOpen) return
    const timeout = setTimeout(() => setAdvancing(true), 6400)
    return () => clearTimeout(timeout)
  }, [slides.length, seen, current, reducedMotion, peekFocused, advancing, dialogOpen])

  useEffect(() => {
    if (!advancing) return
    const timeout = setTimeout(() => {
      setCurrent(index => (index + 1) % slides.length)
      setAdvancing(false)
    }, reducedMotion ? 0 : 500)
    return () => clearTimeout(timeout)
  }, [advancing, reducedMotion, slides.length])

  if (!slides.length) return null
  const at = (offset: number) => slides[(current + offset) % slides.length]
  // One video: show it on its own, with no peek tile and no rotation.
  const tiles = slides.length === 1
    ? [{ slide: at(0), slot: 'main' }]
    : advancing
    ? [{ slide: at(0), slot: 'exit' }, { slide: at(1), slot: 'main' }, { slide: at(2), slot: 'peek' }]
    : [{ slide: at(0), slot: 'main' }, { slide: at(1), slot: 'peek' }]

  function advance() {
    if (advancing || dialogOpen) return
    setPeekFocused(false)
    setAdvancing(true)
  }

  return (
    <WidgetGrid className={single ? 'motion-widget-grid motion-widget-single' : 'motion-widget-grid'} ref={root}>
      <WidgetViewport size="medium" aria-label="Project demo videos">
        <WidgetCard size="medium" className="motion-widget">
          <DotMarquee reducedMotion={reducedMotion} />
          <div className="motion-widget-stage" data-peek-focused={peekFocused ? '' : undefined} data-advancing={advancing ? '' : undefined}>
            {tiles.map(({ slide, slot }) => (
              <div className="motion-widget-tile" data-slot={slot} key={slide.slug}>
                {slide.youtubeId ? (
                  <>
                    <MotionPreview slide={{ ...slide, youtubeId: slide.youtubeId }} live={seen && !reducedMotion && slot === 'main'}
                      play={slot === 'main' && !dialogOpen} visible={!peekFocused && !advancing && !dialogOpen} />
                    {slot === 'main' && (
                      <VideoDialog title={slide.title} isOpen={dialogOpen} onOpenChange={setDialogOpen} isYouTube youtubeId={slide.youtubeId}
                        trigger={<button className="motion-widget-open" type="button" aria-label={`Play video: ${slide.title}`} disabled={advancing} data-track="cta:video" data-track-target={slide.slug}>
                          <span><Play fill="currentColor" stroke="none" aria-hidden="true" /></span>
                        </button>} />
                    )}
                    {slot === 'main' && dialogOpen && createPortal(
                      <a className="motion-dialog-project" href={`/project/${slide.slug}`} data-track="cta:project" data-track-target={slide.slug}>
                        View project <ArrowUpRight aria-hidden="true" size={14} />
                      </a>,
                      document.body,
                    )}
                  </>
                ) : <SoonCard slide={slide} link={slot === 'main'} />}
                {slot === 'peek' && (
                  <button className="motion-widget-next" type="button" aria-label={`Show next: ${slide.title}`}
                    onFocus={() => setPeekFocused(true)} onBlur={() => setPeekFocused(false)}
                    onMouseEnter={() => setPeekFocused(true)} onMouseLeave={() => setPeekFocused(false)}
                    onClick={advance} disabled={advancing || dialogOpen} />
                )}
              </div>
            ))}
          </div>
        </WidgetCard>
      </WidgetViewport>
    </WidgetGrid>
  )
}
