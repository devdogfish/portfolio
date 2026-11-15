import { useEffect, useState, type ReactNode } from 'react';
import {
  Badge, Button, Drawer, DrawerClose, DrawerContent, DrawerTitle, DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger, Marquee, ScrollArea,
} from '@atom63/ui-react';
import { WidgetGrid, WidgetViewport, widgetInsetStyle, widgetTypeStyle, type WidgetSize } from '@atom63/widgets';
import { WidgetCard, WidgetCardHeader, WidgetCardHeaderRight, WidgetCardTitle } from '@atom63/widgets/primitives';
import { ArrowDown, ArrowUp, ArrowUpRight, Building2, ChevronLeft, ChevronRight, Github, Globe, Grip, Headphones, Instagram, Linkedin, Mail, Music, Plus, RotateCcw, Shuffle, UserRound, X } from 'lucide-react';
import { GithubActivityWidget, OpenSourceWidget } from './ActivityWidgets';
import { AlbumCarousel, FilmWidget } from './MediaWidgets';
import { BehanceWidget, InstagramWidget } from './SocialWidgets';
import { AnalogClockFace, AnalogClockWidget, WeatherWidget } from './WeatherClock';
import './widget-exhibit.css';

const storageKey = 'portfolio-widget-board';
const catalog = {
  profile: { name: 'Profile Card', size: 'medium', resizable: true },
  time: { name: 'Local Time', size: 'medium', resizable: true },
  weather: { name: 'Weather', size: 'small', resizable: true },
  note: { name: 'Sticky Note', size: 'small', resizable: true },
  listening: { name: 'Recent Listening', size: 'medium', resizable: true },
  albums: { name: 'Album Collection', size: 'large', resizable: true },
  github: { name: 'GitHub Stats', size: 'medium', resizable: false },
  achievements: { name: 'Achievements', size: 'large', resizable: true },
  philosophy: { name: 'Philosophy', size: 'large', resizable: true },
  facts: { name: 'Random Facts', size: 'medium', resizable: true },
  films: { name: 'Favorite Films', size: 'medium', resizable: false },
  sudoku: { name: 'Sudoku Collection', size: 'medium', resizable: true },
  source: { name: 'Open Source', size: 'small', resizable: false },
  instagram: { name: 'Instagram', size: 'small', resizable: false },
  behance: { name: 'Behance', size: 'small', resizable: false },
  location: { name: 'Location', size: 'small', resizable: false },
  connect: { name: 'Connect', size: 'medium', resizable: true },
} as const;

type Kind = keyof typeof catalog;
type Tile = { id: string; kind: Kind; size: WidgetSize; note?: string };

const defaults: Kind[] = ['profile', 'time', 'weather', 'note', 'listening', 'albums', 'github', 'achievements', 'source', 'instagram', 'behance', 'location', 'connect'];
const sizes: WidgetSize[] = ['small', 'medium', 'large'];
const connectLinks = [
  { name: 'Email', url: 'mailto:hello.youzhang@gmail.com', icon: <Mail /> },
  { name: 'Behance', url: 'https://www.behance.net/youzhang', icon: <span className="sw-icon sw-icon-behance" /> },
  { name: 'Instagram', url: 'https://www.instagram.com/atom63_/', icon: <Instagram /> },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/you-zhang/', icon: <Linkedin /> },
  { name: 'GitHub', url: 'https://github.com/atom63', icon: <Github /> },
  { name: 'X', url: 'https://x.com/atom63_', icon: <X /> },
];

function defaultBoard(): Tile[] {
  return defaults.map((kind) => ({ kind, id: 'default-' + kind, size: catalog[kind].size }));
}

function readBoard(): Tile[] {
  try {
    const raw = localStorage.getItem(storageKey);
    const saved: unknown = raw && JSON.parse(raw);
    if (Array.isArray(saved) && saved.every((tile) => tile && typeof tile.id === 'string' &&
      Object.hasOwn(catalog, tile.kind) && sizes.includes(tile.size))) return saved;
  } catch {
    // The initial arrangement is usable when browser storage is unavailable.
  }
  return defaultBoard();
}

