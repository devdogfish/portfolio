import { statSync } from 'node:fs'
import { join } from 'node:path'
import { ArrowUpRight, ChevronLeft, Download, FileCode, FileText } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Button, Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/atoms'
import { InlinePreview } from '@/components/inline-preview'
import { DocPage } from '@/components/page'
import { coverFor, getProject, jobs, projects, type ProjectFile } from '@/content/projects'

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug)
  return project ? { title: project.title, description: project.subtitle, alternates: { canonical: `/project/${project.slug}` } } : {}
}

const external = { target: '_blank', rel: 'noreferrer' }

// PDFs open in a new tab; anything else (n8n JSON) downloads.
function FileRow({ file }: { file: ProjectFile }) {
  const ext = file.url.split('.').pop()!.toLowerCase()
  const pdf = ext === 'pdf'
  let size = ''
  try {
    const bytes = statSync(join(process.cwd(), 'public', decodeURIComponent(file.url))).size
    size = bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`
  } catch {}
  const Icon = pdf ? FileText : FileCode
  const Action = pdf ? ArrowUpRight : Download
  return (
    <Item variant="outline" size="sm" data-track={pdf ? 'cta:file' : 'cta:download'} data-track-target={file.url}
      render={<a href={file.url} {...(pdf ? external : { download: '' })} />}>
      <ItemMedia variant="icon"><Icon /></ItemMedia>
      <ItemContent>
        <ItemTitle>{file.label}</ItemTitle>
        <ItemDescription>{[ext.toUpperCase(), size].filter(Boolean).join(' · ')}</ItemDescription>
      </ItemContent>
      <ItemActions><Action aria-label={pdf ? 'Opens in a new tab' : 'Download'} size={16} /></ItemActions>
    </Item>
  )
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <Project params={params} />
    </Suspense>
  )
}

async function Project({ params }: Props) {
  const project = getProject((await params).slug)
  if (!project) notFound()
  const job = jobs.find(j => j.slug === project.jobId)
  const files = project.files ?? []
  const link = project.descriptionLink
  const linkedProject = link && getProject(link.slug)

  return (
    <DocPage crumb="Work">
      <a className="back" href="/#work"><ChevronLeft aria-hidden="true" />All work</a>
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
      {project.videoUrl === 'soon' ? (
        <figure className="video video-soon"><p>Walkthrough video coming soon</p></figure>
      ) : project.videoUrl ? (
        <figure className="video">
          <iframe src={project.videoUrl.replace('youtube.com', 'youtube-nocookie.com')} title={`${project.title} walkthrough`} loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </figure>
      ) : coverFor(project.slug) ? (
        <figure><img src={coverFor(project.slug)} alt={`${project.title} screenshot`} /></figure>
      ) : null}
      {project.fullDescription.split('\n\n').map((paragraph, index) => {
        const start = link ? paragraph.indexOf(link.phrase) : -1
        if (!link || !linkedProject || start === -1) return <p key={index}>{paragraph}</p>
        return (
          <p key={index}>
            {paragraph.slice(0, start)}
            <InlinePreview label={link.phrase} href={`/project/${linkedProject.slug}`} description={linkedProject.subtitle} image={coverFor(linkedProject.slug)} />
            {paragraph.slice(start + link.phrase.length)}
          </p>
        )
      })}
      <ul className="tags" aria-label="Technologies">
        {project.technologies.map(tech => <li key={tech}>{tech}</li>)}
      </ul>
      {files.length > 0 && (
        <>
          <h2>Files</h2>
          <ItemGroup className="files">
            {files.map(file => <FileRow key={file.url} file={file} />)}
          </ItemGroup>
        </>
      )}
    </DocPage>
  )
}
