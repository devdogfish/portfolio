'use client'

import { Button, ScrollableList, TextTicker, Tooltip, TooltipContent, TooltipTrigger } from '@atom63/ui-react'
import { WidgetGrid, WidgetImage, WidgetViewport } from '@atom63/widgets'
import { WidgetCard } from '@atom63/widgets/primitives'
import { ArrowUpRight, ExternalLink, LoaderCircle, Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from 'react'
import { albums, films, logos, playlist, type Film } from '@/content/personal'
import './media-widgets.css'

export function LogosCarousel() {
  const years = logos.map(logo => logo.year)
  return (
    <section className="media-logos" aria-label="Places I have worked">
      <h2>Worked with · {Math.min(...years)}–{Math.max(...years)}</h2>
      <ScrollableList className="media-logos-frame" contentPad="24px" controlInset="0px" mask={false} showChevrons>
        {logos.map(logo => (
          <figure className="media-logo" key={logo.title}>
            <div className="media-logo-tile">
              {'src' in logo
                ? <img alt="" className="media-logo-art" src={logo.src} width="64" height="64" loading="lazy" />
                : <span aria-hidden="true" className="media-logo-text">{logo.mark}</span>}
            </div>
            <figcaption>
              <a href={logo.url} target="_blank" rel="noreferrer">{logo.title}</a>
              <div>{logo.year}</div>
            </figcaption>
          </figure>
        ))}
      </ScrollableList>
    </section>
  )
}

export function FilmWidget() {
  const [selection, setSelection] = useState(() => films.slice(0, 3))
  const [hovered, setHovered] = useState<Film | null>(null)
  if (films.length < 3) return null
  const active = hovered ?? selection[0]

  function shuffle() {
    const pool = films.filter(film => !selection.includes(film))
    const source = pool.length >= 3 ? pool : [...films]
    setSelection(Array.from({ length: 3 }, () => source.splice(Math.floor(Math.random() * source.length), 1)[0]))
    setHovered(null)
  }

  return (
    <WidgetGrid className="media-film-grid">
      <WidgetViewport size="medium" aria-label="Favourite films">
        <WidgetCard className="media-films media-tile" size="medium">
          <div className="media-film-strip media-film-strip-top" aria-hidden="true" />
          <div className="media-film-content" onPointerLeave={() => setHovered(null)}>
            <div className="media-film-text">
              <h2>Favourite films</h2>
              <div className="media-film-details" aria-live="polite">
                <p key={`year-${active.url}`}>{active.year}</p>
                <div className="media-film-title">
                  <a key={active.url} href={active.url} target="_blank" rel="noreferrer">{active.title} <ExternalLink aria-hidden="true" /></a>
                </div>
              </div>
              {films.length > 3 && (
                <Button className="media-film-shuffle" aria-label="Shuffle films" variant="secondary" size="sm" onClick={shuffle}>
                  <Shuffle aria-hidden="true" /> Shuffle
                </Button>
              )}
            </div>
            <div className="media-film-posters" data-spread={hovered ? 'true' : undefined} aria-label="Film posters">
              {selection.map((film, index) => (
                <a className={`media-film-poster media-film-${['front', 'left', 'right'][index]}`} key={index}
                  data-active={hovered === film ? 'true' : undefined} href={film.url} aria-label={`View ${film.title}`}
                  target="_blank" rel="noreferrer" onPointerEnter={() => setHovered(film)}>
                  <WidgetImage alt="" src={film.poster} aspectRatio="2/3" crossfade />
                </a>
              ))}
            </div>
          </div>
          <div className="media-film-strip media-film-strip-bottom" aria-hidden="true" />
        </WidgetCard>
      </WidgetViewport>
    </WidgetGrid>
  )
}

function AlbumCarousel() {
  const [active, setActive] = useState(0)
  const album = albums[active]

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let timer: number | undefined
    const update = () => {
      clearInterval(timer)
      if (!preference.matches && !document.hidden) timer = window.setInterval(() => setActive(i => (i + 1) % albums.length), 4000)
    }
    update()
    preference.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(timer)
      preference.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return (
    <WidgetCard className="media-album media-tile" size="small" aria-roledescription="carousel" aria-label="Album collection">
      <div className="media-album-cover">
        <WidgetImage alt="" src={album.cover} crossfade />
        <div className="media-album-caption">
          {album.url
            ? <a href={album.url} target="_blank" rel="noreferrer"><strong>{album.title}</strong><ExternalLink aria-hidden="true" /></a>
            : <strong>{album.title}</strong>}
          <span>{album.artist}</span>
        </div>
      </div>
    </WidgetCard>
  )
}

type Player = {
  destroy: () => void
  getVideoData: () => { video_id?: string; title?: string; author?: string }
  getPlaylist: () => string[] | undefined
  getPlaylistIndex: () => number
  nextVideo: () => void
  pauseVideo: () => void
  playVideo: () => void
  playVideoAt: (index: number) => void
  previousVideo: () => void
  setShuffle: (enabled: boolean) => void
}
type Youtube = { Player: new (element: HTMLElement, options: object) => Player }
type YoutubeWindow = Window & { YT?: Youtube; onYouTubeIframeAPIReady?: () => void }

let apiRequest: Promise<Youtube> | undefined
function youtubeApi() {
  const w = window as YoutubeWindow
  if (w.YT?.Player) return Promise.resolve(w.YT)
  apiRequest ??= new Promise<Youtube>((resolve, reject) => {
    const script = document.createElement('script')
    const previous = w.onYouTubeIframeAPIReady
    const timeout = setTimeout(fail, 8000)
    function fail() {
      clearTimeout(timeout)
      script.remove()
      w.onYouTubeIframeAPIReady = previous
      reject(new Error('YouTube failed to load'))
    }
    w.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout)
      w.onYouTubeIframeAPIReady = previous
      previous?.()
      if (w.YT?.Player) resolve(w.YT)
      else fail()
    }
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.addEventListener('error', fail, { once: true })
    document.head.append(script)
  }).catch((error: Error) => {
    apiRequest = undefined
    throw error
  })
  return apiRequest
}

