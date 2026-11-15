import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/atoms'
import { DocPage } from '@/components/page'
import { coverFor, getProject, jobs, projects } from '@/content/projects'

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug)
  return project ? { title: project.title, description: project.subtitle, alternates: { canonical: `/project/${project.slug}` } } : {}
}

const external = { target: '_blank', rel: 'noreferrer' }

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug)
  if (!project) notFound()
  const job = jobs.find(j => j.slug === project.jobId)
  const files = [...(project.presentations ?? []), ...(project.documentation ?? []), ...(project.downloads ?? [])]

  return (
    <DocPage crumb="Work">
      <a className="back" href="/#work">← All work</a>
      <h1>{project.title}</h1>
      <p className="lede">{project.subtitle}</p>
      <ul className="meta">
        <li>{project.year}</li>
        <li>{project.role}</li>
        {job && <li>{job.company.replace(' - ', ', ')}</li>}
      </ul>
      <div className="cta-row">
        {project.deployed && (
          <Button size="sm" data-track="cta:demo" data-track-target={project.slug} render={<a href={project.deployed} {...external} />}>
            {project.slug === 'kristina-girke' || project.slug === 'sitings' ? 'Visit the site' : 'Open the demo'} <ArrowUpRight aria-hidden="true" />
          </Button>
        )}
        {project.github?.map(repo => (
          <Button key={repo.url} size="sm" variant="secondary" data-track="cta:source" data-track-target={project.slug} render={<a href={repo.url} {...external} />}>
            {repo.label} <ArrowUpRight aria-hidden="true" />
          </Button>
        ))}
      </div>
      {project.videoUrl ? (
        <figure className="video">
          <iframe src={project.videoUrl.replace('youtube.com', 'youtube-nocookie.com')} title={`${project.title} walkthrough`} loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </figure>
      ) : coverFor(project.slug) ? (
        <figure><img src={coverFor(project.slug)} alt={`${project.title} screenshot`} /></figure>
      ) : null}
      {project.fullDescription.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      <ul className="tags" aria-label="Technologies">
        {project.technologies.map(tech => <li key={tech}>{tech}</li>)}
      </ul>
      {files.length > 0 && (
        <>
          <h2>Files</h2>
          <ul className="meta">
            {files.map(file => <li key={file.url}><a href={file.url} {...external}>{file.label ?? file.url}</a></li>)}
          </ul>
        </>
      )}
    </DocPage>
  )
}
