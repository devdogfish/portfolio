import type { Audience } from '@/lib/audience'
import { resumes, site } from './site'

// Audience views, all prerendered and all served at `/` (see proxy.ts). Facts live
// in projects.ts; this file only decides what each audience reads first and how it is said.

export type ViewId = 'default' | 'client' | 'employer'
export const tracks = ['software', 'web-cms', 'admin-excel'] as const
export type TrackId = (typeof tracks)[number]

type InlineLink = { phrase: string; href: string; description: string; image?: string }

export type Block =
  | { kind: 'text'; text: string; chapter?: boolean; id?: string; link?: InlineLink }
  | { kind: 'projects'; ids: string[]; notes?: Record<string, string> }
  | { kind: 'cta' }
  | { kind: 'services' }
  | { kind: 'process' }
  | { kind: 'experience'; ids: string[] }
  | { kind: 'skills'; groups: { title: string; tools: string }[] }
  | { kind: 'motion' | 'activity' | 'music' | 'films' | 'location' }

export type Cta = { label: string; href: string; track: string; external?: boolean }

export type View = {
  id: ViewId
  title: string
  description: string
  heroRole: { muted: string; label: string; href: string; mark?: string }
  focus: {
    eyebrow: string
    source: string
    date: string
    title: string
    href: string
    description: string
    stats: [{ label: string; value: string }, { label: string; value: string }]
  }
  email: string
  ctas: [Cta, Cta]
  blocks: Block[]
}

const contactCta: Cta = { label: 'Discuss your project', href: '/contact', track: 'contact' }

export const defaultView: View = {
  id: 'default',
  title: 'Luigi Girke: software, websites and practical tools',
  description: 'Software developer in Halifax. Web applications, client websites, and tools that make day-to-day work easier.',
  heroRole: { muted: 'Software developer at', label: 'RBC', href: 'https://www.rbccm.com', mark: 'RBC' },
  focus: {
    eyebrow: 'In focus',
    source: 'RBC Capital Markets',
    date: '2026',
    title: 'Internal analytics platform',
    href: '/project/rbc-analytics',
    description: 'A crawler and page review tool that turned content searches from hours or days into under an hour.',
    stats: [{ label: 'Pages in one scan', value: '3,500' }, { label: 'Content search', value: '< 1 hr' }],
  },
  email: site.email.client,
  ctas: [contactCta, { label: 'Résumé', href: resumes.software, track: 'resume', external: true }],
  blocks: [
    { kind: 'text', text: 'I build web applications, client websites, and the small tools that make day-to-day work easier. This is where I keep what I’ve made, plus a few things I like.' },
    {
      kind: 'text',
      text: 'Right now I’m a software developer intern at RBC Capital Markets. I started out publishing content across four websites, then built an internal analytics platform that crawls thousands of pages and marks accessibility, SEO, and performance issues right where they happen.',
      link: { phrase: 'internal analytics platform', href: '/project/rbc-analytics', description: 'A Playwright crawler, page review tool, and AI assistant for RBC’s website and marketing teams.' },
    },
    { kind: 'text', text: 'On the side I take on client projects. You deal with me directly, from the first conversation to launch day.' },
    { kind: 'text', id: 'work', chapter: true, text: 'Some recent work. Each one opens a full write-up with what I built and why.' },
    { kind: 'projects', ids: ['rbc-analytics', 'kristina-girke', 'yda-app', 'sitings', 'etpzp-sms', 'jobs', 'workouts-tracker', 'apollotec-emails'] },
    { kind: 'text', text: 'A few of these are easier to show than to explain, so I recorded short walkthroughs.' },
    { kind: 'motion' },
    {
      kind: 'text', chapter: true,
      text: 'How I got here: a technical high school in Portugal, where my final project became the SMS system the staff still use. Then WordPress and Shopify work for a Vancouver agency, a signup and invoicing app for a Dutch karting school, and now RBC.',
      link: { phrase: 'SMS system', href: '/project/etpzp-sms', description: 'Scheduled Flash SMS, contacts, and an admin dashboard, self-hosted with Docker and Nginx.' },
    },
    {
      kind: 'text', chapter: true,
      text: 'Most of my code lives on GitHub, including the job search pipeline that drafts tailored applications while I sleep.',
      link: { phrase: 'job search pipeline', href: '/project/jobs', description: 'n8n workflows, an Express PDF API, and a Mapbox globe of every application sent.' },
    },
    { kind: 'activity' },
    { kind: 'text', chapter: true, text: 'There’s usually music on while I work.' },
    { kind: 'music' },
    { kind: 'text', chapter: true, text: 'And a short list of films I keep coming back to.' },
    { kind: 'films' },
    { kind: 'text', id: 'location', chapter: true, text: 'I’m based in Halifax. If you’d like to work together, or just want to say hi, my inbox is open.' },
    { kind: 'location' },
    { kind: 'cta' },
  ],
}