function Control({ label, children, ...props }: ComponentProps<'button'> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<button aria-label={label} type="button" {...props}>{children}</button>} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

// Loads YouTube only after the visitor presses play, so it costs nothing on page load.
function VinylPlayer({ list }: { list: { videoIds: string[]; label: string } }) {
  const playlistUrl = `https://www.youtube.com/watch?v=${list.videoIds[0]}`
  const stageRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle')
  const [playing, setPlaying] = useState(false)
  const [starting, setStarting] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const [track, setTrack] = useState<{ videoId?: string; title: string; artist: string }>({ title: list.label, artist: 'Press play' })
  const [direction, setDirection] = useState(1)
  const cover = track.videoId ? `https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg` : undefined

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !attempt) return
    let disposed = false
    const timeout = setTimeout(fail, 12000)
    function fail() {
      if (disposed) return
      clearTimeout(timeout)
      setPlaying(false)
      setStarting(false)
      setStatus('unavailable')
    }
    function update(player: Player) {
      const video = player.getVideoData()
      if (video?.video_id) setTrack({ videoId: video.video_id, title: video.title?.trim() || 'Unknown track', artist: video.author?.trim() || 'YouTube' })
    }
    void youtubeApi().then(({ Player }) => {
      if (disposed) return
      const mount = document.createElement('div')
      stage.replaceChildren(mount)
      playerRef.current = new Player(mount, {
        width: 320, height: 200, videoId: list.videoIds[0],
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, playlist: list.videoIds.slice(1).join(','), loop: 1, origin: location.origin, playsinline: 1, rel: 0 },
        events: {
          onReady: ({ target }: { target: Player }) => {
            if (disposed) return
            clearTimeout(timeout)
            setStatus('ready')
            update(target)
            setStarting(true)
            target.playVideo()
          },
          onStateChange: ({ target, data }: { target: Player; data: number }) => {
            if (disposed) return
            if ([0, 1, 2, 5].includes(data)) {
              setPlaying(data === 1)
              update(target)
            }
            if (data === 1) setStarting(false)
          },
          onAutoplayBlocked: () => setStarting(false),
          onError: fail,
        },
      })
    }).catch(fail)
    return () => {
      disposed = true
      clearTimeout(timeout)
      playerRef.current?.destroy()
      playerRef.current = null
      stage.replaceChildren()
    }
  }, [attempt, list.videoIds])

  function toggle() {
    if (status === 'idle' || status === 'unavailable') {
      setStatus('loading')
      setAttempt(value => value + 1)
    } else if (playing) playerRef.current?.pauseVideo()
    else {
      setStarting(true)
      playerRef.current?.playVideo()
    }
  }

  function toggleShuffle() {
    const player = playerRef.current
    if (!player) return
    player.setShuffle(!shuffled)
    setShuffled(!shuffled)
    const count = player.getPlaylist()?.length ?? 0
    if (!shuffled && count > 1) player.playVideoAt((player.getPlaylistIndex() + 1 + Math.floor(Math.random() * (count - 1))) % count)
  }

  return (
    <WidgetCard className="media-vinyl media-tile" size="small" aria-label="Playlist player">
      <div className="media-vinyl-background" style={cover ? ({ '--media-cover': `url("${cover}")` } as CSSProperties) : undefined} />
      <div className={`media-record-stage${playing ? ' media-record-stage-playing' : ''}`} aria-hidden="true">
        <div className={`media-record${playing ? ' media-record-spinning' : ''}`}>
          <div className="media-record-label">
            {cover && <img key={cover} src={cover} alt="" style={{ '--media-track-angle': `${direction * -16}deg` } as CSSProperties} />}
          </div>
          <div className="media-record-sheen" />
          <div className="media-record-spindle" />
        </div>
      </div>
      <div className="media-youtube-stage" ref={stageRef} aria-hidden="true" inert />
      <div className="media-player-details" aria-live="polite">
        {status === 'unavailable' ? (
          <><strong>Music unavailable</strong><a href={playlistUrl} target="_blank" rel="noreferrer">Open on YouTube <ArrowUpRight aria-hidden="true" /></a></>
        ) : (
          <>
            <strong dir="auto"><TextTicker animationType="marquee" autoPlay>{track.title}</TextTicker></strong>
            <div className="media-track-artist" dir="auto"><TextTicker animationType="marquee" autoPlay>{status === 'loading' ? 'Connecting to YouTube…' : track.artist}</TextTicker></div>
          </>
        )}
      </div>
      <div className="media-player-controls">
        <Control label="Previous track" disabled={status !== 'ready' || starting} onClick={() => { setDirection(-1); playerRef.current?.previousVideo() }}><SkipBack aria-hidden="true" /></Control>
        <Control label={starting ? 'Starting playback' : playing ? 'Pause' : 'Play'} aria-busy={starting} aria-pressed={playing} disabled={status === 'loading' || starting} onClick={toggle}>
          {starting ? <LoaderCircle className="media-player-loading" aria-hidden="true" /> : playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Control>
        <Control label="Next track" disabled={status !== 'ready' || starting} onClick={() => { setDirection(1); playerRef.current?.nextVideo() }}><SkipForward aria-hidden="true" /></Control>
        <Control label={shuffled ? 'Disable shuffle' : 'Enable shuffle'} aria-pressed={shuffled} disabled={status !== 'ready' || starting} onClick={toggleShuffle}><Shuffle aria-hidden="true" /></Control>
      </div>
    </WidgetCard>
  )
}

export function MusicWidgets() {
  if (!playlist && !albums.length) return null
  return (
    <WidgetGrid className="media-music">
      {playlist && <WidgetViewport size="small"><VinylPlayer list={playlist} /></WidgetViewport>}
      {albums.length > 0 && <WidgetViewport size="small"><AlbumCarousel /></WidgetViewport>}
    </WidgetGrid>
  )
}