function BoardCard({ children, size, title, kind, badge, icon }: {
  children: ReactNode; size: WidgetSize; title?: string; kind?: string; badge?: ReactNode; icon?: ReactNode;
}) {
  return (
    <WidgetViewport size={size}>
      <WidgetCard size={size} className="size-full" data-widget-kind={kind}>
        {title && (
          <WidgetCardHeader>
            <WidgetCardTitle icon={icon}>{title}</WidgetCardTitle>
            {badge && <WidgetCardHeaderRight>{badge}</WidgetCardHeaderRight>}
          </WidgetCardHeader>
        )}
        {children}
      </WidgetCard>
    </WidgetViewport>
  );
}

function Profile({ size }: { size: WidgetSize }) {
  const [avatar, setAvatar] = useState(1);

  return (
    <BoardCard size={size} title="Profile" icon={<UserRound aria-hidden="true" />} badge={size !== 'small' && <Badge variant="success" style={widgetTypeStyle('label', size)}>Available</Badge>}>
      <div className="we-profile" data-size={size} style={widgetInsetStyle(size, 'body')}>
        <div className="we-profile-head">
          <div className="we-profile-copy">
            <div className="we-profile-name">
              <h3 style={widgetTypeStyle('title', size, { leading: 1.15 })}>You Zhang</h3>
              <Badge variant="outline" style={widgetTypeStyle('label', size)}>ATOM63</Badge>
            </div>
            <p className="we-muted" style={widgetTypeStyle('body', size)}>Design Engineer</p>
            <p className="we-profile-meta we-muted" style={widgetTypeStyle('body', size)}>
              <Globe aria-hidden="true" /><span>Los Angeles, CA</span><span aria-hidden="true">•</span><Building2 aria-hidden="true" /><span>Microsoft</span>
            </p>
          </div>
          <button type="button" className="we-profile-avatar" aria-label="Shuffle profile portrait"
            onClick={() => setAvatar((current) => current % 7 + 1)}>
            <img src={`/assets/exhibit-avatar-0${avatar}.jpg`} alt="" />
            <Shuffle aria-hidden="true" />
          </button>
        </div>
        {size === 'large' && <p className="we-muted" style={widgetTypeStyle('body', size)}>Building AI products through functional prototyping and semantic design systems.</p>}
        {size !== 'small' && (
          <div className="we-profile-actions">
            <Button size="sm" variant="primary" render={<a href="mailto:hello.youzhang@gmail.com" />}><Mail aria-hidden="true" />Let’s chat</Button>
            <Button size="sm" variant="secondary" render={<a href="https://www.linkedin.com/in/you-zhang/" target="_blank" rel="noreferrer" />}><Linkedin aria-hidden="true" />LinkedIn</Button>
          </div>
        )}
      </div>
    </BoardCard>
  );
}

function LocalTime({ size }: { size: WidgetSize }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    if (size === 'small') return;
    const ticker = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(ticker);
  }, [size]);

  if (size === 'small') return <AnalogClockWidget />;
  const localTime = time.toLocaleTimeString('en-GB');
  const [hours, minutes, seconds] = localTime.split(':');
  return (
    <BoardCard size={size} title="Local Time" badge={<Badge variant="secondary">Los Angeles</Badge>}>
      <div className="we-time" data-size={size} style={widgetInsetStyle(size, 'body')}>
        {size === 'large' && <AnalogClockFace now={time} size={204} />}
        <div className="we-time-reading">
          <div className="we-date">
            <strong style={widgetTypeStyle('title', size)}>{time.toLocaleDateString('en-US', { weekday: 'short' })}</strong>
            <span style={widgetTypeStyle('body', size)}>{time.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })}</span>
          </div>
          <time className="we-digital-clock" aria-label={localTime + ' local time'} dateTime={time.toISOString()}
            style={widgetTypeStyle('display', size, { designPx: size === 'medium' ? 80 : 52, weight: 600, leading: 1, trackingEm: -0.02 })}>
            <span aria-hidden="true">{hours}</span><i aria-hidden="true" /><span aria-hidden="true">{minutes}</span><i aria-hidden="true" /><span aria-hidden="true">{seconds}</span>
          </time>
        </div>
      </div>
    </BoardCard>
  );
}