export const clientView: View = {
  id: 'client',
  title: 'Luigi Girke: custom websites and business tools',
  description: 'Carefully built websites and custom business tools from an independent developer in Halifax. You work directly with the person building it.',
  heroRole: { muted: 'building websites for', label: 'your business', href: '#services' },
  focus: {
    eyebrow: 'Recent client work',
    source: 'Kristina Girke',
    date: '2026',
    title: 'A painter’s website she can update herself',
    href: '/project/kristina-girke',
    description: 'Painting series, single works, and an exhibition timeline, with a simple editor for adding new work.',
    stats: [{ label: 'Karting app users', value: '≈ 50' }, { label: 'Usual reply', value: '2 days' }],
  },
  email: site.email.client,
  ctas: [contactCta, { label: 'Email me', href: `mailto:${site.email.client}`, track: 'email' }],
  blocks: [
    { kind: 'text', text: 'I build custom websites that present your work clearly, and business tools that make running it easier. You work directly with the person writing the code, so nothing gets lost in a handoff.' },
    { kind: 'text', text: 'A lot of sites today are generated in an afternoon and look like it. I design each page for your business, build it properly, and check it on real phones before anyone else sees it.' },
    { kind: 'cta' },
    { kind: 'text', id: 'services', chapter: true, text: 'Most projects fall into one of these.' },
    { kind: 'services' },
    { kind: 'text', id: 'work', chapter: true, text: 'Selected work, starting with a site for the painter Kristina Girke.' },
    {
      kind: 'projects',
      ids: ['kristina-girke', 'yda-app', 'sitings', 'apollotec-emails', 'rbc-analytics'],
      notes: {
        'kristina-girke': 'An artist’s website built around painting series and exhibitions, with an editor for adding new work.',
        'yda-app': 'Online signups, customer records, and invoicing for a Dutch karting school, all in one place.',
        sitings: 'A live property map with filters and shareable searches, built while at Hope Media House.',
        'apollotec-emails': 'Fills employee details from Zoho into email templates, so a nine-person team stopped copying by hand.',
        'rbc-analytics': 'AI inside an existing workflow: staff ask questions about website data and create records in plain English.',
      },
    },
    { kind: 'text', chapter: true, text: 'How a project usually goes.' },
    { kind: 'process' },
    {
      kind: 'text', chapter: true,
      text: 'A bit about me. During the week I build internal tools at RBC Capital Markets, where work has to be accurate and hold up. Before that I built WordPress and Shopify sites for agency clients, and an app a karting school still runs its events on.',
      link: { phrase: 'an app a karting school', href: '/project/yda-app', description: 'Signups, invoicing, and staff planning for Young Drivers Academy in the Netherlands.' },
    },
    { kind: 'text', id: 'location', chapter: true, text: 'I’m in Halifax and happy to work with you wherever you are. I usually reply within two business days.' },
    { kind: 'location' },
    { kind: 'cta' },
  ],
}

type Tailoring = {
  title: string
  description: string
  role: string
  intro: string
  rbc: string
  focus: View['focus']
  projects: string[]
  notes: Record<string, string>
  jobs: string[]
  skills: { title: string; tools: string }[]
}

