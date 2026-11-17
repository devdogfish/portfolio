import type { Audience } from '@/lib/audience'
import { getProject } from './projects'
import { resumes, site } from './site'

// Audience views, all prerendered and all served at `/` (see proxy.ts). Facts live
// in projects.ts; this file only decides what each audience reads first and how it is said.
// Each view also decides which sections exist at all: walkthrough videos and GitHub
// activity only appear where the reader is hiring for, or buying, that kind of work.

export type ViewId = 'default' | 'client' | 'employer'
export const tracks = ['software', 'web-cms', 'admin-excel'] as const
export type TrackId = (typeof tracks)[number]

type InlineLink = { phrase: string; href: string; description: string; image?: string }

export type Block =
  | { kind: 'text'; text: string; chapter?: boolean; id?: string; link?: InlineLink | InlineLink[] }
  | { kind: 'projects'; ids: string[]; notes?: Record<string, string> }
  | { kind: 'cta'; heading?: string; text?: string }
  | { kind: 'services' }
  | { kind: 'process' }
  | { kind: 'experience'; ids: string[] }
  | { kind: 'skills'; groups: { title: string; tools: string }[] }
  | { kind: 'motion'; ids: string[] }
  | { kind: 'activity' | 'music' | 'films' | 'location' }

export type Cta = { label: string; href: string; track: string; external?: boolean }
// `next` makes the stat roll between two states on a loop, like a slot machine reel.
type FocusStat = { label: string; value: string; href?: string; next?: { label: string; value: string; href?: string } }

export type View = {
  id: ViewId
  description: string
  heroRole: { muted: string; label: string; href: string; mark?: string }
  // Clients don't need the GitHub handle as the first thing they see.
  hideHandle?: boolean
  focus: {
    eyebrow: string
    source: string
    date: string
    title: string
    href: string
    description: string
    stats?: [FocusStat, FocusStat]
  }
  email: string
  // The one action that stays in the header while the visitor reads.
  navCta: Cta
  ctas: [Cta, Cta]
  blocks: Block[]
}

const contactCta: Cta = { label: 'Discuss your project', href: '/contact', track: 'contact' }

const quantselfLink: InlineLink = {
  phrase: 'Quantself',
  href: '/project/quantself',
  description: 'Tasks, calendar, habits, inventory, and budget in one workspace, behind one typed API.',
}

const rbcLink: InlineLink = {
  phrase: 'internal analytics platform',
  href: '/project/rbc-analytics',
  description: 'A Playwright crawler and page review tool for RBC’s website and marketing teams.',
}

const homeServerLink: InlineLink = {
  phrase: 'rebuilt my home server',
  href: '/project/home-infrastructure',
  description: 'Proxmox, private file storage, and local plus encrypted offsite backups, with restores tested.',
}

