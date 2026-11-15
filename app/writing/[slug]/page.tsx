import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { DocPage } from '@/components/page'
import { getPost, getPosts } from '@/lib/writing'

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug)
  return post ? { title: post.title, description: post.summary, alternates: { canonical: `/writing/${post.slug}` } } : {}
}

const date = new Intl.DateTimeFormat('en-CA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export default function PostPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <Post params={params} />
    </Suspense>
  )
}

async function Post({ params }: Props) {
  const post = getPost((await params).slug)
  if (!post) notFound()
  return (
    <DocPage crumb="Writing">
      <a className="back" href="/writing">← All writing</a>
      <h1>{post.title}</h1>
      <p className="lede">{post.summary}</p>
      <ul className="meta">
        <li><time dateTime={post.date}>{date.format(new Date(post.date))}</time></li>
        <li>{post.minutes} min read</li>
      </ul>
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
    </DocPage>
  )
}