const tailoring: Record<TrackId, Tailoring> = {
  software: {
    title: 'Luigi Girke: software developer',
    description: 'Software developer building internal tools and web applications. Experience at RBC Capital Markets and agencies in Canada and Portugal.',
    role: 'software developer at',
    intro: 'I’m a software developer at RBC Capital Markets and a computer science student at Dalhousie. I build TypeScript applications, connect APIs, and ship tools people use at work.',
    rbc: 'At RBC I shipped the first version of an internal website and marketing platform to the test environment in two weeks. I also write unit tests and review pull requests on a separate client-onboarding app.',
    focus: {
      eyebrow: 'In focus', source: 'RBC Capital Markets', date: '2026',
      title: 'A crawler that made content searches take minutes', href: '/project/rbc-analytics',
      description: 'Some searches across the bank’s websites used to take hours or days. The crawler and review tool I built brought that under an hour.',
      stats: [{ label: 'Pages in one scan', value: '3,500' }, { label: 'First version', value: '2 weeks' }],
    },
    projects: ['rbc-analytics', 'yda-app', 'etpzp-sms', 'jobs', 'apollotec-emails', 'sitings'],
    notes: {
      'rbc-analytics': 'A Playwright crawler and a visual review tool with accessibility, SEO, and performance findings overlaid on each page.',
      'yda-app': 'A Next.js and Prisma signup and invoicing app I launched as the sole developer, with CI/CD across three environments.',
      'etpzp-sms': 'A bilingual messaging system with scheduled SMS, PostgreSQL, and Active Directory sign-in, self-hosted with Docker.',
    },
    jobs: ['rbc', 'yda', 'apollotec', 'etpzp', 'hmh'],
    skills: [
      { title: 'Applications', tools: 'TypeScript, React, Next.js, Python, FastAPI, Node.js' },
      { title: 'Data and testing', tools: 'PostgreSQL, SQLite, Prisma, Playwright, unit testing' },
      { title: 'Delivery and integration', tools: 'GitHub Actions, Docker, Nginx, REST APIs, MCP' },
    ],
  },
  'web-cms': {
    title: 'Luigi Girke: web content and CMS developer',
    description: 'Accurate enterprise web publishing and hands-on development with TeamSite, WordPress, Shopify, accessibility, and SEO.',
    role: 'web content developer at',
    intro: 'At RBC Capital Markets I’ve published content across four websites and built features in OpenText TeamSite. Before that I built WordPress features and Shopify themes for agency clients.',
    rbc: 'I handle around ten website change requests a day, track them in Asana, and built XSL components that pull TeamSite content records in automatically.',
    focus: {
      eyebrow: 'In focus', source: 'RBC Capital Markets', date: '2026',
      title: 'Publishing across four websites', href: '/project/rbc-analytics',
      description: 'Articles and change requests in OpenText TeamSite, plus a review tool that shows accessibility and SEO issues on the page itself.',
      stats: [{ label: 'Articles in 3 months', value: '≈ 60' }, { label: 'Requests a day', value: '≈ 10' }],
    },
    projects: ['sitings', 'rbc-analytics', 'kristina-girke', 'yda-app'],
    notes: {
      sitings: 'Turned agency designs into a WordPress property map with custom post types, ACF, grouped markers, and AJAX filters.',
      'rbc-analytics': 'A visual page review tool that pinpoints accessibility, SEO, and performance findings.',
      'kristina-girke': 'An artist portfolio built around painting series and exhibitions, with Sanity for content editing.',
    },
    jobs: ['rbc', 'hmh', 'yda', 'apollotec', 'etpzp'],
    skills: [
      { title: 'Publishing', tools: 'OpenText TeamSite, WordPress, Advanced Custom Fields, Shopify, Sanity' },
      { title: 'Frontend', tools: 'HTML, CSS, JavaScript, PHP, XML, XSL' },
      { title: 'Website checks', tools: 'axe-core, Lighthouse, SEO metadata, content migration' },
    ],
  },
  'admin-excel': {
    title: 'Luigi Girke: Excel, records and operations support',
    description: 'Accurate records, high-volume requests, Excel reporting, and practical workflow improvements. Experience at RBC Capital Markets.',
    role: 'web operations at',
    intro: 'At RBC Capital Markets I maintain Excel trackers for Marketing, handle requests from a shared inbox, and turn website records into data people can actually work with.',
    rbc: 'I manage change requests from the team’s shared inbox, keep Marketing’s Excel records current, and track each piece of work through review in Asana.',
    focus: {
      eyebrow: 'In focus', source: 'RBC Capital Markets', date: '2026',
      title: 'Tracking a website profile cleanup', href: '/project/rbc-analytics',
      description: 'Website profile records exported to Excel, CSV, and JSON, and kept current for Marketing through a large removal project.',
      stats: [{ label: 'Profiles tracked', value: '≈ 800' }, { label: 'Requests a day', value: '≈ 10' }],
    },
    projects: ['rbc-analytics', 'apollotec-emails', 'yda-app', 'workouts-tracker'],
    notes: {
      'rbc-analytics': 'Turned website profile data into Excel, CSV, and JSON files for tracking and reporting.',
      'apollotec-emails': 'Replaced manual copying with an email template tool that pulls employee details and job titles from Zoho.',
      'yda-app': 'Replaced paper event registration with online signups, and organized invoice PDFs in Google Drive.',
      'workouts-tracker': 'A personal logging tool with Google Sheets for records and Apps Script for validated updates.',
    },
    jobs: ['rbc', 'apollotec', 'yda', 'hmh', 'etpzp'],
    skills: [
      { title: 'Spreadsheets', tools: 'Excel, Google Sheets, XLOOKUP, VLOOKUP, data validation, conditional formatting' },
      { title: 'Records and reporting', tools: 'CSV, JSON, Google Drive, Excel trackers' },
      { title: 'Request handling', tools: 'Asana, shared inboxes, OpenText TeamSite' },
    ],
  },
}

