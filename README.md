# Editable portfolio

Editable React recreation of [atom63.io](https://atom63.io), using its actual [ATOM63 Design System](https://github.com/atom63/atom63-design-system):

- `@atom63/ui-react@0.2.0-beta.11` (Base UI underneath)
- `@atom63/styles@0.1.0-beta.7`
- `@atom63/widgets@0.1.0-beta.2`
- React 19, Vite 7, TypeScript, Tailwind CSS 4

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. `npm run build` typechecks and creates deployable files in `dist/`; `npm run preview` serves that build.

## Edit

Click **Edit content** in the bottom dock. Text and contact information save in this browser; **Download content** exports JSON. For permanent defaults, edit `src/content.ts`. Browser edits override defaults until reset in the editor.

Widget datasets, destinations, and assets are editable in:

- `src/components/ActivityWidgets.tsx` — GitHub profile, articles, open-source project.
- `src/components/MediaWidgets.tsx` — logos, albums, films, YouTube playlist.
- `src/components/WeatherClock.tsx` — weather coordinates and clock timezone.
- `src/App.tsx` — project gallery, social destinations, other page sections.
- `public/assets/` — local reference artwork.

## Behavior

Live Los Angeles weather from Open-Meteo, Fahrenheit/Celsius toggle, ticking Los Angeles clock. GitHub uses the reference site's public endpoint with a real cached snapshot fallback. Writing navigation, logo scrolling, album autoplay, film shuffle, image lightbox, and appearance controls are interactive. Music uses the reference YouTube playlist; playback depends on the provider and browser restrictions, with retry/external playback fallback.

Press counters and social statistics are editable samples, not connected analytics. The identity and prose are replacement portfolio content; artwork, album covers, logos, and sample links remain from the reference. Replace these before publishing your own portfolio. Google Fonts supplies Geist, Hedvig Letters Serif, and Doto. Original artwork belongs to its respective creators; library code is MIT licensed. Weather icons include their license in `public/assets/`.

## Paper

[Original editable Paper file](https://app.paper.design/file/01M7EQTG572S4GGYY6A1W70HMF/p-1-0).

Paper's free weekly MCP quota was exhausted during the initial design. This enhanced React implementation is independent of that earlier Paper snapshot; changes do not sync.

## Interaction parity pass

The latest pass replaces simplified overlays with ATOM63's AppearanceMenu, Command palette, MediaLightbox, VideoDialog, PreviewCard and Drawer components. The gallery has seven original light/dark wallpaper pairs. Hover/focus states, writing-card shuffle, film-poster fan, motion previews and album transitions follow the reference styles. The widget drawer includes the 17-item catalog, saved arrangement, editable notes, resizing and keyboard/drag reordering.

The homepage keeps editable replacement portfolio prose. Writing windows use short summaries and link to the full original articles. External pages and media stay hosted by their original services. The analog clock follows the reference implementation's visitor-local time (although the displayed place label is Los Angeles).

User-provided URLs are saved in `notes/atom63-references.md`.

Side-by-side settings captures: `previews/comparison.html`. Build and TypeScript pass; Brave checks cover 320/390px layouts, appearance controls, command search, lightbox paging, article expansion, and saved widget notes/add/remove.
