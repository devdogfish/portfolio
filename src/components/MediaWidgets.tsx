import { useEffect, useRef, useState } from 'react';
import type { ComponentProps, CSSProperties } from 'react';
import { Button, ScrollableList, TextTicker, Tooltip, TooltipContent, TooltipTrigger } from '@atom63/ui-react';
import { WidgetGrid, WidgetImage, WidgetViewport } from '@atom63/widgets';
import { WidgetCard } from '@atom63/widgets/primitives';
import { ArrowUpRight, ExternalLink, LoaderCircle, Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import './media-widgets.css';

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/media-${name}`;

const logos = [
  { title: 'Eazo', year: 2026, file: 'eazo.png', url: 'https://eazo.ai/' },
  { title: 'ATOM63', year: 2026, file: 'a63-2026.svg' },
  { title: 'Holovita', year: 2025, file: 'holovita.png' },
  { title: 'Nexa AI', year: 2025, file: 'nexa.png', url: 'https://www.youtube.com/watch?v=GB6RW4GSOCU' },
  { title: 'Zhiman', year: 2025, file: 'zhiman.png', url: 'https://www.behance.net/gallery/231242737/Zhiman-Brand-Design-System-Brand-Guidelines' },
  { title: 'ATOM63', year: 2025, file: 'a63-2025.svg' },
  { title: 'Yunshi', year: 2024, file: 'yunshi.svg', url: 'https://www.behance.net/gallery/193568345/-YUNSHI-COFFEE-Logo-Design' },
  { title: 'ATOM63', year: 2022, file: 'a63-2022.svg', wordmark: true },
  { title: 'ATOM63', year: 2020, file: 'a63-2020.png' },
  { title: 'Hydeout', year: 2019, file: 'hydeout.svg', wordmark: true, url: 'https://www.behance.net/gallery/87171911/Hydeout-Identity-Design-Exploration' },
];

export function LogosCarousel() {
  return (
    <section className="media-logos" aria-label="Logos and identities">
      <h2>Logos &amp; identities · 2019–2026</h2>
      <ScrollableList className="media-logos-frame" contentPad="24px" controlInset="0px" mask={false} showChevrons>
        {logos.map(({ title, year, file, url, wordmark }) => {
          const src = asset(`logo-${file}`);
          const artworkClass = wordmark ? 'media-logo-art media-logo-wordmark' : 'media-logo-art';
          return (
            <figure className="media-logo" key={file}>
              <div className="media-logo-tile">
                {file.endsWith('.svg')
                  ? <span aria-hidden="true" title={title} className={`${artworkClass} media-logo-mask`} style={{ maskImage: `url(${src})` }} />
                  : <img alt="" className={artworkClass} src={src} width="64" height="64" loading="lazy" />}
              </div>
              <figcaption>
                {url ? <a href={url} target="_blank" rel="noreferrer">{title}</a> : <span>{title}</span>}
                <div>{year}</div>
              </figcaption>
            </figure>
          );
        })}
      </ScrollableList>
    </section>
  );
}

const films = [
  ['11', 'Nausicaä of the Valley of the Wind', 1984, 'tt0087544'],
  ['2', 'Alien: Covenant', 2017, 'tt2316204'],
  ['3', 'Alien', 1979, 'tt0078748'],
  ['romulus', 'Alien: Romulus', 2024, 'tt18412256'],
  ['12', 'The Dark Knight', 2008, 'tt0468569'],
  ['7', 'Spider-Man: Into the Spider-Verse', 2018, 'tt4633694'],
  ['8', 'Spider-Man: Across the Spider-Verse', 2023, 'tt9362722'],
  ['10', 'Princess Mononoke', 1997, 'tt0119698'],
  ['5', 'Ghost in the Shell', 1995, 'tt0113568'],
  ['9', 'Evangelion: 2.0 You Can (Not) Advance', 2009, 'tt0860906'],
  ['6', 'Akira', 1988, 'tt0094625'],
  ['4', 'Prometheus', 2012, 'tt1446714'],
  ['1', 'Blade Runner 2049', 2017, 'tt1856101'],
].map(([id, title, year, imdb]) => ({
  title: String(title),
  year,
  url: `https://www.imdb.com/title/${imdb}/`,
  poster: asset(`film-${id}.webp`),
}));