// Everyone else: people who found the site through GitHub, YouTube, LinkedIn or a
// search. Leads with my own work, keeps the personal sections.
export const defaultView: View = {
  id: 'default',
  description: 'Software developer in Halifax. Web applications, internal tools, client websites, and Quantself, my own personal operating system.',
  heroRole: { muted: 'Software developer at', label: 'RBC', href: 'https://www.rbccm.com', mark: 'RBC' },
  focus: {
    eyebrow: 'What I’m building',
    source: 'Personal project',
    date: '2026',
    title: 'Quantself, my personal operating system',
    href: '/project/quantself',
    description: 'Tasks, calendar, habits, inventory, and budget in one place. Edits show up right away and can be undone while they save.',
  },
  email: site.email.client,
  navCta: { label: 'Get in touch', href: '/contact', track: 'contact' },
  ctas: [contactCta, { label: 'Résumé', href: resumes.software, track: 'resume', external: true }],
  blocks: [
    { kind: 'text', text: 'I build web applications, internal tools, and client websites. Most of it starts with a task someone does over and over, and ends with something that does it for them and shows its work. This is where I keep what I’ve made, plus a few things I like.' },
    {
      kind: 'text',
      text: 'Today, I’m a software developer intern at RBC Capital Markets. I started out publishing content across four websites, then built an internal analytics platform that scans thousands of pages across our websites and shows the marketing team what needs fixing on each one.',
      link: rbcLink,
    },
    {
      kind: 'text',
      text: 'Outside work I’m building Quantself, a personal operating system for my life. My tasks, calendar, habits, inventory, and budget live in one place, and it’s built AI-first, so an assistant can read and act across all of it with zero friction. I’m getting it ready for an open-source release.',
      link: quantselfLink,
    },
    {
      kind: 'text',
      text: 'Quantself holds my own tasks, money, and habits, so I run it on infrastructure I manage myself. I rebuilt my home server and tested restoring the database and files from both local and offsite backups before moving anything real onto it.',
      link: homeServerLink,
    },
    { kind: 'text', text: 'I’m also building a few projects on the side for small and medium-sized businesses, so feel free to reach out if you have something in mind.' },
    { kind: 'text', id: 'work', chapter: true, text: 'Here’s some of my recent work.' },
    { kind: 'projects', ids: ['rbc-analytics', 'home-infrastructure', 'kristina-girke', 'yda-app', 'etpzp-sms', 'sitings', 'jobs', 'apollotec-emails', 'workouts-tracker', 'quantself'] },
    { kind: 'text', text: 'Some of these are easier to show than to explain, so I recorded walkthroughs.' },
    { kind: 'motion', ids: ['quantself', 'home-infrastructure', 'jobs', 'etpzp-sms', 'sitings', 'workouts-tracker'] },
    {
      kind: 'text', chapter: true,
      text: 'My first real project was an SMS system for the staff at my technical high school in Portugal. From there I moved on to client work: WordPress and Shopify sites for a Vancouver agency, and a custom CRM for a Dutch go-karting school.',
      link: [
        { phrase: 'SMS system', href: '/project/etpzp-sms', description: 'Scheduled Flash SMS, contacts, and an admin dashboard, self-hosted with Docker and Nginx.' },
        { phrase: 'custom CRM', href: '/project/yda-app', description: 'Signups, customer records, and invoicing for a Dutch go-karting school.' },
      ],
    },
    {
      kind: 'text', chapter: true,
      text: 'Most of my code is proprietary and doesn’t live on GitHub, so the graph below has some quiet stretches. The recent burst of commits is me making up for it.',
    },
    { kind: 'activity' },
    { kind: 'text', chapter: true, text: 'Heads up: there’s usually some good house music on while I work.' },
    { kind: 'music' },
    { kind: 'text', chapter: true, text: 'And a short list of movies and series I keep coming back to.' },
    { kind: 'films' },
    { kind: 'text', id: 'location', chapter: true, text: 'I’m based in Halifax. Whether you want to work together or just say hi, I’d love to hear from you.' },
    { kind: 'location' },
    { kind: 'cta' },
  ],
}

