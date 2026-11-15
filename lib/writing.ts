import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'

export type Post = {
  slug: string
  title: string
  date: string
  summary: string
  tags: string
  minutes: number
  html: string
}

const dir = join(process.cwd(), 'content/writing')

function parse(file: string): Post {
  const raw = readFileSync(join(dir, file), 'utf8')
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)
  if (!match) throw new Error(`${file} needs frontmatter`)
  const meta = Object.fromEntries(match[1].split('\n').map(line => {
    const at = line.indexOf(':')
    return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
  }))
  const body = match[2].trim()
  return {
    slug: file.replace(/\.md$/, ''),
    title: meta.title,
    date: meta.date,
    summary: meta.summary,
    tags: meta.tags ?? '',
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
    html: marked.parse(body, { async: false }) as string,
  }
}

// Newest first. Posts are Markdown files in content/writing with title, date,
// summary and tags in the frontmatter.
export function getPosts(): Post[] {
  return readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .map(parse)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export const getPost = (slug: string) => getPosts().find(post => post.slug === slug)
