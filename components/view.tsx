import { ArrowUpRight, MapPin } from 'lucide-react'
import { coverFor, jobs, projects } from '@/content/projects'
import { site } from '@/content/site'
import { processSteps, services, type Block, type View } from '@/content/views'
import { getContributions } from '@/lib/github'
import { getPosts } from '@/lib/writing'
import { ActivityWidgets, GitHubIcon } from './activity-widgets'
import { Button, Card, CardContent } from './atoms'
import { InlinePreview } from './inline-preview'
import { FilmWidget, MusicWidgets } from './media-widgets'
import { hasFilms, hasMusic } from '@/content/personal'
import { MotionShowcase, type Slide } from './motion-showcase'
import { ProjectGallery } from './project-gallery'
import { Shell } from './shell'
import { WeatherClock } from './weather-clock'

function motionSlides(ids: string[]): Slide[] {
  return ids.flatMap((id): Slide[] => {
    const project = projects.find(p => p.slug === id)
    if (!project || !project.videoUrl) return []
    if (project.videoUrl === 'soon') return [{ slug: id, title: project.title, youtubeId: null }]
    const youtubeId = project.videoUrl.match(/embed\/([\w-]{11})/)?.[1]
    return youtubeId ? [{ slug: id, title: project.title, youtubeId }] : []
  })
}

const empty = (block: Block | undefined) =>
  (block?.kind === 'music' && !hasMusic) || (block?.kind === 'films' && !hasFilms) ||
  (block?.kind === 'motion' && motionSlides(block.ids).length === 0)

function Linked({ block }: { block: Extract<Block, { kind: 'text' }> }) {
  const { text, link } = block
  const at = link ? text.indexOf(link.phrase) : -1
  if (!link || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <InlinePreview label={link.phrase} href={link.href} description={link.description} image={link.image} />
      {text.slice(at + link.phrase.length)}
    </>
  )
}

function Ctas({ view }: { view: View }) {
  return (
    <div className="cta-row">
      {view.ctas.map((cta, index) => (
        <Button key={cta.label} variant={index === 0 ? 'default' : 'secondary'} size="lg" data-track={`cta:${cta.track}`} data-track-target={view.id}
          render={<a href={cta.href} {...(cta.external ? { target: '_blank', rel: 'noreferrer' } : {})} />}>
          {cta.label}
          {cta.external && <ArrowUpRight aria-hidden="true" />}
        </Button>
      ))}
    </div>
  )
}

async function Activity() {
  return <ActivityWidgets days={await getContributions()} writing={getPosts()} />
}

function BlockView({ block, view }: { block: Block; view: View }) {
  switch (block.kind) {
    case 'text':
      return <p id={block.id} className={block.chapter ? 'chapter' : undefined}><Linked block={block} /></p>
    case 'projects':
      return (
        <ProjectGallery items={block.ids.map(id => {
          const project = projects.find(p => p.slug === id)!
          return { slug: id, title: project.title, year: project.year, note: block.notes?.[id] ?? project.subtitle, image: coverFor(id) }
        })} />
      )
    case 'cta':
      return <Ctas view={view} />
    case 'services':
      return (
        <ul className="offer-list">
          {services.map(service => <li key={service.title}><h3>{service.title}</h3><p>{service.description}</p></li>)}
        </ul>
      )
    case 'process':
      return (
        <ol className="step-list">
          {processSteps.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}
        </ol>
      )
    case 'experience':
      return (
        <ul className="timeline">
          {block.ids.map(id => {
            const job = jobs.find(j => j.slug === id)!
            return (
              <li key={id}>
                <p className="timeline-meta"><span>{job.year}</span>{job.company.replace(' - ', ', ')}</p>
                <h3>{job.role}</h3>
                <p>{job.subtitle}</p>
              </li>
            )
          })}
        </ul>
      )
    case 'skills':
      return (
        <dl className="skill-list">
          {block.groups.map(group => <div key={group.title}><dt>{group.title}</dt><dd>{group.tools}</dd></div>)}
        </dl>
      )
    case 'motion':
      return <MotionShowcase slides={motionSlides(block.ids)} />
    case 'activity':
      return <section id="activity" aria-label="GitHub activity"><Activity /></section>
    case 'music':
      return <section id="music" aria-label="Music"><MusicWidgets /></section>
    case 'films':
      return <section id="films" aria-label="Favourite films"><FilmWidget /></section>
    case 'location':
      return <section aria-label="Weather and time in Halifax"><WeatherClock /></section>
  }
}

export function PortfolioView({ view }: { view: View }) {
  const blocks = view.blocks.filter((block, index) => !empty(block) && !(block.kind === 'text' && empty(view.blocks[index + 1])))
  const { focus, heroRole } = view
  const resume = view.ctas.find(cta => cta.track === 'resume')?.href ?? '/resumes/software.pdf'

  return (
    <Shell home="/" crumb="Index" email={view.email} resume={resume} cta={view.navCta}>
      <section className="hero-section">
        <div className="content-column">
          <h1>
            <span className="hero-row">
              Hello, my name is{' '}
              <span className="hero-identity">
                <a className="hero-profile" href={site.linkedin} target="_blank" rel="noreferrer">
                  <span className="hero-avatar"><img className="hero-portrait" src="/images/luigi.png" alt="" width="32" height="32" /></span>
                  {site.firstName}
                </a>
              </span>
            </span>
            <span className="hero-row">
              <span className="hero-muted">a.k.a.</span>
              <span className="hero-identity">
                <a className="hero-profile" href={site.github.url} target="_blank" rel="noreferrer">
                  <span className="hero-glyph" aria-hidden="true"><GitHubIcon /></span>
                  {site.handle}
                </a>
              </span>
            </span>
            <span className="hero-row">
              <span className="hero-muted">{heroRole.muted}</span>
              <span className="hero-identity">
                <a className="hero-profile" href={heroRole.href} {...(heroRole.href.startsWith('https://') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  {heroRole.mark === 'RBC'
                    ? <span className="hero-company-tile"><img className="hero-company" src="/logos/rbc-shield.svg" alt="" width="24" height="24" /></span>
                    : <span className="hero-glyph" aria-hidden="true"><MapPin /></span>}
                  {heroRole.label}
                </a>
              </span>
            </span>
          </h1>
        </div>
      </section>
      <div className="content-column page-flow">
        <Card className="press-card" aria-label={focus.eyebrow}>
          <CardContent className="press-content">
            <div className="press-copy">
              <div className="press-top">
                <p className="press-eyebrow">{focus.eyebrow}</p>
                <div className="press-meta">
                  {focus.source}<span>·</span><time>{focus.date}</time>
                </div>
              </div>
              <h2>
                <a href={focus.href} data-track="cta:focus" data-track-target={view.id}>{focus.title}</a>
                <ArrowUpRight aria-hidden size={12} />
              </h2>
              <p className="press-description">{focus.description}</p>
            </div>
            {focus.stats && (
              <dl className="press-stats">
                {focus.stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
              </dl>
            )}
          </CardContent>
        </Card>
        <div className="story" id="about">
          {blocks.map((block, index) => <BlockView key={index} block={block} view={view} />)}
        </div>
      </div>
    </Shell>
  )
}