// Business owners and organizations. No personal tooling, no GitHub graph, no
// infrastructure. Only work a client could picture having built for them.
export const clientView: View = {
  id: 'client',
  description: 'Websites and custom business tools from an independent developer in Halifax. You work directly with the person building it.',
  heroRole: { muted: 'I build websites for', label: 'your business', href: '#services' },
  hideHandle: true,
  focus: {
    eyebrow: 'Recent client work',
    source: 'Kristina Girke',
    date: '2026',
    title: 'A new home for Kristina Girke’s paintings',
    href: '/project/kristina-girke',
    description: 'I moved her paintings and exhibition history off WordPress into a faster, custom-built site. When she finishes a new painting, she adds it herself.',
    stats: [
      { label: 'Moved off', value: 'WordPress', href: 'https://wordpress.org/', next: { label: 'Moved onto', value: 'Sanity', href: 'https://www.sanity.io/' } },
      { label: 'Live at', value: 'kristinagirke.com', href: getProject('kristina-girke')?.deployed ?? undefined },
    ],
  },
  email: site.email.client,
  navCta: { label: 'Let’s talk', href: '/contact', track: 'contact' },
  ctas: [{ label: 'Book a free call', href: '/book', track: 'book' }, { label: 'Send a message', href: '/contact', track: 'contact' }],
  blocks: [
    { kind: 'text', text: 'I build websites that present your work clearly, and business tools that take the busywork out of running it. You work directly with the person writing the code, so nothing gets lost in a handoff.' },
    { kind: 'text', text: 'A lot of sites today are generated in an afternoon and look like it. I design each page around your business and build it properly, so it holds up long after launch.' },
    { kind: 'text', id: 'services', chapter: true, text: 'Most projects fall into one of these.' },
    { kind: 'services' },
    { kind: 'text', id: 'work', chapter: true, text: 'Selected work.' },
    {
      kind: 'projects',
      ids: ['yda-app', 'sitings', 'apollotec-emails', 'etpzp-sms', 'kristina-girke'],
      notes: {
        'kristina-girke': 'An artist’s website built around painting series and exhibitions, with an editor for adding new work.',
        'yda-app': 'Event signups, customer records, and invoices for a Dutch go-karting school, in one app parents and staff both use.',
        sitings: 'I turned an agency’s designs into a working property map with filters and searches you can share as a link.',
        'apollotec-emails': 'Email templates that fill in employee details from Zoho, so the team stopped copying them by hand.',
        'etpzp-sms': 'A tool for school staff to send urgent text announcements, built and deployed for my old technical high school.',
      },
    },
    { kind: 'text', text: 'A short walkthrough of the property map.' },
    { kind: 'motion', ids: ['sitings'] },
    { kind: 'text', chapter: true, text: 'How a project usually goes.' },
    { kind: 'process' },
    {
      kind: 'text', chapter: true,
      text: 'A bit about me. During the week I build internal tools at RBC Capital Markets, part of Royal Bank of Canada, the country’s largest bank. Work there has to be accurate and hold up. Before that, I made WordPress and Shopify sites for a web agency’s clients. One of my larger projects is a fully fledged signup and invoicing app for a go-karting school in the Netherlands.',
      link: { phrase: 'signup and invoicing app', href: '/project/yda-app', description: 'Signups, customer records, and invoicing for Young Drivers Academy in the Netherlands.' },
    },
    { kind: 'text', id: 'location', chapter: true, text: 'I’m in Halifax and happy to work with you wherever you are.' },
    { kind: 'location' },
    { kind: 'cta', heading: 'Have something in mind?', text: 'Book a free discovery call, or send me a message and I’ll usually reply within twenty-four hours.' },
  ],
}

type Tailoring = {
  description: string
  role: string
  intro: string
  rbc: string
  focus: View['focus']
  projects: string[]
  notes: Record<string, string>
  // Walkthroughs worth a recruiter's two minutes for this role. Empty hides the section.
  demos: string[]
  demosIntro: string
  // GitHub activity only means something where the job is writing code.
  activity: boolean
  jobs: string[]
  skills: { title: string; tools: string }[]
  closing: string
}

