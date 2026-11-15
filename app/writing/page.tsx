import type { Metadata } from 'next'
import { DocPage } from '@/components/page'
import { getPosts } from '@/lib/writing'

export const metadata: Metadata = { title: 'Writing', alternates: { canonical: '/writing' } }

const date = new Intl.DateTimeFormat('en-CA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export default function WritingPage() {
  return (
    <DocPage crumb="Writing">
      <h1>Writing</h1>
      <p className="lede">Notes on things I have built and what I learned doing it.</p>
      <ul className="post-list">
        {getPosts().map(post => (
          <li key={post.slug}>
            <a href={`/writing/${post.slug}`}>
              <strong>{post.title}</strong>
              <span>{post.summary}</span>
              <time dateTime={post.date}>{date.format(new Date(post.date))} · {post.minutes} min read</time>
            </a>
          </li>
        ))}
      </ul>
    </DocPage>
  )
}
