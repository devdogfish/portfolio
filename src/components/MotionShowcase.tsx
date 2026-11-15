import { useEffect, useRef, useState } from 'react';
import { VideoDialog } from '@atom63/ui-react/media';
import { WidgetGrid, WidgetViewport } from '@atom63/widgets';
import { WidgetCard } from '@atom63/widgets/primitives';
import { CirclePlay } from 'lucide-react';
import './motion-showcase.css';

const slides = [
  { slug: 'meet-the-new-surface-copilot-pcs', title: 'Meet the new Surface Copilot+PCs', platform: 'youtube', id: '_0u0fQuzikA' },
  { slug: 'copilot-pcs-a-new-ai-era-at-work', title: 'Copilot+ PCs: A new AI era at work', platform: 'vimeo', id: '1207843576' },
  { slug: 'introducing-copilot-in-windows-11', title: 'Introducing Copilot in Windows 11', platform: 'vimeo', id: '878400795' },
  { slug: 'logitech-scribe', title: 'Logitech Scribe', platform: 'vimeo', id: '600858191' },
  { slug: 'oura-ring-gen3', title: 'Introducing the Oura Ring Gen3', platform: 'youtube', id: 'cuRmwctvZ2k' },
] as const;

type Slide = (typeof slides)[number];

const glyphs: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '&': [12, 18, 20, 8, 21, 18, 13],
  '·': [0, 0, 4, 14, 4, 0, 0],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  G: [14, 17, 16, 23, 17, 17, 15],
  I: [14, 4, 4, 4, 4, 4, 14],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
};

const marquee = [...'MOTION DESIGN & CGI ·    '].flatMap((letter) => [
  ...Array.from({ length: 5 }, (_, column) => glyphs[letter].map((row) => Boolean(row & (16 >> column)))),
  glyphs[' '].map(() => false),
]);

function thumbnail(slide: Slide) {
  return import.meta.env.BASE_URL + 'assets/media-motion-' + slide.slug + '.webp';
}

function DotMarquee({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    let offset = 0;
    let inView = true;

    function paint() {
      if (!canvas || !context) return;
      const width = canvas.clientWidth;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = width * pixelRatio;
      canvas.height = 28 * pixelRatio;
      context.scale(pixelRatio, pixelRatio);
      context.fillStyle = getComputedStyle(canvas).color;

      for (let column = 0; column < Math.floor(width / 4); column += 1) {
        const rows = marquee[(column + offset) % marquee.length];
        rows.forEach((lit, row) => {
          context.globalAlpha = lit ? .88 : .14;
          context.fillRect(column * 4 + 1, row * 4 + 1, 2, 2);
        });
      }
    }

    paint();
    const resize = new ResizeObserver(paint);
    resize.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; });
    intersection.observe(canvas);
    const interval = reducedMotion ? undefined : window.setInterval(() => {
      if (!inView || document.hidden || canvas.parentElement?.matches(':hover')) return;
      offset = (offset + 1) % marquee.length;
      paint();
    }, 32000 / marquee.length);

    return () => {
      window.clearInterval(interval);
      resize.disconnect();
      intersection.disconnect();
    };
  }, [reducedMotion]);

  return <div className="motion-widget-marquee" aria-hidden="true"><canvas ref={ref} /></div>;
}

function previewSource(slide: Slide) {
  if (slide.platform === 'vimeo') {
    return 'https://player.vimeo.com/video/' + slide.id + '?api=1&autoplay=1&loop=1&muted=1&controls=0&background=1';
  }
  const params = new URLSearchParams({
    autoplay: '1',
    controls: '0',
    enablejsapi: '1',
    iv_load_policy: '3',
    loop: '1',
    mute: '1',
    playlist: slide.id,
    playsinline: '1',
    rel: '0',
    fs: '0',
    disablekb: '1',
    origin: window.location.origin,
  });
  return 'https://www.youtube-nocookie.com/embed/' + slide.id + '?' + params;
}

