export interface GithubRepo {
  url: string;
  label: string;
}

export interface ProjectFile {
  url: string;
  label: string;
}

export interface Project {
  slug: string;
  title: string;
  year: string;
  role: string;
  subtitle: string;
  fullDescription: string;
  technologies: string[];
  jobId?: string; // slug of the job it was built for
  // YouTube embed URL, 'soon' for a walkthrough that is recorded but not yet
  // published (renders a placeholder), or null for no video.
  videoUrl: string | 'soon' | null;
  github?: GithubRepo[];
  deployed: string | null;
  files?: ProjectFile[];
}

export interface Job {
  slug: string;
  year: string;
  role: string;
  company: string;
  subtitle: string;
}

export const projects: Project[] = [
  {
    slug: "quantself",
    title: "Quantself",
    year: "2026",
    role: "Creator",
    subtitle: "My personal operating system, with tasks, calendar, habits, inventory and budget in one workspace.",
    fullDescription:
      "I built Quantself as a personal operating system for deciding what to do next. It brings my tasks, calendar, habits, inventory and budget into one workspace. Tasks have List, Today, Plan, Board and Triage views over one shared model, and the calendar shows the same tasks next to a habit lane. Inventory items can be captured with photos and placed in containers, and proposed details are held for my review. Budgeting keeps receipts separate from expenses and works out cash runway from a checkpoint, my spending and my plan.\n\nI designed everyday edits to feel immediate. A task edit updates the screen right away, and Undo and Redo work while the save is still queued, with stable command IDs and revision checks so a failed save only rolls back that one change. The web app, the Jarvis voice interface and my integrations all use the same typed API, built with Bun and Hono on PostgreSQL and Prisma, with the OpenAPI document generating the typed web client and the API reference. The web app uses Next.js and Chakra UI. Jarvis is a browser voice interface built on ElevenLabs that reads and edits tasks through that same API.\n\nQuantself is a single-owner application, so I built access control around that. The dashboard signs in with WebAuthn passkeys, with first-run enrollment that closes after setup and a spare passkey option in Settings. Agents and integrations get their own named API keys, with permissions granted per area and action, so ordinary writes and permanent deletion are separate grants. Keys can expire, be revoked, or be rotated with an overlap.\n\nFor operations, the app runs as containers, and GitHub Actions releases build the exact revision on the runner instead of the VPS, which protects the server’s memory. The release checks the candidate before applying migrations, then checks services and HTTP health. I also built a storage migration that can resume after an interruption, and I rehearsed recovering the database and the original files together as a pair. Moving production to my home server is still being prepared, so I treat it as planned rather than done.\n\nQuantself also powers this portfolio’s tracked links: they resolve through it and report opens back to it, and I read that reporting privately. The repository is private today and I’m preparing it for an open-source release. A feature walkthrough video is coming.",
    technologies: [
      "Next.js",
      "TypeScript",
      "Chakra UI",
      "Bun",
      "Hono",
      "PostgreSQL",
      "Prisma",
      "OpenAPI",
      "WebAuthn",
      "Docker",
      "GitHub Actions",
    ],
    videoUrl: "soon",
    deployed: null,
  },
  {
    slug: "home-infrastructure",
    title: "Home Infrastructure",
    year: "2026",
    role: "Creator",
    subtitle: "A Proxmox home server rebuild that separates app workloads, private file storage and backups.",
    fullDescription:
      "I rebuilt my home server around Proxmox so that application workloads, private file storage and backups no longer share one machine’s fate. The app and the file service run in separate virtual machines. I reach the server for administration remotely through Tailscale. Backups go to a local Proxmox Backup Server and, encrypted with restic, to Backblaze B2. File storage uses OpenCloud for original files, such as receipts and recordings, while the application keeps its records in PostgreSQL.\n\nThe part I care about most is recovery. An application is only recoverable if its database and its files come back as a matching pair, so I restore them together and check that file references, hashes, permissions and playback still work. With synthetic data, I verified a restored database-and-files pair from the local backup and, separately, from the offsite one. A scheduled PostgreSQL restore check and alerting are enabled.\n\nThis is the foundation for moving Quantself’s production data to the home server. That migration is being prepared and has not happened yet, and I don’t make claims here about uptime or cost. The Quantself case study covers the application side of that move. A video walkthrough of the rebuild is planned.",
    technologies: [
      "Proxmox",
      "Proxmox Backup Server",
      "OpenCloud",
      "restic",
      "Backblaze B2",
      "Tailscale",
      "PostgreSQL",
    ],
    videoUrl: "soon",
    deployed: null,
  },
  {
    slug: "rbc-analytics",
    title: "RBC Website Analytics",
    year: "2026",
    role: "Software Developer Intern",
    subtitle: "An internal platform for finding website content and reviewing accessibility, SEO, and performance issues.",
    fullDescription:
      "I built an internal website and marketing platform at RBC Capital Markets. A Playwright crawler saves server-rendered HTML, browser-rendered HTML, and page assets for every page it visits. One scan covers about 3,500 pages and takes two to four hours, depending on the request rate you choose. Once it’s done, finding a keyword or pattern across the whole site runs locally against the saved copy and comes back almost instantly, instead of someone opening pages one by one.\n\nThe platform reconstructs each page and marks axe-core and Lighthouse findings on the affected elements. I also built an assistant connected to the company’s AI gateway to answer questions about the platform’s data and create records. The live demo linked here is a separate reconstruction I built from captures of public pages with sample crawl history, and it does not give access to RBC’s internal systems. The first test release of the internal version took about two weeks.\n\nSeparate from the crawler, I audited every people profile on the public Capital Markets site. Some roles were out of date and some people had left the firm, which is a compliance problem when nobody has a full list of who appears where. The site runs on a legacy, template-based CMS where most of that data is hardcoded in XML files or static HTML, so there was no way to export it. I collected it with web scraping and semi-automated flows across more than 3,000 pages, without missing a page or a profile, and built an Excel workbook with filters and conditional formatting that the team still updates and uses as the source of truth for who is on the site.",
    technologies: ["TypeScript", "React", "FastAPI", "SQLite", "Playwright", "axe-core", "Lighthouse"],
    videoUrl: null,
    jobId: "rbc",
    deployed: "https://rbc-analytics.demo.girke.dev",
  },
  {
    slug: "kristina-girke",
    title: "Kristina Girke",
    year: "2026",
    role: "Web Developer",
    subtitle: "A portfolio for a painter, with painting series, exhibition history, and a content editor.",
    fullDescription:
      "I rebuilt Kristina Girke’s website in Next.js and migrated her artwork from WordPress to Sanity. Visitors can browse painting series, view individual paintings, and explore the exhibition history. Kristina edits the archive herself through Sanity Studio.",
    technologies: ["Next.js", "Sanity"],
    videoUrl: null,
    deployed: "https://kristinagirke.com",
  },
  {
    slug: "yda-app",
    title: "CRM for Young Drivers Academy",
    year: "2025–present",
    role: "Full Stack Developer",
    subtitle: "Event signup, customer records and invoicing for a Dutch karting school.",
    fullDescription:
      "I’m the sole developer of a signup and invoicing app for Young Drivers Academy, a Dutch go-karting school. The app replaced manual registration records and lets parents manage several drivers and register them for events, and gives staff a way to review registrations and record parts and services at the track. We launched it recently and are onboarding users gradually, and I’m still actively developing it. Parents, drivers and administrators have separate roles.\n\nEvent signups feed into an invoice creation and approval workflow. The app generates invoice PDFs, stores them in Google Drive, and sends app emails through Resend. I built the app with TypeScript, Next.js, and Prisma, and set up a GitHub Actions deployment pipeline for development, test, and live environments.",
    technologies: ["TypeScript", "Next.js", "Prisma Postgres", "Tailwind CSS"],
    videoUrl: null,
    jobId: "yda",
    deployed: "https://app.yda-kart.com/",
  },
  {
    slug: "sitings",
    title: "Sitings Platform",
    year: "2024",
    role: "Frontend Engineer",
    subtitle: "Agency designs turned into a WordPress property map with Google Maps, AJAX filters and shareable searches.",
    fullDescription:
      "Sitings is a real estate company, and I built the property map and search for their website during my internship at Hope Media House in summer 2024. The agency’s designers handed me the designs; my job was to turn them into working code: a WordPress integration with the Google Maps JavaScript API, AJAX filtering, and the PHP templates behind every page. The platform prominently features a Google Maps integration, displaying properties as clustered pins. This allows users to visually browse locations and utilize a ‘Search in this area’ feature, which dynamically filters listings based on the current map bounds.\n\nBeyond the map, the system includes comprehensive attribute-based filtering - users can narrow down properties by various criteria, with all selections persisting in the URL so filtered views can be shared or bookmarked. The technical foundation relies on PHP and WordPress's ACF plugin to manage custom post types and metadata for properties and tenants, which are then rendered across multiple page templates: a main listings page with all the filters, an individual property page, and a tenant page.\n\nEvery filter state and map position is encoded in the URL parameters, meaning when someone refreshes the page or shares a link, the exact view is preserved and reapplied automatically. I built the frontend using HTML, CSS, and JavaScript alongside PHP templating, which gave me a solid grasp of how these fundamental technologies work together in a real-world application. The property directory is live at sitings.ca.",
    technologies: [
      "Google Maps JavaScript API",
      "AJAX",
      "PHP",
      "JavaScript",
      "CSS",
      "WordPress ACF",
    ],
    videoUrl: "https://www.youtube.com/embed/1B8fnBac9tY",
    jobId: "hmh",
    deployed: "https://sitings.ca/property/?available=true",
  },
  {
    slug: "apollotec-emails",
    title: "Apollotec Email Management",
    year: "2025",
    role: "Full Stack Developer",
    subtitle: "An email template tool that fills employee details and job titles from Zoho.",
    fullDescription:
      "I independently built and launched an email template app for Apollotec, used across the team. The app pulls employee details and job titles from the Zoho API to fill in templates and replace manual copying.",
    technologies: ["Zoho API", "React", "Express"],
    videoUrl: null,
    jobId: "apollotec",
    deployed: null,
  },
  {
    slug: "etpzp-sms",
    title: "ETPZP SMS System",
    year: "2024/2025",
    role: "DevOps/Full Stack Developer",
    subtitle:
      "Developed a Flash SMS sending system for staff at ETPZP, my former Portuguese high school.",
    fullDescription:
      "Between November 2024 and May 2025, I independently built my first medium-sized application as my final project: a web-based Flash SMS management system for ETPZP, my technical high school in Portugal. Sending, scheduling message delivery, contact management, auto-save drafts, recipient validation, and an admin dashboard with analytics and user rankings were among the most notable features. The final report documents its installation at the school. What began as a high school final project expanded into \"almost a product that I could sell,\" as the jury commented at the end of my presentation.\n\nI built the project in TypeScript using the Next.js framework, with PostgreSQL for the database queried through raw SQL. The platform also supported internationalization with the translations managed on the i18nexus platform from which it fetches the newest translations whenever a server is started.\n\nFor authentication, I integrated the system with the school’s existing authentication solution: an Active Directory server which used LDAP queries via the `activedirectory2` library. After authentication I persist the authenticated state along with some more user data in a secure cookie which expires after 24 hours. I chose the session-based authentication architecture over token-based as I only have one server and session-based was arguably more secure.\n\nThe SMS delivery operates through GatewayAPI’s REST API with costs at around 3-7 cents (EUR) per message. The API permitted me to send, schedule and cancel scheduled messages and even fetch some analytics for the admin dashboard.\n\nOne thing that took a long time was implementing all the error handling and the interactive UI on the new message page. Beyond type-validation, I validated phone numbers using another library prior to any API calls. I also had to handle all API potential error messages and translate them.\n\nDeploying to production was an invaluable learning experience - I self-hosted everything on a local PC, which taught me the foundations of networking and deployment methods. I used Docker Compose for multi-container orchestration, deploying PostgreSQL for the database layer and Nginx as a web server with SSL encryption via Let's Encrypt. I also set up dynamic DNS using No-IP to ensure consistent access despite a dynamic IP address and a redirection to forward network traffic from the router to the machine’s port where the application was running. I also automated database seeding with a retry mechanism that polls the database connection until it's ready.\n\nThe live demo uses dummy sign-in and simulated messaging, so it never sends a real SMS. Please feel free to dive into the project and documentation below.",
    technologies: [
      "Next.js",
      "PostgreSQL",
      "Linux",
      "Docker",
      "GatewayAPI REST API",
    ],

    jobId: "etpzp",

    files: [
      {
        url: "/etpzp_sms/presentation.pdf",
        label: "Presentation (English)",
      },
      {
        url: "/etpzp_sms/apresentação.pdf",
        label: "Apresentação (Português)",
      },
      {
        url: "/etpzp_sms/report.pdf",
        label: "Documentation (English)",
      },
      {
        url: "/etpzp_sms/relatório.pdf",
        label: "Documentação (Português)",
      },
    ],

    videoUrl: "https://www.youtube.com/embed/AMUkiqL2Gew",
    github: [
      {
        url: "https://github.com/devdogfish/etpzp-sms",
        label: "Source Code",
      },
    ],
    deployed: "https://etpzp-sms.demo.girke.dev",
  },
  {
    slug: "workouts-tracker",
    title: "Personal Workouts Tracker",
    year: "2025",
    role: "Web Developer",
    subtitle:
      "Developed a workout tracker with Google Sheets backend to minimize friction in logging exercises and calculating progressive overload.",
    fullDescription:
      "In September 2025, I began developing a workout tracking progressive web application to solve a personal problem: I needed a customized solution for tracking workouts and performing progressive overload calculations that existing apps couldn't provide. My fitness journey started with Google Sheets, but the friction of manually entering data became tedious. I then tried Google Forms, which reduced some friction but still required too many clicks and context switches. That's when I realized: why not build my own form with a laser focus on UX and minimal friction? So I did.\n\nI built the application in React.js using Vite, hosted on Netlify with continuous deployment from GitHub. The architecture uses Google Sheets as the backend database, which still allows me to query, sort, and filter data using familiar spreadsheet functions while providing a proper API for the frontend. This hybrid approach gave me the flexibility of a database with the accessibility of a spreadsheet I could manually inspect or modify when needed.\n\nOn the frontend, I created reusable data fetching hooks for cleaner code and better separation of concerns. One of the most technically interesting features is the workout calculator that automatically computes the workout for a specific day based on progressive overload principles - taking previous performance data and suggesting incremental increases in weight or volume. I also built custom parsers to transform Google Sheets' tabular data into normalized application state, handling validation and formatting edge cases.\n\nFor data mutations, I created multiple server actions using Google Apps Script deployed as web apps. Each script handles a specific operation: creating new workout entries, editing existing data, deleting rows, and performing specialized mutations with validation. To maintain type safety across the application, I automated TypeScript definition generation from the Google Sheets schema, eliminating manual type maintenance and reducing bugs.\n\nThe frontend work involved building intuitive React components with Context API for state management and React Router for navigation. I implemented comprehensive visualizations including sleep quality tracking, progressive overload analysis, exercise history, and estimated one-rep max calculations with interactive charting. The focus was always on reducing friction - every interaction was designed to be as fast and intuitive as possible.\n\nThe code also includes a local queue and sync routine meant for offline logging in gyms with poor connectivity, but the service worker setup is not switched on yet, so offline use is not something I’m claiming today.\n\nThe application is fully customizable for individual workout routines and tracking preferences, making it adaptable to different training methodologies and fitness goals.\n\nPlease feel free to explore the GitHub repository below.",
    technologies: ["React", "PWA", "Google Sheets API", "Google Apps Script"],
    videoUrl: "https://www.youtube.com/embed/8fRNP9-6UUc",
    github: [
      {
        url: "https://github.com/devdogfish/workout-pwa",
        label: "Source Code",
      },
    ],
    deployed: null,
  },
  {
    slug: "jobs",
    title: "Job Search Automation",
    year: "2025",
    role: "Full Stack Developer",
    subtitle:
      "A workflow that collects job listings and prepares tailored résumé and email drafts for me to review.",
    fullDescription:
      "I built this system to solve a real problem: applying to jobs takes forever. If you're a student or anyone searching for work right now, you know how competitive the tech job market is. Writing a custom resume and cover letter for each position can eat up hours of your day. This automation handles all of that while I focus on preparing for interviews.\n\nThe system runs on n8n, a workflow automation platform. It starts by scraping LinkedIn job listings using Apify. Once it has the jobs, it compares them against my existing database in Google Sheets and only adds new ones. For each new job, it calls the Mapbox API to get the exact coordinates so I can display them on an interactive map later.\n\nThe most important workflow runs every few minutes. It grabs one job at a time and first checks if I'm actually eligible based on my experience. Then it hunts for the hiring manager's email. It looks in the job description first, then asks Perplexity to search the web, and finally falls back to Apollo's API if needed. Once it finds an email, the real magic happens.\n\nThe workflow calls my Express API to fetch my base resume in JSON format. An AI model then drafts a cover letter tailored to that specific job description and tweaks my resume to highlight the most relevant experience. The modified JSON gets sent to my PDF endpoint, which generates a clean, professionally formatted resume. The system then creates a draft in my Gmail with everything attached. I like drafts instead of auto-sending because I want to skim each application before it goes out.\n\nOn the backend, I built a Node.js and Express server with a few key endpoints. The main one accepts JSON and returns a beautifully structured PDF resume. There's also an endpoint that fetches data from Google Sheets to keep that information off the client. All routes are protected with hashed API key authentication for security.\n\nThe frontend is a React dashboard built with Vite and shadcn UI components. The centerpiece is a 3D spinning globe powered by Mapbox GL that shows all my job applications scattered across the world. There's also a heat map displaying how many applications I sent each day, and I can click any date to see the full report. The search works across everything - if I type a city name, both the map and the results list update instantly. Clicking a result zooms the globe to that location.\n\nThe result is that I spend my time reviewing drafts instead of writing each one from scratch. Nothing is sent automatically, and every application passes through me first.\n\nAll the code is available on GitHub. Check out the live demo and repositories below. The demo password is \"demo\".",
    technologies: [
      "React",
      "Node.js",
      "Express",
      "n8n",
      "Mapbox GL",
      "Google Sheets API",
      "Apify",
    ],
    videoUrl: "https://www.youtube.com/embed/97MoETKX8SU",
    github: [
      {
        url: "https://github.com/devdogfish/jobs-frontend",
        label: "Frontend",
      },
      {
        url: "https://github.com/devdogfish/jobs-api",
        label: "Backend API",
      },
    ],
    deployed: "https://jobs.demo.girke.dev",
    files: [
      {
        url: "/jobs/workflow.n8n.json",
        label: "n8n Workflow",
      },
    ],
  },
];