type NotionProperty = {
  title?: { plain_text: string }[];
  rich_text?: { plain_text: string }[];
  files?: { external?: { url: string }; file?: { url: string } }[];
  url?: string;
  select?: { name: string };
  multi_select?: { name: string }[];
};

type NotionPage = { id: string; properties: Record<string, NotionProperty> };
const notionApi = 'https://atom63.io/api/notion/v1/databases/';

function useDatabase(id: string) {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(notionApi + id + '/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 100 }),
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('Data unavailable');
      const { results } = await response.json() as { results: NotionPage[] };
      if (!controller.signal.aborted) {
        setPages(results);
        setStatus('ready');
      }
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error');
    });
    return () => controller.abort();
  }, [id, attempt]);
  return { pages, status, retry: () => {
    setStatus('loading');
    setAttempt((value) => value + 1);
  } };
}

function Listening({ size }: { size: WidgetSize }) {
  const { pages, status, retry } = useDatabase('29b8af2e757446fbb0d518141d9e0fa0');
  const [offset, setOffset] = useState(0);
  const tracks = pages.flatMap(({ id, properties }) => {
    const title = properties.Title?.title?.[0]?.plain_text;
    const artist = properties.Subtitle?.rich_text?.[0]?.plain_text.replace(/ - Topic$/, '');
    const image = properties.Thumbnail?.files?.[0];
    const cover = (image?.external?.url ?? image?.file?.url)?.replace('/sddefault.jpg', '/hqdefault.jpg');
    const link = properties.Link?.url?.replace('https://www.youtube.com/', 'https://music.youtube.com/');
    return title && cover && link ? [{ id, title, artist, cover, link }] : [];
  });
  const count = size === 'small' ? 1 : size === 'medium' ? 4 : 9;
  const shown = [...tracks.slice(offset), ...tracks.slice(0, offset)].slice(0, count);
  const shuffle = () => setOffset((old) => (old + count) % tracks.length);

  return (
    <BoardCard size={size} title={size === 'small' ? 'Listening' : 'Recent Listening'} icon={<Headphones aria-hidden="true" />}>
      <div className="we-listening" data-size={size} style={widgetInsetStyle(size, 'body')}>
        {tracks.length > count && <Button size="icon-sm" variant="ghost" className="we-shuffle" aria-label="Shuffle listening tracks" onClick={shuffle}><Shuffle /></Button>}
        {status === 'loading' && <p role="status">Loading tracks…</p>}
        {status === 'error' && <Button onClick={retry} size="sm" variant="secondary">Retry listening</Button>}
        {status === 'ready' && shown.length === 0 && <p>No tracks yet</p>}
        {shown.map(({ id, title, artist, cover, link }) => (
          <a className="we-track" key={id} href={link} target="_blank" rel="noreferrer">
            <img src={cover} alt="" loading="lazy" />
            <span><strong title={title} style={widgetTypeStyle('body', size, { weight: 600, leading: 1.25 })}>{title}</strong>
              <span title={artist} style={widgetTypeStyle('body', size, { leading: 1.15 })}>{artist}</span></span>
          </a>
        ))}
      </div>
    </BoardCard>
  );
}

type Album = { id: number; title: string; artist: string; image: string; href: string };
type Release = {
  id: number;
  date_added: string;
  basic_information: { title: string; artists: { name: string }[]; cover_image: string; uri?: string };
};
const collectionUrl = 'https://atom63.io/api/discogs/users/MOONLIGHT_/collection/folders/0/releases';

