import { tracks, type Audience } from '@/lib/audience'
import { getProject } from './projects'
import { resumes, site } from './site'

// Audience views, all prerendered and all served at `/` (see proxy.ts). Facts live
// in projects.ts; this file only decides what each audience reads first and how it is said.
// Each view also decides which sections exist at all: walkthrough videos and GitHub
// activity only appear where the reader is hiring for, or buying, that kind of work.

export type ViewId = 'default' | 'client' | 'employer'
export { tracks }
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
  | { kind: 'activity'; hideHistory?: boolean }
  | { kind: 'music' | 'films' | 'location' }

export type Cta = { label: string; href: string; track: string; external?: boolean }
// `next` makes the stat roll between two states on a loop, like a slot machine reel.
type FocusStat = { label: string; pageCount: number } | { features: [string, string, string, string, string]; label: string } | { label: string; value: string; href?: string; next?: { label: string; value: string; href?: string } }

export type View = {
  id: ViewId
  description: string
  heroRole: { muted: string; label: string; href: string; mark?: string }
  // Clients don't need the GitHub handle as the first thing they see.
  hideHandle?: boolean
  focus: {
    crawlBackdrop?: boolean
    eyebrow: string
    source: string
    date: string
    title: string
    href: string
    description: string
    stats?: [FocusStat, FocusStat] | [FocusStat, FocusStat, FocusStat]
  }
  email: string
  // The one action that stays in the header while the visitor reads.
  navCta: Cta
  ctas: [Cta, Cta]
  blocks: Block[]
}

const emailCta = (address: string): Cta => ({ label: 'Email me', href: 'mailto:' + address, track: 'email' })

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
  phrase: 'my own physical infrastructure',
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
    eyebrow: 'Currently building',
    source: 'Personal project',
    date: '2026',
    title: 'Quantself, my personal operating system',
    href: '/project/quantself',
    stats: [
      { label: 'Tracks', features: ['Finances', 'Habits', 'To-dos', 'Calendar events', 'Home inventory'] },
      { label: 'Voice assistant', value: 'Jarvis' },
    ],
    description: 'Tasks, calendar, habits, inventory, and budget in one place. Edits show up right away and can be undone while they save.',
  },
  email: site.email.client,
  navCta: { label: 'Get in touch', href: '/contact', track: 'contact' },
  ctas: [emailCta(site.email.employer), { label: 'View my résumé', href: resumes.software, track: 'resume', external: true }],
  blocks: [
    { kind: 'text', text: 'I build web applications, internal tools, and client websites, and I also take on CMS content updates and Excel work. What I enjoy most is automation: finding a task someone does by hand over and over, and building something that does it for them.' },
    {
      kind: 'text',
      text: 'Today, I’m a software developer intern at RBC Capital Markets. I started out publishing content across four websites, then built an internal analytics platform that scans about 3,500 pages on rbccm.com and shows the marketing team what needs fixing on each one.',
      link: rbcLink,
    },
    {
      kind: 'text',
      text: 'Outside work, I’m building Quantself, a personal operating system that keeps my tasks, calendar, habits, inventory, and budget in one place. It’s built AI-first, so an assistant can read and act across all of it with zero friction, and I’m getting it ready for an open-source release.',
      link: quantselfLink,
    },
    {
      kind: 'text',
      text: 'To keep control of my personal data, I built my own physical infrastructure for Quantself. The setup includes Debian servers, with separate virtual machines for the app and file storage. Scheduled checks restore the PostgreSQL database from backup and alert me if recovery fails.',
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
    { kind: 'text', id: 'location', chapter: true, text: 'I’m based in Halifax, Canada.' },
    { kind: 'location' },
    { kind: 'cta', heading: 'Let’s talk', text: 'Have a role in mind? Tell me about it and we can see if I’m a good fit.' },
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
    { kind: 'text', text: 'I build websites that make it easy for customers to find and contact you, and tools that give you your evenings back.' },
    { kind: 'text', text: 'Every site is designed from scratch around your business, so it looks premium and feels like your own, unlike most template-based websites. Besides that, you work directly with the person writing the code. No middlemen, no explaining yourself twice.' },
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
      text: 'A bit about me. During the week I build internal tools at RBC Capital Markets, part of Royal Bank of Canada, the country’s largest bank. Work there has to be accurate and hold up. Before that, I made WordPress and Shopify sites for a web agency’s clients. One of my larger projects, built solo, is a custom CRM, a platform that runs a go-karting school in the Netherlands, from signups to invoices.',
      link: { phrase: 'custom CRM', href: '/project/yda-app', description: 'Signups, customer records, and invoicing for Young Drivers Academy in the Netherlands.' },
    },
    { kind: 'text', id: 'location', chapter: true, text: 'I’m in Halifax and happy to work with you wherever you are.' },
    { kind: 'location' },
    { kind: 'cta', heading: 'Let’s work together', text: 'Book a free discovery call, or send me a message and I’ll usually reply within twenty-four hours.' },
  ],
}