function MotionPreview({ slide, play, visible, reducedMotion }: {
  slide: Slide;
  play: boolean;
  visible: boolean;
  reducedMotion: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [frameWidth, setFrameWidth] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const overscan = slide.platform === 'youtube' ? 1.18 : 1.12;
      setFrameWidth(Math.max(width, height * 16 / 9) * overscan);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [reducedMotion, slide.platform]);

  useEffect(() => {
    if (reducedMotion) {
      setLoaded(false);
      setReady(false);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!loaded) return;
    const timeout = window.setTimeout(() => setReady(true), slide.platform === 'youtube' ? 1600 : 0);
    return () => window.clearTimeout(timeout);
  }, [loaded, slide.platform]);

  useEffect(() => {
    if (!loaded || reducedMotion) return;
    const youtube = slide.platform === 'youtube';
    const message = youtube
      ? { event: 'command', func: play ? 'playVideo' : 'pauseVideo', args: [] }
      : { method: play ? 'play' : 'pause' };
    const service = youtube ? 'https://www.youtube-nocookie.com' : 'https://player.vimeo.com';
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), service);
  }, [loaded, play, reducedMotion, slide.platform]);

  return (
    <div className="motion-widget-preview" ref={stageRef} aria-hidden="true">
      <img src={thumbnail(slide)} alt="" decoding="async" />
      {!reducedMotion && (
        <div className="motion-widget-iframe" data-visible={ready && play && visible ? '' : undefined}>
          <iframe ref={iframeRef} onLoad={() => setLoaded(true)} src={previewSource(slide)}
            title={slide.title + ' preview'} tabIndex={-1} allow="autoplay; encrypted-media; picture-in-picture"
            style={{ width: frameWidth || '100%' }} />
        </div>
      )}
    </div>
  );
}

export function MotionShowcase() {
  const [current, setCurrent] = useState(0);
  const [peekFocused, setPeekFocused] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion || peekFocused || advancing || dialogOpen) return;
    const timeout = window.setTimeout(() => setAdvancing(true), 6400);
    return () => window.clearTimeout(timeout);
  }, [current, reducedMotion, peekFocused, advancing, dialogOpen]);

  useEffect(() => {
    if (!advancing) return;
    const timeout = window.setTimeout(() => {
      setCurrent((index) => (index + 1) % slides.length);
      setAdvancing(false);
    }, reducedMotion ? 0 : 500);
    return () => window.clearTimeout(timeout);
  }, [advancing, reducedMotion]);

  const tiles = advancing
    ? [
        { slide: slides[current], slot: 'exit' },
        { slide: slides[(current + 1) % slides.length], slot: 'main' },
        { slide: slides[(current + 2) % slides.length], slot: 'peek' },
      ]
    : [
        { slide: slides[current], slot: 'main' },
        { slide: slides[(current + 1) % slides.length], slot: 'peek' },
      ];

  function advance() {
    if (advancing || dialogOpen) return;
    setPeekFocused(false);
    setAdvancing(true);
  }

  return (
    <WidgetGrid className="motion-widget-grid">
      <WidgetViewport size="medium" aria-label="Motion design and CGI">
        <WidgetCard size="medium" className="motion-widget">
          <DotMarquee reducedMotion={reducedMotion} />
          <div className="motion-widget-stage" data-peek-focused={peekFocused ? '' : undefined} data-advancing={advancing ? '' : undefined}>
            {tiles.map(({ slide, slot }) => (
              <div className="motion-widget-tile" data-slot={slot} key={slide.slug}>
                <MotionPreview slide={slide} play={slot === 'main' && !dialogOpen} visible={!peekFocused && !advancing && !dialogOpen}
                  reducedMotion={reducedMotion} />
                {slot === 'main' && (
                  <VideoDialog title={slide.title} isOpen={dialogOpen} onOpenChange={setDialogOpen}
                    isVimeo={slide.platform === 'vimeo'} vimeoId={slide.platform === 'vimeo' ? slide.id : undefined}
                    isYouTube={slide.platform === 'youtube'} youtubeId={slide.platform === 'youtube' ? slide.id : undefined}
                    trigger={<button className="motion-widget-open" type="button" aria-label={'Open video: ' + slide.title} disabled={advancing}>
                      <span><CirclePlay aria-hidden="true" /></span>
                    </button>} />
                )}
                {slot === 'peek' && (
                  <button className="motion-widget-next" type="button" aria-label={'Show next: ' + slide.title}
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
  );
}