export const jobs: Job[] = [
  {
    year: "2026",
    role: "Software Developer Intern, Web Content Developer",
    company: "RBC Capital Markets",
    subtitle:
      "One role on paper under two titles: I publish content across four websites, audited every profile on the public site, and built internal tools for website analytics.",
    slug: "rbc",
  },
  {
    year: "2025–present",
    role: "Full-Stack Developer",
    company: "Young Drivers Academy",
    subtitle:
      "Sole developer of a registration and invoicing app for a Dutch karting school, recently launched and still in active development.",
    slug: "yda",
  },
  {
    year: "2025",
    role: "Full-Stack Developer",
    company: "Apollotec.pt",
    subtitle:
      "Built an email template tool used across the team to replace manual copying from Zoho.",
    slug: "apollotec",
  },
  {
    year: "2024/2025",
    role: "DevOps/Full-Stack Developer",
    company: "ETPZP",
    subtitle:
      "For my high school’s final project, I built a Flash SMS app for staff and deployed it on a school computer.",
    slug: "etpzp",
  },
  {
    year: "2024",
    role: "Frontend, WordPress & Shopify Developer",
    company: "Hope Media House - Vancouver, BC",
    subtitle: "Turned mockups into responsive pages and built WordPress features and Shopify themes for four agency clients.",
    slug: "hmh",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

// Card and case-study cover images in /public/projects.
const withCover = new Set(['rbc-analytics', 'kristina-girke', 'yda-app', 'sitings', 'etpzp-sms', 'jobs', 'workouts-tracker', 'apollotec-emails'])
export const coverFor = (slug: string) => (withCover.has(slug) ? `/projects/${slug}.webp` : undefined)