export const applicationTracker = {
  title: 'Application tracker',
  description: 'I use Google Sheets to keep one record per opening and a dashboard to review applications by date and location.',
}

const highlights = {
  backend: ['rbc-analytics', 'RBC Capital Markets', 'A searchable archive of 3,500 pages', 'I built a FastAPI backend and a Playwright crawler that saves about 3,500 pages per scan. The team can search the saved pages in seconds.'],
  'web-cms': ['rbc-analytics', 'RBC Capital Markets', 'Publishing and site analytics at RBC', 'For several months I published articles in OpenText TeamSite using XML templates and web forms. I tracked requests in Asana and Jira and kept documentation in Confluence. I also built two components for an internal site, then built the analytics platform for rbccm.com.'],
  'admin-excel': ['rbc-analytics', 'RBC Capital Markets', 'An Excel workbook for the public profile audit', 'I maintained a multi-tab Excel workbook covering 800+ employee profiles. I checked profiles by hand, using a custom scraper for part of the collection, so the team could find outdated titles and remove listings for people who had left.'],
  devops: ['home-infrastructure', 'Personal project', 'Rebuilding Quantself’s infrastructure on Proxmox', 'I separated the app and file storage into dedicated VMs, then rehearsed recovering the PostgreSQL database and its files together. Using test data, I restored from local and encrypted offsite copies and verified that records still pointed to the right files, with permissions intact.'],
  frontend: ['rbc-analytics', 'RBC Capital Markets', 'Watching a crawl of rbccm.com in real time', 'I built RBC’s internal analytics platform, from the multi-step crawl pipeline to the React dashboard where the team follows live requests and tracks each stage’s progress.'],
  'full-stack': ['quantself', 'Personal project', 'Quantself, from interface to infrastructure', 'I built the interface and typed API for my tasks, calendar, habits, inventory, and budget. I host the app on my own server.'],
} satisfies Record<TrackId, [string, string, string, string]>

const highlightStats: Record<TrackId, NonNullable<View['focus']['stats']>> = {
  backend: [
    { label: 'Crawler', value: 'Playwright', next: { label: 'API', value: 'FastAPI' } },
    { label: 'Storage', value: 'SQLite' },
  ],
  'web-cms': [
    { label: 'CMS', value: 'TeamSite', next: { label: 'Requests', value: 'Asana & Jira' } },
    { label: 'Analytics site', value: 'rbccm.com' },
  ],
  'admin-excel': [
    { label: 'Profiles', value: '800+', next: { label: 'Fields per profile', value: 'About 10' } },
    { label: 'Workbook', value: 'Excel' },
  ],
  devops: [
    { label: 'Local backup', value: 'Proxmox', next: { label: 'Offsite backup', value: 'Backblaze B2' } },
    { label: 'Recovery checks', value: 'Automated' },
  ],
  frontend: [
    { label: 'Interface', value: 'React', next: { label: 'Backend', value: 'FastAPI' } },
    { label: 'Per scan', pageCount: 3500 },
  ],
  'full-stack': [
    { label: 'Interface', value: 'Next.js', next: { label: 'Components', value: 'Chakra UI' } },
    { label: 'API', value: 'Hono' },
    { label: 'Database', value: 'PostgreSQL' },
  ],
}

const priorities: Record<TrackId, { projects: string[]; motion: string[] }> = {
  'web-cms': {
    projects: ['sitings', 'kristina-girke', 'rbc-analytics', 'apollotec-emails'],
    motion: ['sitings', 'jobs', 'etpzp-sms', 'workouts-tracker'],
  },
  'admin-excel': {
    projects: ['rbc-analytics', 'yda-app', 'apollotec-emails', 'jobs'],
    motion: ['jobs', 'etpzp-sms', 'workouts-tracker', 'sitings'],
  },
  devops: {
    projects: ['home-infrastructure', 'rbc-analytics', 'etpzp-sms', 'quantself'],
    motion: ['home-infrastructure', 'etpzp-sms', 'jobs', 'sitings', 'workouts-tracker'],
  },
  frontend: {
    projects: ['rbc-analytics', 'sitings', 'quantself', 'kristina-girke', 'jobs'],
    motion: ['sitings', 'jobs', 'workouts-tracker', 'etpzp-sms'],
  },
  backend: {
    projects: ['rbc-analytics', 'jobs', 'etpzp-sms', 'quantself'],
    motion: ['jobs', 'etpzp-sms', 'workouts-tracker', 'sitings'],
  },
  'full-stack': {
    projects: ['quantself', 'rbc-analytics', 'yda-app', 'jobs'],
    motion: ['jobs', 'etpzp-sms', 'sitings', 'workouts-tracker'],
  },
}