const tailoring: Record<TrackId, Tailoring> = {
  software: {
    description: 'Software developer building internal tools and web applications. Intern at RBC Capital Markets, computer science at Dalhousie.',
    role: 'software developer intern at',
    intro: 'I’m a software developer intern at RBC Capital Markets and a computer science student at Dalhousie. I build TypeScript applications, connect APIs, and take responsibility for how the software runs once it ships.',
    rbc: 'At RBC I got the first version of an internal website and marketing platform to its first test release in two weeks. I also write unit tests and review pull requests on a separate client-onboarding app.',
    focus: {
      eyebrow: 'In focus', source: 'RBC Capital Markets', date: '2026',
      title: 'A crawler that makes a whole website searchable', href: '/project/rbc-analytics',
      description: 'One scan saves about 3,500 pages. After that, finding a keyword or pattern across all of them runs locally and comes back almost instantly.',
      stats: [{ label: 'Pages in one scan', value: '3,500' }, { label: 'Full scan', value: '2–4 hrs' }],
    },
    projects: ['quantself', 'home-infrastructure', 'yda-app', 'etpzp-sms', 'jobs', 'apollotec-emails', 'sitings', 'rbc-analytics'],
    notes: {
      'rbc-analytics': 'A Playwright crawler and a visual review tool with accessibility, SEO, and performance findings overlaid on each page.',
      quantself: 'My own app: a Next.js client over a Hono API and PostgreSQL, with instant edits, undo, passkeys, and scoped API keys.',
      'home-infrastructure': 'Proxmox, private file storage, and local plus encrypted offsite backups, with a database-and-files restore tested on synthetic data.',
      'yda-app': 'A Next.js and Prisma signup and invoicing app I’m building as the sole developer, now live and onboarding users.',
      'etpzp-sms': 'A bilingual messaging system with scheduled SMS, PostgreSQL, and Active Directory sign-in, self-hosted with Docker.',
    },
    demos: ['quantself', 'home-infrastructure', 'jobs', 'etpzp-sms'],
    demosIntro: 'Walkthroughs of a few of them, including the two I’m most proud of.',
    activity: true,
    jobs: ['rbc', 'yda', 'apollotec', 'etpzp', 'hmh'],
    skills: [
      { title: 'Applications', tools: 'TypeScript, React, Next.js, Node.js, Bun, Hono, Python, FastAPI' },
      { title: 'Data and testing', tools: 'PostgreSQL, SQLite, Prisma, Playwright, unit testing, OpenAPI' },
      { title: 'Delivery and operations', tools: 'GitHub Actions, Docker, Nginx, Proxmox, backups and restores, REST APIs, MCP' },
    ],
    closing: 'I’m in Halifax and open to hybrid or remote roles. The résumé below has everything on one page.',
  },
  'web-cms': {
    description: 'Accurate enterprise web publishing and hands-on development with TeamSite, WordPress, Shopify, Sanity, accessibility, and SEO.',
    role: 'web content developer at',
    intro: 'At RBC Capital Markets I publish content across four websites and build features in OpenText TeamSite. Before that I built WordPress features and Shopify themes for agency clients, and I moved a painter’s site from WordPress to Sanity.',
    rbc: 'The work ranges from swapping a keyword to building new page sections. I track every change request in Asana, and I built XSL components in TeamSite that pull content records into pages automatically instead of hardcoding them.',
    focus: {
      eyebrow: 'In focus', source: 'RBC Capital Markets', date: '2026',
      title: 'Publishing across four websites', href: '/project/rbc-analytics',
      description: 'Articles and change requests in OpenText TeamSite, plus a review tool that shows accessibility and SEO issues on the page itself.',
      stats: [{ label: 'Articles in 3 months', value: '≈ 60' }, { label: 'Websites', value: '4' }],
    },
    projects: ['sitings', 'kristina-girke', 'yda-app', 'rbc-analytics'],
    notes: {
      sitings: 'Turned agency designs into code: a WordPress property map using the Google Maps JavaScript API, ACF custom post types, and AJAX filters.',
      'rbc-analytics': 'A visual page review tool that pinpoints accessibility, SEO, and performance findings.',
      'kristina-girke': 'Moved a painter’s archive from WordPress to Sanity, organized by series and exhibitions, with an editor she uses herself.',
      'yda-app': 'A bilingual Dutch and English site and portal for a go-karting school, with signups and invoices.',
    },
    demos: ['sitings'],
    demosIntro: 'A short walkthrough of the WordPress property map.',
    activity: false,
    jobs: ['rbc', 'hmh', 'yda', 'apollotec', 'etpzp'],
    skills: [
      { title: 'Publishing', tools: 'OpenText TeamSite, WordPress, Advanced Custom Fields, Shopify, Sanity' },
      { title: 'Frontend', tools: 'HTML, CSS, JavaScript, PHP, XML, XSL' },
      { title: 'Website checks', tools: 'axe-core, Lighthouse, SEO metadata, content migration' },
    ],
    closing: 'I’m in Halifax and open to hybrid or remote roles. The résumé below has everything on one page.',
  },
  'admin-excel': {
    description: 'Accurate records, high-volume requests, Excel reporting, and practical workflow improvements. Experience at RBC Capital Markets.',
    role: 'web content developer at',
    intro: 'At RBC Capital Markets I audited every people profile on the public website and turned it into the Excel workbook the team now uses as its source of truth. I also handle requests from a shared inbox and track each one through review in Asana.',
    rbc: 'The site runs on a legacy CMS with no way to export who appears where, and outdated roles and departed staff were a compliance risk. I scraped and checked more than 3,000 pages without missing one, then built the workbook with filters and conditional formatting so it stays easy to update.',
    focus: {
      eyebrow: 'In focus', source: 'RBC Capital Markets', date: '2026',
      title: 'An audit of every profile on the public site', href: '/project/rbc-analytics',
      description: 'Every person, role, and page they appear on, collected into one Excel workbook that is now the team’s source of truth.',
      stats: [{ label: 'Pages audited', value: '3,000+' }, { label: 'Pages missed', value: '0' }],
    },
    projects: ['apollotec-emails', 'yda-app', 'workouts-tracker', 'rbc-analytics'],
    notes: {
      'rbc-analytics': 'A full audit of the people profiles on the public site, kept in an Excel workbook with filters and conditional formatting.',
      'apollotec-emails': 'Replaced manual copying with an email template tool that pulls employee details and job titles from Zoho.',
      'yda-app': 'Replaced paper event registration with online signups, and organized invoice PDFs in Google Drive.',
      'workouts-tracker': 'A faster way to log my workouts, with every record kept in Google Sheets.',
    },
    demos: ['workouts-tracker'],
    demosIntro: 'A short walkthrough of the Google Sheets workout log.',
    activity: false,
    jobs: ['rbc', 'apollotec', 'yda', 'hmh', 'etpzp'],
    skills: [
      { title: 'Spreadsheets', tools: 'Excel, Google Sheets, XLOOKUP, VLOOKUP, data validation, conditional formatting' },
      { title: 'Records and reporting', tools: 'CSV, JSON, Google Drive, Excel trackers' },
      { title: 'Request handling', tools: 'Asana, shared inboxes, OpenText TeamSite' },
      { title: 'Languages', tools: 'German (native), English (fluent), Portuguese (intermediate)' },
    ],
    closing: 'I’m in Halifax and open to in-office, hybrid, or remote roles. The résumé below has everything on one page.',
  },
}