export function FilmWidget() {
  const [selection, setSelection] = useState(films.slice(0, 3));
  const [activeFilm, setActiveFilm] = useState<(typeof films)[number] | null>(null);
  const active = activeFilm ?? selection[0];

  function shuffleFilms() {
    const pool = films.filter((film) => !selection.includes(film));
    const next = Array.from({ length: 3 }, () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    setSelection(next);
    setActiveFilm(null);
  }

  return (
    <WidgetGrid className="media-film-grid">
      <WidgetViewport size="medium" aria-label="Favorite films">
        <WidgetCard className="media-films media-tile" size="medium">
          <div className="media-film-strip media-film-strip-top" aria-hidden="true" />
          <div className="media-film-content" onPointerLeave={() => setActiveFilm(null)}>
            <div className="media-film-text">
              <h2>Favorite films</h2>
              <div className="media-film-details" aria-live="polite">
                <p key={`year-${active.url}`}>{active.year}</p>
                <div className="media-film-title">
                  <a key={active.url} href={active.url} target="_blank" rel="noreferrer">{active.title} <ExternalLink aria-hidden="true" /></a>
                </div>
              </div>
              <Button className="media-film-shuffle" aria-label="Shuffle to show different selection" variant="secondary" size="sm" onClick={shuffleFilms}>
                <Shuffle aria-hidden="true" /> Shuffle
              </Button>
            </div>
            <div className="media-film-posters" data-spread={activeFilm ? 'true' : undefined} aria-label="Film posters">
              {selection.map((film, index) => (
                <a className={`media-film-poster media-film-${['front', 'left', 'right'][index]}`}
                  key={index}
                  data-active={activeFilm === film ? 'true' : undefined}
                  href={film.url}
                  aria-label={`View ${film.title} details`}
                  target="_blank"
                  rel="noreferrer"
                  onPointerEnter={() => setActiveFilm(film)}>
                  <WidgetImage alt="" src={film.poster} aspectRatio="2/3" crossfade />
                </a>
              ))}
            </div>
          </div>
          <div className="media-film-strip media-film-strip-bottom" aria-hidden="true" />
        </WidgetCard>
      </WidgetViewport>
    </WidgetGrid>
  );
}

const albums = [
  [32830032, "GDN Express", "國蛋"],
  [30807105, "Another Line EP", "Coro"],
  [33259368, "姚中二", "MC Hot Dog"],
  [31562848, "月光下的六重奏：演唱會紀實", "蛋堡 & Jabberloop"],
  [20519092, "月光", "蛋堡 & Jabberloop"],
  [20470216, "踩 · 腳 · 踏 · 車", "蛋堡 & Shin-Ski"],
  [31147172, "家常音樂", "蛋堡"],
  [3172029, "愛愛愛 (This Love)", "Khalil Fong"],
  [3172103, "15", "Khalil Fong"],
  [14116448, "?", "Xxxtentacion"],
  [12710591, "Ballads 1", "Joji"],
  [24001235, "Shinigami Note", "Mori Calliope"],
  [22923455, "I Never Die", "(G)I-DLE"],
  [28311712, "Get Up", "NewJeans"],
  [30805590, "Armageddon", "aespa"],
  [33341117, "Ruby", "Jennie"],
  [30912777, "How Sweet", "NewJeans"],
  [24903017, "New Jeans", "NewJeans"],
  [27971019, "Bootleg", "Kenshi Yonezu & Kenshi Yonezu"],
  [10522015, "Ghost In The Shell (Original Soundtrack)", "Kenji Kawai"],
  [13811533, "你所不知道的杜振熙之内部整修", "蛋堡"],
  [15255345, "收斂水", "蛋堡"],
  [28413781, "New DNA", "XG"],
  [28413643, "New DNA", "XG"],
  [25642645, "New Jeans", "NewJeans"],
  [27742149, "Get Up", "NewJeans"],
  [13801038, "Death Race For Love", "Juice WRLD"],
  [14718659, "Music To Be Murdered By", "Eminem & Slim Shady"],
  [11189045, "Σ", "Reol"],
  [12945946, "Head In The Clouds", "88rising"],
  [6435478, "25 Nights for Nujabes Vol.1", "Ta-Ku"],
  [12226106, "?", "Xxxtentacion"],
  [13881632, "Death Race For Love", "Juice WRLD"],
  [12726464, "Goodbye & Good Riddance", "Juice WRLD"],
  [1399260, "A Son Of The Sun", "Uyama Hiroto"],
  [7647062, "35xxxv (Deluxe Edition)", "One Ok Rock"],
  [7497038, "Radwimps 4~おかずのごはん~", "Radwimps"],
  [12144852, "Square Up", "Blackpink"],
  [12144807, "Square Up", "Blackpink"],
  [9174354, "君の名は。", "Radwimps"],
  [10987753, "Daydream", "Aimer"],
  [11622046, "My First Story", "My First Story"],
  [11412383, "The Story Is My Life", "My First Story"],
  [11622164, "Kyogen Neurose", "My First Story"],
  [5069151, "The Marshall Mathers LP 2", "Eminem"],
  [1257253, "Like Blood Like Honey", "Holly Brook"],
  [10782281, "Blackpink", "Blackpink"],
  [1868467, "Mirror", "DJ Okawari"],
  [11114145, "Bootleg", "Kenshi Yonezu & Kenshi Yonezu"],
  [837170, "Blessing It / The Final View", "Nujabes & Pase Rock & Substantial"],
  [3435765, "Reflection Eternal / Imaginary Folklore", "Clammbon & Yamazaki Hirokazu & Mino Takaaki & Yamane Satoshi & toe (5) & Nujabes"],
  [4752093, "Nicheシンドローム", "One Ok Rock"],
  [4404576, "人生×僕=", "One Ok Rock"],
  [7471460, "35xxxv", "One Ok Rock"],
  [7610548, "35xxxv (Deluxe Edition)", "One Ok Rock"],
  [651728, "Next View", "Nujabes & Uyama Hiroto"],
  [7478200, "Perfect Circle", "Nujabes & Shing02"],
  [684801, "Metaphorical Music", "Nujabes"],
  [3157115, "Spiritual State", "Nujabes"],
  [789482, "Modal Soul", "Nujabes"],
  [4374831, "Luv(sic) Grand Finale / Part 6", "Nujabes & Shing02"],
  [5150478, "Hybrid Theory", "Linkin Park"],
  [2058252, "Enth E Nd / Frgt/10", "Linkin Park"],
  [755049, "Numb / Encore", "Jay-Z & Linkin Park"],
  [7653039, "Luv(sic) Hexalogy", "Nujabes & Shing02"],
  [6661930, "Luv(sic) Part 3", "Nujabes & Shing02"],
  [4084506, "Luv(sic) Part 5", "Nujabes & Shing02"],
  [717275, "Luv(sic) Part Two", "Shing02"],
  [496634, "Luv(sic.)", "Shing02"],
  [2978163, "Luv(sic) Part 4", "Nujabes & Shing02"],
  [1072996, "H! Vltg3", "Linkin Park"],
] as const;

export function AlbumCarousel() {
  const [active, setActive] = useState(0);
  const [id, title, artist] = albums[active];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: number | undefined;

    function updateTimer() {
      window.clearInterval(timer);
      if (!preference.matches && !document.hidden) {
        timer = window.setInterval(() => {
          setActive((index) => (index + 1) % albums.length);
        }, 4000);
      }
    }

    updateTimer();
    preference.addEventListener('change', updateTimer);
    document.addEventListener('visibilitychange', updateTimer);
    return () => {
      window.clearInterval(timer);
      preference.removeEventListener('change', updateTimer);
      document.removeEventListener('visibilitychange', updateTimer);
    };
  }, [active]);

  return (
    <WidgetCard className="media-album media-tile" size="small" aria-roledescription="carousel" aria-label="Album collection">
      <div className="media-album-cover">
        <WidgetImage alt="" src={asset(`album-${id}.webp`)} crossfade />
        <div className="media-album-caption">
          <a href={`https://www.discogs.com/release/${id}`} aria-label={`View ${title} by ${artist} on Discogs`} target="_blank" rel="noreferrer">
            <strong>{title}</strong><ExternalLink aria-hidden="true" />
          </a>
          <span>{artist}</span>
        </div>
      </div>
    </WidgetCard>
  );
}