const roleTitles: Partial<Record<TrackId, string>> = {
  'full-stack': 'Full-stack developer at',
  'admin-excel': 'Excel / Software Developer at',
  'web-cms': 'Web content developer at',
}

const openings: Record<TrackId, string> = {
  'web-cms': 'I turn editorial requests into published pages. At RBC, that meant taking copy from Asana or Jira, fitting it into the right TeamSite template, and building custom components when editors needed something the template couldn’t do. On client sites, I care just as much about how someone updates a page as how it looks when it goes live.',
  'admin-excel': 'I like detailed work that gives a team a reliable record to come back to. For one audit, I maintained a multi-tab Excel workbook covering more than 800 employee profiles, checked entries by hand, and recorded every page where each person appeared so an editor could find exactly what needed changing.',
  devops: 'I build and run the infrastructure behind my applications. I enjoy the practical questions that come after a deploy, especially how to tell when something has failed and how to bring it back. On my own infrastructure, that includes restoring a database and checking that its records still point to the right files.',
  frontend: 'I build interfaces that make complicated systems easier to follow. A crawl might run for hours, but someone watching it should be able to tell in seconds what it’s doing. I like working out which details belong on screen and which can wait until someone needs to investigate.',
  backend: 'I build APIs and data pipelines for work that would be tedious to do one record at a time. One of my favorite problems was making an entire website searchable from a saved crawl, so the team could answer a new question without fetching every page again.',
  'full-stack': 'I like owning a feature from the first screen through to the database and deployment. For a go-karting school, that meant connecting what a parent enters at signup to the driver records staff use at the track and the invoice they approve afterward.',
}

export function employerView(track: TrackId): View {
  const [slug, source, title, description] = highlights[track]
  const showActivity = track !== 'admin-excel' && track !== 'web-cms'
  const resume = resumes[track]
  return {
    ...defaultView,
    id: 'employer',
    heroRole: { ...defaultView.heroRole, muted: roleTitles[track] ?? defaultView.heroRole.muted },
    focus: { crawlBackdrop: track === 'frontend', eyebrow: 'Featured project', source, date: getProject(slug)!.year, title, description, stats: highlightStats[track], href: '/project/' + slug },
    email: site.email.employer,
    ctas: [defaultView.ctas[0], { ...defaultView.ctas[1], href: resume }],
    blocks: defaultView.blocks.filter((block, index, blocks) =>
      showActivity || !(block.kind === 'text' && blocks[index + 1]?.kind === 'activity')
    ).map((block, index) => {
      if (index === 0 && block.kind === 'text') return { ...block, text: openings[track] }
      if (track === 'devops' && block.kind === 'text' && block.link === rbcLink) {
        return { ...block, text: 'At RBC Capital Markets, I built the internal analytics platform for rbccm.com and deployed it to a dedicated virtual machine on Armada.' }
      }
      if (block.kind === 'activity') return { ...block, hideHistory: !showActivity }
      if (block.kind !== 'projects' && block.kind !== 'motion') return block
      const priority = priorities[track][block.kind].filter(id => block.ids.includes(id))
      return { ...block, ...(block.kind === 'projects' && { notes: { ...block.notes, jobs: applicationTracker.description } }), ids: [...priority, ...block.ids.filter(id => !priority.includes(id))] }
    }),
  }
}

export const viewFor = (audience?: Audience): View =>
  !audience ? defaultView : audience === 'client' ? clientView : employerView(audience)

export const services = [
  { title: 'Custom websites', description: 'Designed around your business, and easy for you to update.' },
  { title: 'Business tools', description: 'Bookings, invoicing, or reporting, built around how your team works.' },
  { title: 'AI for your business', description: 'Whether it’s a digital coworker that clicks through your softwares or a smaller tool that drafts your replies, I figure out where AI actually helps and build only that.' },
]

export const processSteps = [
  { title: 'You set the budget', description: 'On a free call, tell me what you want it to do and how much you’d like to invest. I’ll tell you exactly what I can deliver for that.' },
  { title: 'Try it within a week', description: 'You get a first version to click around on your phone. Tell me what feels right before I finish it.' },
  { title: 'It stays up and running', description: 'I can handle the hosting for you, so you never have to think about it. Or I set up hosting under your own account if you’d rather manage it yourself.' },
  { title: 'A month of changes included', description: 'After launch, small changes are included for the first month.' },
]