function AlbumCollection({ size }: { size: WidgetSize }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [active, setActive] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (size === 'small') return;
    const controller = new AbortController();
    fetch(collectionUrl, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Discogs unavailable');
      const { releases } = await response.json() as { releases: Release[] };
      const next = releases
        .sort((a, b) => b.date_added.localeCompare(a.date_added))
        .map(({ id, basic_information: info }) => ({
          id, title: info.title, artist: info.artists[0]?.name ?? '', image: info.cover_image,
          href: info.uri ?? `https://www.discogs.com/release/${id}`,
        }));
      if (!controller.signal.aborted) {
        setAlbums(next);
        setStatus('ready');
      }
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error');
    });
    return () => controller.abort();
  }, [attempt, size]);

  useEffect(() => {
    if (paused || size === 'small' || albums.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % albums.length), 4000);
    return () => window.clearInterval(timer);
  }, [albums.length, paused, size]);

  if (size === 'small') return <WidgetViewport size="small"><AlbumCarousel /></WidgetViewport>;
  const visible = albums.length === 0 ? [] : (size === 'large' ? [-1, 0, 1] : [0, 1, 2])
    .slice(0, albums.length).map((position) => ({
      ...albums[(active + position + albums.length) % albums.length], position,
    }));
  function step(direction: number) {
    setActive((current) => (current + direction + albums.length) % albums.length);
  }

  return (
    <BoardCard size={size} title={size === 'large' ? 'My Album Collections' : 'Albums'} icon={<Music aria-hidden="true" />}>
      <div className="we-albums" data-size={size} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {status === 'loading' && <p role="status">Loading albums…</p>}
        {status === 'error' && <Button onClick={() => {
          setStatus('loading');
          setAttempt((current) => current + 1);
        }} size="sm" variant="secondary">Retry albums</Button>}
        {status === 'ready' && visible.length === 0 && <p>No albums in the collection</p>}
        {visible.map(({ id, title, artist, image, href, position }) => (
          <a className="we-album" key={id} data-position={position} href={href} target="_blank" rel="noreferrer"
            aria-label={`View ${title} by ${artist} on Discogs`}>
            <img src={image} alt="" />
            {size === 'large' && <>
              <ArrowUpRight className="we-album-external" aria-hidden="true" />
              <span className="we-album-details"><strong>{title}</strong>{artist}</span>
            </>}
          </a>
        ))}
        {size === 'large' && visible.length > 1 && <>
          <Button className="we-album-step we-album-previous" aria-label="Previous album" size="icon-lg" variant="secondary" onClick={() => step(-1)}><ChevronLeft /></Button>
          <Button className="we-album-step we-album-next" aria-label="Next album" size="icon-lg" variant="secondary" onClick={() => step(1)}><ChevronRight /></Button>
        </>}
      </div>
      {size === 'large' && <div className="we-album-marquee"><Marquee aria-label="Music Never Sleeps" gap="1.5rem"><span><Music aria-hidden="true" /> Music Never Sleeps</span></Marquee></div>}
    </BoardCard>
  );
}