const playlist = 'PLHzUSiE_lp6UvlNZpZmrJuLoQohAnUgXN';
const playlistUrl = `https://www.youtube.com/playlist?list=${playlist}`;
const initialTrack = { videoId: 'TgSxdiQQBwk', title: '「不停的」Official Music Video', artist: 'Top Barry' };

interface PlaylistPlayer {
  destroy: () => void;
  getVideoData: () => { video_id?: string; title?: string; author?: string };
  getPlaylist: () => string[] | undefined;
  getPlaylistIndex: () => number;
  nextVideo: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  playVideoAt: (index: number) => void;
  previousVideo: () => void;
  setShuffle: (enabled: boolean) => void;
}

interface Youtube {
  Player: new (element: HTMLDivElement, options: {
    width: number;
    height: number;
    playerVars: Record<string, string | number>;
    events: {
      onReady: (event: { target: PlaylistPlayer }) => void;
      onStateChange: (event: { target: PlaylistPlayer; data: number }) => void;
      onAutoplayBlocked: () => void;
      onError: () => void;
    };
  }) => PlaylistPlayer;
}

const youtubeWindow = window as Window & {
  YT?: Youtube;
  onYouTubeIframeAPIReady?: () => void;
};

let apiRequest: Promise<Youtube> | undefined;