export function employerView(track: TrackId): View {
  const t = tailoring[track]
  return {
    id: 'employer',
    title: t.title,
    description: t.description,
    heroRole: { muted: t.role, label: 'RBC Capital Markets', href: '#experience', mark: 'RBC' },
    focus: t.focus,
    email: site.email.employer,
    ctas: [
      { label: 'Download résumé', href: resumes[track], track: 'resume', external: true },
      { label: 'Email me', href: `mailto:${site.email.employer}`, track: 'email' },
    ],
    blocks: [
      { kind: 'text', text: t.intro },
      { kind: 'text', text: t.rbc },
      { kind: 'cta' },
      { kind: 'text', id: 'work', chapter: true, text: 'Work most relevant to the role.' },
      { kind: 'projects', ids: t.projects, notes: t.notes },
      { kind: 'text', text: 'Short walkthroughs of a few of them.' },
      { kind: 'motion' },
      { kind: 'text', id: 'experience', chapter: true, text: 'Where I’ve worked.' },
      { kind: 'experience', ids: t.jobs },
      { kind: 'text', chapter: true, text: 'Tools I use day to day.' },
      { kind: 'skills', groups: t.skills },
      { kind: 'text', chapter: true, text: 'Recent activity on GitHub.' },
      { kind: 'activity' },
      { kind: 'text', id: 'location', chapter: true, text: 'I’m in Halifax and open to hybrid or remote roles. The résumé below has everything on one page.' },
      { kind: 'location' },
      { kind: 'cta' },
    ],
  }
}

export const viewFor = (audience?: Audience): View =>
  !audience ? defaultView : audience === 'client' ? clientView : employerView(audience)

export const services = [
  { title: 'Custom websites', description: 'A site that makes your work easy to understand, and lets you handle everyday edits yourself. I design it, build it, and test it across screen sizes before launch.' },
  { title: 'Business tools', description: 'Signups, invoicing, bookings, or reporting, built around how your team already works and connected to the tools you rely on.' },
  { title: 'AI where it helps', description: 'Pick one task where AI could save time, like looking things up or drafting replies. I build it into your workflow and test it on real examples.' },
]

export const processSteps = [
  { title: 'Talk it through', description: 'We look at what you have, what’s getting in the way, and what a useful first version would cover.' },
  { title: 'Try a working version', description: 'You click through the important pages or workflows early, while there’s still time to change them.' },
  { title: 'Launch and hand over', description: 'I check everything before launch and show you how to run it yourself.' },
]