function Achievements({ size }: { size: WidgetSize }) {
  const { pages, status, retry } = useDatabase('dbae58c3a08a49ffa40d310676fdc7b7');
  const counts = new Map<string, number>();
  for (const { properties } of pages) {
    const name = properties.Type?.select?.name ?? properties.Category?.select?.name ?? properties.Category?.multi_select?.[0]?.name;
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return (
    <BoardCard size={size} title="Achievements">
      <div className="we-achievements" style={widgetInsetStyle(size, 'body')}>
        {status === 'loading' && <p role="status">Loading achievements…</p>}
        {status === 'error' && <Button onClick={retry} size="sm" variant="secondary">Retry achievements</Button>}
        {status === 'ready' && counts.size === 0 && <p>No achievements to show</p>}
        {[...counts].sort((a, b) => b[1] - a[1]).map(([name, count]) => (
          <div key={name}><strong style={widgetTypeStyle('stat', size)}>{count}</strong><span style={widgetTypeStyle('label', size)}>{name}</span></div>
        ))}
      </div>
    </BoardCard>
  );
}

function RandomFacts({ size }: { size: WidgetSize }) {
  const { pages, status, retry } = useDatabase('1dca691cd5f780a89220f8720788f77a');
  const [index, setIndex] = useState(0);
  const fact = pages[index]?.properties;
  const image = fact?.Image?.files?.[0];
  const imageUrl = image?.external?.url ?? image?.file?.url;
  const title = fact?.Title?.title?.map(({ plain_text }) => plain_text).join('');
  const description = fact?.Description?.rich_text?.map(({ plain_text }) => plain_text).join('');
  function shuffle() {
    setIndex((previous) => (previous + 1 + Math.floor(Math.random() * (pages.length - 1))) % pages.length);
  }
  return (
    <BoardCard size={size} title="Random Facts">
      <div className="we-feature" style={widgetInsetStyle(size, 'body')}>
        {status === 'loading' && <p role="status">Loading facts…</p>}
        {status === 'error' && <Button onClick={retry} size="sm" variant="secondary">Retry facts</Button>}
        {status === 'ready' && !fact && <p>No facts yet</p>}
        {imageUrl && size !== 'small' && <img src={imageUrl} alt="" loading="lazy" />}
        {fact && <div className="we-feature-copy">
          <h3 style={widgetTypeStyle('title', size)}>{title}</h3>
          <p style={widgetTypeStyle('body', size)}>{description}</p>
          {pages.length > 1 && <Button onClick={shuffle} size="sm" variant="secondary"><Shuffle /> Shuffle</Button>}
        </div>}
      </div>
    </BoardCard>
  );
}

function Sudoku({ size }: { size: WidgetSize }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((previous) => (previous + 1) % 3), 4_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <BoardCard size={size} title="Sudoku Collection">
      <div className="we-feature" data-size={size} style={widgetInsetStyle(size, 'body')}>
        <a className="we-feature-image" href="https://opensea.io/collection/mrs-sudoku" target="_blank" rel="noreferrer">
          <img src={`/assets/exhibit-sudoku-${index}.jpg`} alt="View the mrssudoku art collection" />
        </a>
        {size !== 'small' && <div className="we-feature-copy">
          <h3 style={widgetTypeStyle('title', size)}>mrssudoku</h3>
          <p style={widgetTypeStyle('body', size)}>Three canvases featuring work by 147 3D artists.</p>
          <Button variant="primary" size="sm" render={<a href="https://opensea.io/collection/mrs-sudoku" target="_blank" rel="noreferrer" />}>View Collection</Button>
        </div>}
      </div>
    </BoardCard>
  );
}