function getYoutubeApi() {
  if (youtubeWindow.YT?.Player) return Promise.resolve(youtubeWindow.YT);
  if (apiRequest) return apiRequest;

  apiRequest = new Promise<Youtube>((resolve, reject) => {
    const script = document.createElement('script');
    const previousCallback = youtubeWindow.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(fail, 8000);

    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      youtubeWindow.onYouTubeIframeAPIReady = previousCallback;
      reject(new Error('YouTube failed to load'));
    }

    youtubeWindow.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      youtubeWindow.onYouTubeIframeAPIReady = previousCallback;
      previousCallback?.();
      if (youtubeWindow.YT?.Player) resolve(youtubeWindow.YT);
      else fail();
    };

    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.addEventListener('error', fail, { once: true });
    document.head.append(script);
  }).catch((error: Error) => {
    apiRequest = undefined;
    throw error;
  });

  return apiRequest;
}

function PlaybackControl({ label, children, ...props }: ComponentProps<'button'> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<button aria-label={label} type="button" {...props}>{children}</button>} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function VinylPlayer() {
  const [attempt, setAttempt] = useState(0);
  const tileRef = useRef<HTMLDivElement>(null);
  const playRequested = useRef(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [playing, setPlaying] = useState(false);
  const [startingPlayback, setStartingPlayback] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [track, setTrack] = useState(initialTrack);
  const [trackDirection, setTrackDirection] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlaylistPlayer | null>(null);
  const cover = track.videoId === initialTrack.videoId
    ? asset('track-top-barry.webp')
    : `https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg`;

  useEffect(() => {
    const tile = tileRef.current;
    if (!tile || attempt) return;
    if (!('IntersectionObserver' in window)) {
      setAttempt(1);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        setAttempt(1);
      }
    }, { rootMargin: '200px' });
    observer.observe(tile);
    return () => observer.disconnect();
  }, [attempt]);

  useEffect(() => {
    if (!startingPlayback) return;
    const timeout = window.setTimeout(() => {
      setStartingPlayback(false);
      setPlaybackFailed(true);
    }, 10000);
    return () => window.clearTimeout(timeout);
  }, [startingPlayback]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !attempt) return;
    let disposed = false;
    const timeout = window.setTimeout(fail, 12000);

    function fail() {
      if (disposed) return;
      window.clearTimeout(timeout);
      setPlaying(false);
      setStartingPlayback(false);
      setStatus('unavailable');
    }

    function updateTrack(player: PlaylistPlayer) {
      const video = player.getVideoData();
      if (video?.video_id && video.title) {
        const id = video.video_id;
        setTrack({
          videoId: id,
          title: video.title.trim() || (id === initialTrack.videoId ? initialTrack.title : 'Unknown track'),
          artist: video.author?.trim() || (id === initialTrack.videoId ? initialTrack.artist : 'YouTube'),
        });
      }
    }

    void getYoutubeApi().then(({ Player }) => {
      if (disposed) return;
      const mount = document.createElement('div');
      stage.replaceChildren(mount);
      playerRef.current = new Player(mount, {
        width: 320,
        height: 200,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          list: playlist,
          listType: 'playlist',
          loop: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: ({ target }) => {
            if (disposed) return;
            window.clearTimeout(timeout);
            setStatus('ready');
            updateTrack(target);
            if (playRequested.current) {
              playRequested.current = false;
              setStartingPlayback(true);
              target.playVideo();
            }
          },
          onStateChange: ({ target, data }) => {
            if (disposed) return;
            if (data === 1 || data === 2 || data === 0 || data === 5) {
              setPlaying(data === 1);
              updateTrack(target);
            }
            if (data === 1) {
              setStartingPlayback(false);
              setPlaybackFailed(false);
            }
          },
          onAutoplayBlocked: () => {
            if (disposed) return;
            setStartingPlayback(false);
            setPlaybackFailed(true);
          },
          onError: fail,
        },
      });
    }).catch(fail);

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      playerRef.current?.destroy();
      playerRef.current = null;
      stage.replaceChildren();
    };
  }, [attempt]);

  function togglePlayback() {
    setPlaybackFailed(false);
    if (status === 'idle' || status === 'unavailable') {
      playRequested.current = true;
      setShuffled(false);
      setStatus('loading');
      if (status === 'unavailable' || !attempt) setAttempt((value) => value + 1);
    } else if (playing) {
      playerRef.current?.pauseVideo();
    } else {
      setStartingPlayback(true);
      playerRef.current?.playVideo();
    }
  }

  function toggleShuffle() {
    const player = playerRef.current;
    if (!player) return;
    setTrackDirection(1);
    player.setShuffle(!shuffled);
    setShuffled(!shuffled);
    const count = player.getPlaylist()?.length ?? 0;
    if (!shuffled && count > 1) {
      const current = player.getPlaylistIndex();
      player.playVideoAt((current + 1 + Math.floor(Math.random() * (count - 1))) % count);
    }
  }

  return (
    <WidgetCard className="media-vinyl media-tile" size="small" aria-label="Vinyl playlist player">
      <div ref={tileRef} className="media-vinyl-background" style={{ '--media-cover': `url("${cover}")` } as CSSProperties} />
      <div className={`media-record-stage${playing ? ' media-record-stage-playing' : ''}`} aria-hidden="true">
        <div className={`media-record${playing ? ' media-record-spinning' : ''}`}>
          <div className="media-record-label">
            <img key={cover} src={cover} alt="" style={{ '--media-track-angle': `${trackDirection * -16}deg` } as CSSProperties} />
          </div>
          <div className="media-record-sheen" />
          <div className="media-record-spindle" />
        </div>
      </div>
      <div className="media-youtube-stage" ref={stageRef} aria-hidden="true" inert />
      <div className="media-player-details" aria-live="polite">
        {status === 'unavailable' || playbackFailed ? (
          <><strong>Music unavailable</strong><a href={playlistUrl} target="_blank" rel="noreferrer">Open on YouTube <ArrowUpRight aria-hidden="true" /></a></>
        ) : (
          <>
            <strong dir="auto"><TextTicker animationType="marquee" autoPlay>{track.title}</TextTicker></strong>
            <div className="media-track-artist" dir="auto">
              <TextTicker animationType="marquee" autoPlay>{status === 'loading' ? 'Connecting to YouTube…' : track.artist}</TextTicker>
            </div>
          </>
        )}
      </div>
      <div className="media-player-controls">
        <PlaybackControl label="Previous track" disabled={status !== 'ready' || startingPlayback} onClick={() => {
          setTrackDirection(-1);
          playerRef.current?.previousVideo();
        }}><SkipBack aria-hidden="true" /></PlaybackControl>
        <PlaybackControl label={startingPlayback ? 'Starting playback' : status === 'unavailable' || playbackFailed ? 'Retry playback' : playing ? 'Pause' : 'Play'}
          aria-busy={startingPlayback} aria-pressed={playing} disabled={status === 'loading' || startingPlayback} onClick={togglePlayback}>
          {startingPlayback ? <LoaderCircle className="media-player-loading" aria-hidden="true" /> : playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </PlaybackControl>
        <PlaybackControl label="Next track" disabled={status !== 'ready' || startingPlayback} onClick={() => {
          setTrackDirection(1);
          playerRef.current?.nextVideo();
        }}><SkipForward aria-hidden="true" /></PlaybackControl>
        <PlaybackControl label={shuffled ? 'Disable shuffle' : 'Enable shuffle'} aria-pressed={shuffled} disabled={status !== 'ready' || startingPlayback} onClick={toggleShuffle}><Shuffle aria-hidden="true" /></PlaybackControl>
      </div>
    </WidgetCard>
  );
}

export function MusicWidgets() {
  return (
    <WidgetGrid className="media-music">
      <WidgetViewport size="small"><VinylPlayer /></WidgetViewport>
      <WidgetViewport size="small"><AlbumCarousel /></WidgetViewport>
    </WidgetGrid>
  );
}
