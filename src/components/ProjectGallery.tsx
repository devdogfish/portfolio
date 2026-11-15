import { useEffect, useRef, useState } from "react";
import { ScrollableList } from "@atom63/ui-react";
import {
  MediaLightbox,
  MediaLightboxZoomCursor,
  useMediaLightbox,
  useMediaLightboxZoomCursor,
  type MediaLightboxItem,
  type MediaLightboxAppearance,
} from "@atom63/ui-react/media";
import { ArrowUpRight, Sun, Moon } from "lucide-react";
import "./project-gallery.css";
const items: MediaLightboxItem[] = [
  [
    "windows-insider-program",
    "Windows Insider Program",
    "work-01",
    "https://www.behance.net/gallery/209964835/Windows-Insider-Program-10th-Anniversary-Wallpaper",
  ],
  [
    "microsoft-50th-anniversary",
    "Microsoft’s 50th Anniversary",
    "work-02",
    "https://unlocked.microsoft.com/50th/",
  ],
  [
    "windows-app",
    "Windows App",
    "gallery-windows-app",
    "https://www.behance.net/gallery/184979153/Windows-App-Wallpaper",
  ],
  ["ribbon", "Ribbon", "gallery-ribbon", ""],
  ["brushed", "Brushed", "gallery-brushed", ""],
  ["curvy", "Curvy", "gallery-curvy", ""],
  [
    "wip11",
    "WIP11",
    "gallery-wip11",
    "https://atom63.io/projects/wip11-wallpaper",
  ],
].map(([id, title, file, href]) => ({
  id,
  title,
  caption: title,
  alt: `${title} wallpaper`,
  darkSrc: `/assets/${file}.webp`,
  lightSrc: `/assets/${file}-light.webp`,
  href: href || undefined,
  thumbDarkSrc: `/assets/${file}-thumb.webp`,
  thumbLightSrc: `/assets/${file}-light-thumb.webp`,
}));
function Tile({
  item,
  appearance,
  frozen,
  origin,
  onRef,
  onOpen,
  onAppearance,
}: {
  item: MediaLightboxItem;
  appearance: MediaLightboxAppearance;
  frozen: boolean;
  origin: boolean;
  onRef: (e: HTMLDivElement | null) => void;
  onOpen: () => void;
  onAppearance: () => void;
}) {
  const destination = useRef<HTMLAnchorElement>(null);
  const cursor = useMediaLightboxZoomCursor({ excludeRefs: [destination] });
  return (
    <div className="parity-project" data-frozen={frozen || undefined}>
      <div
        className="parity-project-origin"
        ref={onRef}
        style={{ opacity: origin ? 0 : 1 }}
      >
        <div className="parity-project-images">
          <img
            loading="lazy"
            src={item.lightSrc}
            alt={appearance === "light" ? item.alt : ""}
            style={{ opacity: appearance === "light" ? 1 : 0 }}
          />
          <img
            loading="lazy"
            src={item.darkSrc}
            alt={appearance === "dark" ? item.alt : ""}
            style={{ opacity: appearance === "dark" ? 1 : 0 }}
          />
        </div>
      </div>
      <button
        className="parity-project-open"
        aria-label={`View ${item.title}`}
        onClick={onOpen}
        {...cursor.targetProps}
      >
        <MediaLightboxZoomCursor
          active={cursor.active && !frozen}
          x={cursor.overlay.x}
          y={cursor.overlay.y}
        />
      </button>
      <button
        className="parity-project-mode"
        aria-label={`Show ${appearance === "dark" ? "light" : "dark"} version of ${item.title}`}
        onClick={onAppearance}
      >
        {appearance === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      {item.href && (
        <a
          ref={destination}
          className="parity-project-destination"
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${item.title}`}
        >
          <span>
            <ArrowUpRight size={16} />
          </span>
        </a>
      )}
    </div>
  );
}
export function ProjectGallery() {
  const refs = useRef(new Map<string, HTMLDivElement>());
  const box = useMediaLightbox(items.length, {
    getOrigin: (i) => refs.current.get(items[i].id) ?? null,
  });
  const [appearance, setAppearance] = useState<
    Record<string, MediaLightboxAppearance>
  >({});
  const [frozen, setFrozen] = useState<string | null>(null);
  useEffect(()=>{const show=(event:Event)=>{const i=(event as CustomEvent<number>).detail;if(!Number.isInteger(i)||i<0||i>=items.length)return;setFrozen(items[i].id);box.openAt(i,refs.current.get(items[i].id))};window.addEventListener('portfolio:gallery',show);return()=>window.removeEventListener('portfolio:gallery',show)},[box.openAt]);
  return (
    <>
      <ScrollableList
        className="parity-projects"
        contentPad="24px"
        controlInset="0px"
        mask={false}
        showChevrons
      >
        {items.map((item, i) => (
          <Tile
            key={item.id}
            item={item}
            appearance={appearance[item.id] ?? "dark"}
            frozen={frozen === item.id}
            origin={box.isOpen && frozen === item.id}
            onRef={(e) => {
              if (e) refs.current.set(item.id, e);
              else refs.current.delete(item.id);
            }}
            onOpen={() => {
              setFrozen(item.id);
              box.openAt(i, refs.current.get(item.id));
            }}
            onAppearance={() =>
              setAppearance((a) => ({
                ...a,
                [item.id]: a[item.id] === "light" ? "dark" : "light",
              }))
            }
          />
        ))}
      </ScrollableList>
      <MediaLightbox
        items={items}
        open={box.isOpen}
        index={box.index}
        origin={box.origin}
        transition={box.transition}
        appearance={Object.fromEntries(
          items.map((i) => [i.id, appearance[i.id] ?? "dark"]),
        )}
        onAppearanceChange={(id, a) =>
          setAppearance((p) => ({ ...p, [id]: a }))
        }
        onIndexChange={(i) => {
          setFrozen(items[i].id);
          box.setIndex(i);
        }}
        onOpenChange={(open) => {
          if (!open) box.close();
        }}
        onExitComplete={() => setFrozen(null)}
        thumbnails
      />
    </>
  );
}