function Philosophy({ size }: { size: WidgetSize }) {
  return (
    <BoardCard size={size} title="Philosophy">
      <div className="we-philosophy" style={{ ...widgetInsetStyle(size, 'body'), ...widgetTypeStyle('body', size) }}>
        <p>Inspired by <a href="https://ryo.lu/" target="_blank" rel="noreferrer">Ryo Lu</a>, this site explores building and evolving products with <a href="https://www.cursor.com/" target="_blank" rel="noreferrer">Cursor</a> and <a href="https://www.figma.com/" target="_blank" rel="noreferrer">Figma</a>.</p>
        {size === 'large' && <p>Built with <a href="https://react.dev/" target="_blank" rel="noreferrer">React</a>, powered by <a href="https://vitejs.dev/" target="_blank" rel="noreferrer">Vite</a>, and styled with <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer">Tailwind CSS</a>.</p>}
      </div>
    </BoardCard>
  );
}

function TileContent({ tile, onNoteChange }: { tile: Tile; onNoteChange: (note: string) => void }) {
  const { kind, size } = tile;
  switch (kind) {
    case 'profile': return <Profile size={size} />;
    case 'time': return <LocalTime size={size} />;
    case 'weather': return <WeatherWidget size={size} />;
    case 'note': return (
      <BoardCard size={size} kind="sticky-note">
        <div className="we-note-frame">
          <textarea className="we-note" aria-label="Sticky note" placeholder="Write a note..."
            value={tile.note ?? ''} onChange={(event) => onNoteChange(event.target.value)}
            style={{ ...widgetInsetStyle(size, 'face'), ...widgetTypeStyle('body', size, { leading: 1.5 }) }} />
        </div>
      </BoardCard>
    );
    case 'listening': return <Listening size={size} />;
    case 'albums': return <AlbumCollection size={size} />;
    case 'github': return <GithubActivityWidget />;
    case 'achievements': return <Achievements size={size} />;
    case 'philosophy': return <Philosophy size={size} />;
    case 'facts': return <RandomFacts size={size} />;
    case 'sudoku': return <Sudoku size={size} />;
    case 'source': return <OpenSourceWidget />;
    case 'instagram': return <InstagramWidget />;
    case 'behance': return <BehanceWidget />;
    case 'location': return <WeatherWidget location size={size} />;
    case 'connect': return (
      <BoardCard size={size} title={size === 'small' ? 'Connect' : 'Connect with me'}>
        <div className="we-connect" style={widgetInsetStyle(size, 'body')}>
          {connectLinks.map(({ name, url, icon }) => (
            <Button key={name} size="tile" variant="outline" aria-label={name} render={<a href={url} target="_blank" rel="noreferrer" />}>
              <span aria-hidden="true">{icon}</span>
              {size === 'large' && name}
            </Button>
          ))}
        </div>
      </BoardCard>
    );
    case 'films': return <FilmWidget />;
  }
}

export function WidgetExhibit({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [tiles, setTiles] = useState(readBoard);
  const [drag, setDrag] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [compact, setCompact] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const sync = () => setCompact(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tiles));
    } catch {
      // The board remains editable for the current page session.
    }
  }, [tiles]);

  function move(id: string, index: number) {
    setTiles((previous) => {
      const item = previous.find((tile) => tile.id === id);
      if (!item || index < 0 || index >= previous.length) return previous;
      const next = previous.filter((tile) => tile.id !== id);
      next.splice(index, 0, item);
      return next;
    });
  }

  function update(id: string, changes: Partial<Tile>) {
    setTiles((previous) => previous.map((tile) => tile.id === id ? { ...tile, ...changes } : tile));
  }

  function stopDrag() {
    setDrag(null);
    setTarget(null);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={compact ? 'bottom' : 'right'}>
      <DrawerContent className="we-drawer" viewportProps={{ className: 'we-viewport' }} contentProps={{ className: 'we-drawer-inner' }}>
        <DrawerTitle className="sr-only">Widgets</DrawerTitle>
        <DrawerClose className="we-close" aria-label="Close"><X size={16} /></DrawerClose>
        <ScrollArea className="we-scroll" viewportClassName="we-scroll-viewport" scrollFade scrollbarGutter={false}>
          <div className="we-toolbar">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="secondary" />}><Plus size={16} /> Add widget</DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {(Object.keys(catalog) as Kind[]).map((kind) => (
                  <DropdownMenuItem key={kind} onClick={() => setTiles((previous) => [
                    ...previous, { id: crypto.randomUUID(), kind, size: catalog[kind].size },
                  ])}>{catalog[kind].name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setTiles(defaultBoard())} variant="secondary"><RotateCcw size={16} /> Reset</Button>
          </div>
          {tiles.length === 0 && <p className="we-empty">Your board is empty</p>}
          <WidgetGrid className="we-board">
            {tiles.map((tile, index) => (
              <div className="we-tile" data-size={tile.size} data-drag-target={target === tile.id && drag !== tile.id || undefined} key={tile.id}
                onDragOver={(event) => { if (drag) { event.preventDefault(); setTarget(tile.id); } }}
                onDrop={(event) => {
                  if (!drag) return;
                  event.preventDefault();
                  move(drag, index);
                  stopDrag();
                }}>
                <TileContent tile={tile} onNoteChange={(note) => update(tile.id, { note })} />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="we-tile-control"
                    aria-label={`Manage ${catalog[tile.kind].name}`}
                    render={<Button size="icon-sm" variant="secondary" />}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', tile.id);
                      event.dataTransfer.effectAllowed = 'move';
                      setDrag(tile.id);
                    }}
                    onDragEnd={stopDrag}
                  ><Grip size={14} /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled={index === 0} onClick={() => move(tile.id, index - 1)}><ArrowUp size={14} /> Move earlier</DropdownMenuItem>
                    <DropdownMenuItem disabled={index === tiles.length - 1} onClick={() => move(tile.id, index + 1)}><ArrowDown size={14} /> Move later</DropdownMenuItem>
                    {catalog[tile.kind].resizable && sizes.filter((size) => size !== tile.size).map((size) => (
                      <DropdownMenuItem key={size} onClick={() => update(tile.id, { size })}>{size[0].toUpperCase() + size.slice(1)}</DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => setTiles((previous) => previous.filter(({ id }) => id !== tile.id))}><X size={14} /> Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </WidgetGrid>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
