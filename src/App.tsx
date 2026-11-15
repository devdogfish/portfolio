import { InlinePreview } from "./components/InlinePreview";
import { PortfolioFooter } from "./components/Footer";
import { MotionShowcase } from "./components/MotionShowcase";
import { ProjectGallery } from "./components/ProjectGallery";
import { SiteHeader, PersonalizationProvider } from "./components/SiteHeader";
import { SocialWidgets } from "./components/SocialWidgets";
import { useState } from "react";
import { Card, CardContent, TooltipProvider } from "@atom63/ui-react";
import { GridChrome } from "@atom63/ui-react/layout";
import { ArrowUpRight } from "lucide-react";
import { readContent, type PortfolioContent } from "./content";
import { ContentEditor } from "./components/ContentEditor";
import { WeatherClock } from "./components/WeatherClock";
import { ActivityWidgets } from "./components/ActivityWidgets";
import {
  LogosCarousel,
  MusicWidgets,
  FilmWidget,
} from "./components/MediaWidgets";
function LinkedCopy({
  text,
  phrase,
  label,
  href,
  image,
  description,
  avatar,
}: {
  text: string;
  phrase: string;
  label?: string;
  href: string;
  image: string;
  description: string;
  avatar?: string;
}) {
  const at = text.indexOf(phrase);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <InlinePreview
        label={label ?? phrase}
        href={href}
        image={image}
        description={description}
        favicon={avatar}
        avatar={avatar}
      />
      {text.slice(at + phrase.length)}
    </>
  );
}
function PressCard({ content: c }: { content: PortfolioContent }) {
  return (
    <Card className="press-card" aria-label="At a glance">
      <CardContent className="press-content">
        <div className="press-copy">
          <p className="press-eyebrow">{c.pressEyebrow}</p>
          <div className="press-meta">
            <img src="/assets/home-msft.png" alt="" />
            {c.pressSource}
            <span>·</span>
            <time>{c.pressDate}</time>
          </div>
          <h2>
            <a href={c.pressUrl} target="_blank" rel="noreferrer">
              {c.pressTitle}
            </a>
            <ArrowUpRight aria-hidden size={12} />
          </h2>
          <p className="press-description">{c.pressDescription}</p>
        </div>
        <dl className="press-stats">
          <div>
            <dt>Site visitors</dt>
            <dd>{c.visitors}</dd>
          </div>
          <div>
            <dt>Commits this week</dt>
            <dd>{c.commits}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
export default function App() {
  const [content, setContent] = useState(readContent);
  function update(c: PortfolioContent) {
    setContent(c);
    try {
      localStorage.setItem("portfolio-v2-content", JSON.stringify(c));
      return true;
    } catch {
      return false;
    }
  }
  return (
    <PersonalizationProvider>
      <TooltipProvider>
        <GridChrome
          maxWidth="narrowest"
          lineStyle="dashed"
          tone="default"
          id="top"
        >
          <SiteHeader email={content.email} />
          <main className="main-content">
            <section className="hero-section">
              <div className="content-column">
                <h1>
                  <span className="hero-row">
                    Hello, my name is{" "}
                    <span className="hero-identity">
                      <span className="avatar-initial">L</span>
                      <a href="#about">{content.name}</a>
                    </span>
                  </span>
                  <span className="hero-row">
                    <span className="hero-muted">a.k.a.</span>
                    <span className="hero-identity">
                      <img src="/assets/home-atom63.png" alt="" />
                      <a href="#work">{content.handle}</a>
                    </span>
                  </span>
                  <span className="hero-row">
                    <span className="hero-muted">{content.role}</span>
                    <span className="hero-identity">
                      <img src="/assets/home-msft.png" alt="" />
                      <a href="#work">{content.company}</a>
                    </span>
                  </span>
                </h1>
              </div>
            </section>
            <div className="content-column page-flow">
              <PressCard content={content} />
              <div className="story" id="about">
                <p>{content.intro}</p>
                <p>
                  <LinkedCopy
                    text={content.practice}
                    phrase="hands-on building"
                    href="https://www.microsoft.com/windows"
                    image="/assets/work-01-light.webp"
                    description="Windows interfaces, visual foundations, and tools for everyday work."
                    avatar="/assets/home-msft.png"
                  />
                </p>
                <p>
                  <LinkedCopy
                    text={content.approach}
                    phrase="working prototype"
                    href="https://x.com/ryolu_/status/1908328050154233863"
                    image="/assets/preview-baby-cursor.png"
                    description="An experiment in building a working environment for rapid interface exploration."
                  />
                </p>
                <p className="chapter" id="work">
                  {content.workIntro}
                </p>
                <ProjectGallery />
                <p>
                  <LinkedCopy
                    text={content.motionIntro}
                    phrase="Movement"
                    href="https://www.behance.net/msftVisd"
                    image="/assets/motion-01.webp"
                    description="Motion, visual design, and product storytelling from Microsoft."
                    avatar="/assets/home-msft.png"
                  />
                </p>
                <MotionShowcase />
                <p className="chapter">{content.background}</p>
                <SocialWidgets />
                <p className="chapter">
                  <LinkedCopy
                    text={content.openIntro}
                    phrase="useful resources"
                    href="https://system.atom63.io/"
                    image="/assets/work-02-light.webp"
                    description="ATOM63’s component library, design tokens, documentation, and interface experiments."
                    avatar="/assets/home-atom63.png"
                  />
                </p>
                <section id="activity" aria-label="Activity and writing">
                  <ActivityWidgets />
                </section>
                <p className="chapter">{content.brandsIntro}</p>
                <LogosCarousel />
                <p className="chapter">{content.musicIntro}</p>
                <section id="music" aria-label="Music">
                  <MusicWidgets />
                </section>
                <p className="chapter">{content.filmsIntro}</p>
                <section id="films" aria-label="Favorite films">
                  <FilmWidget />
                </section>
                <p className="chapter">{content.contactIntro}</p>
                <section id="location" aria-label="Weather and time">
                  <WeatherClock />
                </section>
              </div>
            </div>
          </main>
          <PortfolioFooter content={content} />
          <div className="bottom-dock">
            <a href="#top">
              <img src="/assets/home-atom63.png" alt="" />
              <span>Home</span>
            </a>
            <ContentEditor content={content} onChange={update} />
          </div>
        </GridChrome>
      </TooltipProvider>
    </PersonalizationProvider>
  );
}