export function employerView(track: TrackId): View {
  const t = tailoring[track]
  return {
    id: 'employer',
    description: t.description,
    heroRole: { muted: t.role, label: 'RBC Capital Markets', href: '#experience', mark: 'RBC' },
    focus: t.focus,
    email: site.email.employer,
    navCta: { label: 'Résumé', href: resumes[track], track: 'resume', external: true },
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
      ...(t.demos.length ? [{ kind: 'text', text: t.demosIntro } as const, { kind: 'motion', ids: t.demos } as const] : []),
      { kind: 'text', id: 'experience', chapter: true, text: 'Where I’ve worked.' },
      { kind: 'experience', ids: t.jobs },
      { kind: 'text', chapter: true, text: 'Tools I use day to day.' },
      { kind: 'skills', groups: t.skills },
      ...(t.activity ? [{ kind: 'text', chapter: true, text: 'Recent activity on GitHub.' } as const, { kind: 'activity' } as const] : []),
      { kind: 'text', id: 'location', chapter: true, text: t.closing },
      { kind: 'location' },
      { kind: 'cta' },
    ],
  }
}

export const viewFor = (audience?: Audience): View =>
  !audience ? defaultView : audience === 'client' ? clientView : employerView(audience)

export const services = [
  { title: 'Custom websites', description: 'Designed around your business, and easy for you to update.' },
  { title: 'Business tools', description: 'Bookings, invoicing, or reporting, built around how your team works.' },
  { title: 'AI where it helps', description: 'Hand one repetitive task, like drafting replies, to AI that’s tested on your real work.' },
]

export const processSteps = [
  { title: 'You set the budget', description: 'On a free call, tell me what you want it to do and how much you’d like to invest. I’ll tell you exactly what I can deliver for that.' },
  { title: 'Try it within a week', description: 'You get a first version to click around on your phone. Tell me what feels right before I finish it.' },
  { title: 'It stays up and running', description: 'I can handle the hosting for you, so you never have to think about it. Or I set up hosting under your own account if you’d rather manage it yourself.' },
  { title: 'A month of changes included', description: 'After launch, small changes are included for the first month.' },
]
