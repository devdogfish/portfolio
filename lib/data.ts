export interface PresentationFile {
  language: "en" | "pt";
  url: string;
  label?: string;
}

export interface DocumentationFile {
  language: "en" | "pt";
  url: string;
  label?: string;
}

export interface GithubRepo {
  url: string;
  label: string;
}

export interface DownloadFile {
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
  jobId: string;
  videoUrl: string | null; // YouTube embed URL
  image?: string;
  presentations?: PresentationFile[];
  documentation?: DocumentationFile[];
  github?: GithubRepo[];
  deployed: string | null;
  downloads?: DownloadFile[];
}

export interface Job {
  slug: string;
  year: string;
  role: string;
  company: string;
  subtitle: string;
  fullDescription: string;
  tech: string[];
  projectIds: string[];
  gallery?: string[]; // Array of image URLs (max 3)
  image?: string;
  website: string | null;
}

export const projects: Project[] = [
  {
    slug: "yda-app",
    title: "CRM for Young Drivers Academy",
    year: "2025",
    role: "Full Stack Developer",
    subtitle: "Customer management and go-kart booking system.",
    fullDescription:
      "YDA Web is a sophisticated web-based management system developed as a freelance project for Young Drivers Academy (YDA), a go-karting driving school and youth racing team. The platform streamlines the complete operational lifecycle of the business, from event scheduling and student registration to complex invoicing and financial management, helping YDA manage its dual role as both an educational institution and competitive racing organization. Built as a full-stack Next.js application, it serves three distinct user types—administrators, parents, and young drivers—each with tailored dashboards and role-specific functionality. The system addresses the unique challenges of managing youth motorsport education, including parental consent workflows, age-based grouping, multi-day event scheduling, and transparent financial tracking, all designed to streamline YDA's business administration tasks.\n\nTo support these capabilities, the application leverages a modern technology stack centered around Next.js 16 with the App Router architecture and React 19. The backend relies on PostgreSQL for data persistence, accessed through Prisma ORM with a custom extension that automatically converts Decimal fields to numbers for simplified currency handling. Authentication is handled via NextAuth v4 with a credentials provider, implementing role-based access control across three user types. The platform supports full internationalization using i18next, with Dutch as the default language and English as secondary, encompassing over 16 translation namespaces that cover every domain of the application. The codebase demonstrates strong adherence to TypeScript for type safety, Zod for runtime validation, and follows a clear separation of concerns with dedicated directories for server actions, database queries, components, and utilities.\n\nBuilding on this technical foundation, the system delivers a comprehensive event management module that handles training sessions, races, and workshops. Events can span multiple days and accommodate different age groups (Mini for ages 6-11, Junior for 12-14, and Senior for 15+). The registration workflow involves multiple approval stages, requiring both parental consent and administrative verification before drivers can participate. The invoicing system represents the most complex feature, implementing a multi-stage state machine that progresses through draft, pending approval, approved, and paid statuses. Invoices can contain various line items including event registration fees, service usage charges, and custom cash items, with automatic surcharge calculations for late registrations and specific venues. The balance management system allows parents to maintain account balances through top-ups, with transactions meticulously tracked showing before and after balance states for complete financial transparency.\n\nThese features are accessed through carefully designed role-based workflows that ensure each user sees exactly what they need. Administrators possess comprehensive control over the platform, managing events, users, services, and the entire invoicing pipeline. They can create and edit events, approve registrations, generate invoices, apply manual balance adjustments, and utilize a quick-entry tool for rapid data input during busy operational periods. Parents access a streamlined interface focused on their children's activities, where they can view and approve invoices, manage driver profiles, monitor account balances, and initiate top-ups when funds are needed. The parent role includes the unique ability to approve pending invoices before they're finalized, creating a consent layer for financial commitments. Drivers receive age-appropriate access to view their training calendar, track personal progress, and optionally view invoicing details based on administrator-configured visibility settings. This hierarchical permission model ensures data security and privacy while maintaining appropriate transparency for each stakeholder.\n\nBeyond these core workflows, several technical implementations demonstrate the platform's sophistication. The notification system implements a type-safe architecture requiring coordinated updates across Prisma enums, configuration mappings, and translation files. Notifications support multiple types spanning event management, invoicing, system messages, and guide assignments, with priorities ranging from low to urgent and persistent storage for audit trails. The application employs a consistent server action pattern using specialized error handling utilities that gracefully manage Zod validation failures and unexpected errors, returning structured responses compatible with React's useActionState hook. Currency formatting follows Dutch locale conventions, displaying euros with comma decimal separators, and the system enforces strict usage of shared utility functions like formatEuros, formatDate, and formatNumberNl to maintain consistency across the codebase. The invoice PDF generation integrates with Google Drive for cloud storage, while the reusable table factory pattern eliminates code duplication across admin and parent views. Sequential invoice numbering follows the format INV-2026-001, with automatic year-based sequencing handled by a dedicated generation function that prevents number collisions in concurrent scenarios.",
    technologies: ["TypeScript", "Next.js", "Prisma Postgres", "Tailwind CSS"],
    videoUrl: null,
    jobId: "yda",
    image: "/images/project/yda/3.png",
    deployed: "https://app.yda-kart.com/",
  },
  {
    slug: "sitings",
    title: "Sitings Platform",
    year: "2024",
    role: "Frontend Engineer",
    subtitle: "Real estate location analysis and site selection tool.",
    fullDescription:
      "Sitings is a real estate company, and I contributed to their website by creating features that enable clients to explore property listings through an interactive, user-friendly interface. I completed this project during my internship at HopeMediaHouse, where I was provided with the designs, and my role was to execute them. The platform prominently features a Google Maps integration, displaying properties as clustered pins. This allows users to visually browse locations and utilize a ‘Search in this area’ feature, which dynamically filters listings based on the current map bounds.\n\nBeyond the map, the system includes comprehensive attribute-based filtering—users can narrow down properties by various criteria, with all selections persisting in the URL so filtered views can be shared or bookmarked. The technical foundation relies on PHP and WordPress's ACF plugin to manage custom post types and metadata for properties and tenants, which are then rendered across multiple page templates: a main listings page with all the filters, an individual property page, and a tenant page.\n\nEvery filter state and map position is encoded in the URL parameters, meaning when someone refreshes the page or shares a link, the exact view is preserved and reapplied automatically. I built the frontend using HTML, CSS, and JavaScript alongside PHP templating, which gave me a solid grasp of how these fundamental technologies work together in a real-world application. The project is live at sitings.ca and continues to serve the company's clients in their property search process.",
    technologies: [
      "Google Maps API",
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
    subtitle: "Custom Zoho CRM integration dashboard.",
    fullDescription:
      "Built a custom dashboard that integrates with Zoho CRM, providing real-time data synchronization, custom reporting, and workflow automation. Includes Python backend services for API integration and React frontend with interactive visualizations.",
    technologies: ["Python", "Zoho API", "React.js", "Express"],
    videoUrl: null,
    jobId: "apollotec",
    image: "/images/project/apollotec.jpg",
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
      "In May 2024, I independently completed my first medium-sized application: a web-based Flash SMS management system for ETPZP, my technical high school in Portugal, to replace expensive third-party SMS services. Sending, scheduling message delivery, contact management, auto-save drafts, recipient validation, and an admin dashboard with analytics and user rankings were among the most notable features. The school's staff now uses the system for urgent announcements. What began as a high school final project expanded into \"almost a product that I could sell,\" as the jury commented at the end of my presentation.\n\nI built the project in TypeScript using the Next.js framework, with PostgreSQL for the database queried through raw SQL. The platform also supported internationalization with the translations managed on the i18nexus platform from which it fetches the newest translations whenever a server is started.\n\nFor authentication, I integrated the system with the school’s existing authentication solution: an Active Directory server which used LDAP queries via the `activedirectory2` library. After authentication I persist the authenticated state along with some more user data in a secure cookie which expires after 24 hours. I chose the session-based authentication architecture over token-based as I only have one server and session-based was arguably more secure.\n\nThe SMS delivery operates through GatewayAPI’s REST API with costs at around 3-7 cents (EUR) per message. The API permitted me to send, schedule and cancel scheduled messages and even fetch some analytics for the admin dashboard.\n\nOne thing that took a long time was implementing all the error handling and the interactive UI on the new message page. Beyond type-validation, I validated phone numbers using another library prior to any API calls. I also had to handle all API potential error messages and translate them.\n\nDeploying to production was an invaluable learning experience—I self-hosted everything on a local PC, which taught me the foundations of networking and deployment methods. I used Docker Compose for multi-container orchestration, deploying PostgreSQL for the database layer and Nginx as a web server with SSL encryption via Let's Encrypt. I also set up dynamic DNS using No-IP to ensure consistent access despite a dynamic IP address and a redirection to forward network traffic from the router to the machine’s port where the application was running. I also automated database seeding with a retry mechanism that polls the database connection until it's ready.\n\nPlease feel free to dive into the project and documentation below.",
    technologies: [
      "Next.js",
      "PostgreSQL",
      "Linux",
      "Docker",
      "GatewayAPI REST API",
    ],

    jobId: "etpzp-sms",
    image: "/images/project/etpzp-sms.jpg",

    presentations: [
      {
        language: "en",
        url: "/etpzp_sms/presentation.pdf",
        label: "Presentation (English)",
      },
      {
        language: "pt",
        url: "/etpzp_sms/apresentação.pdf",
        label: "Apresentação (Português)",
      },
    ],
    documentation: [
      {
        language: "en",
        url: "/etpzp_sms/report.pdf",
        label: "Documentation (English)",
      },
      {
        language: "pt",
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
    deployed: "https://etpzp-sms-demo.luigigirke.com",
  },
  {
    slug: "workouts-tracker",
    title: "Personal Workouts Tracker",
    year: "2025",
    role: "Web Developer",
    subtitle:
      "Developed a workout tracker with Google Sheets backend to minimize friction in logging exercises and calculating progressive overload.",
    fullDescription:
      "In September 2025, I began developing a workout tracking progressive web application to solve a personal problem: I needed a customized solution for tracking workouts and performing progressive overload calculations that existing apps couldn't provide. My fitness journey started with Google Sheets, but the friction of manually entering data became tedious. I then tried Google Forms, which reduced some friction but still required too many clicks and context switches. That's when I realized: why not build my own form with a laser focus on UX and minimal friction? So I did.\n\nI built the application in React.js using Vite, hosted on Netlify with continuous deployment from GitHub. The architecture uses Google Sheets as the backend database, which still allows me to query, sort, and filter data using familiar spreadsheet functions while providing a proper API for the frontend. This hybrid approach gave me the flexibility of a database with the accessibility of a spreadsheet I could manually inspect or modify when needed.\n\nOn the frontend, I created reusable data fetching hooks for cleaner code and better separation of concerns. One of the most technically interesting features is the workout calculator that automatically computes the workout for a specific day based on progressive overload principles—taking previous performance data and suggesting incremental increases in weight or volume. I also built custom parsers to transform Google Sheets' tabular data into normalized application state, handling validation and formatting edge cases.\n\nFor data mutations, I created multiple server actions using Google Apps Script deployed as web apps. Each script handles a specific operation: creating new workout entries, editing existing data, deleting rows, and performing specialized mutations with validation. To maintain type safety across the application, I automated TypeScript definition generation from the Google Sheets schema, eliminating manual type maintenance and reducing bugs.\n\nThe frontend work involved building intuitive React components with Context API for state management and React Router for navigation. I implemented comprehensive visualizations including sleep quality tracking, progressive overload analysis, exercise history, and estimated one-rep max calculations with interactive charting. The focus was always on reducing friction—every interaction was designed to be as fast and intuitive as possible.\n\nCurrently, I'm implementing PWA features with a service worker and local storage queue. This will enable offline workout logging—critical for gym environments with poor connectivity. When the device regains internet access, queued workouts will automatically sync to Google Sheets, ensuring no data loss while maintaining the seamless user experience.\n\nThe application is fully customizable for individual workout routines and tracking preferences, making it adaptable to different training methodologies and fitness goals.\n\nPlease feel free to explore the GitHub repository below.",
    technologies: ["React", "PWA", "Google Sheets API", "Google Apps Script"],
    videoUrl: "https://www.youtube.com/embed/8fRNP9-6UUc",
    jobId: "personal",
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
      "AI-powered pipeline that scrapes jobs, generates tailored resumes, and drafts personalized emails while I sleep.",
    fullDescription:
      "I built this system to solve a real problem: applying to jobs takes forever. If you're a student or anyone searching for work right now, you know how competitive the tech job market is. Writing a custom resume and cover letter for each position can eat up hours of your day. This automation handles all of that while I focus on preparing for interviews.\n\nThe system runs on n8n, a workflow automation platform. It starts by scraping LinkedIn job listings using Apify. Once it has the jobs, it compares them against my existing database in Google Sheets and only adds new ones. For each new job, it calls the Mapbox API to get the exact coordinates so I can display them on an interactive map later.\n\nThe most important workflow runs every few minutes. It grabs one job at a time and first checks if I'm actually eligible based on my experience. Then it hunts for the hiring manager's email. It looks in the job description first, then asks Perplexity to search the web, and finally falls back to Apollo's API if needed. Once it finds an email, the real magic happens.\n\nThe workflow calls my Express API to fetch my base resume in JSON format. An AI model then drafts a cover letter tailored to that specific job description and tweaks my resume to highlight the most relevant experience. The modified JSON gets sent to my PDF endpoint, which generates a clean, professionally formatted resume. The system then creates a draft in my Gmail with everything attached. I like drafts instead of auto-sending because I want to skim each application before it goes out.\n\nOn the backend, I built a Node.js and Express server with a few key endpoints. The main one accepts JSON and returns a beautifully structured PDF resume. There's also an endpoint that fetches data from Google Sheets to keep that information off the client. All routes are protected with hashed API key authentication for security.\n\nThe frontend is a React dashboard built with Vite and shadcn UI components. The centerpiece is a 3D spinning globe powered by Mapbox GL that shows all my job applications scattered across the world. There's also a heat map displaying how many applications I sent each day, and I can click any date to see the full report. The search works across everything—if I type a city name, both the map and the results list update instantly. Clicking a result zooms the globe to that location.\n\nThe result is unlimited high-quality, tailored applications. What used to take me hours of manual work now takes about five minutes to review. This is exactly where AI shines—handling repetitive tasks so I can focus on what actually matters.\n\nAll the code is available on GitHub. Check out the live demo and repositories below. The demo password is \"demo\".",
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
    jobId: "personal",
    github: [
      {
        url: "https://github.com/devdogfish/jobs-frontend",
        label: "Frontend",
      },
      {
        url: "https://github.com/devdogfish/n8n-custom-api",
        label: "Backend API",
      },
    ],
    deployed: "https://jobs-demo.luigigirke.com",
    downloads: [
      {
        url: "/jobs/workflow.n8n.json",
        label: "n8n Workflow",
      },
    ],
  },
];

export const jobs: Job[] = [
  {
    year: "2025",
    role: "Full-Stack Developer",
    company: "Young Drivers Academy",
    subtitle:
      "Solely developing a large customer-management app for YDA, a Netherlands-based go-karting company.",
    fullDescription:
      "At Young Drivers Academy, I developed a comprehensive customer management application that handles event registrations, invoicing, customer profiles, and more This was a solo full-stack project where I built the entire system from the ground up, implementing real-time updates, complex scheduling logic, and an intuitive user interface for both staff and customers.",
    tech: ["TypeScript", "Next.js", "Prisma"],
    projectIds: ["yda-app"],
    slug: "yda",
    image: "/logos/yda.png",
    gallery: ["/images/yda-1.png", "/images/yda-2.png", "/images/yda-3.png"],
    website: null,
  },
  {
    year: "2025",
    role: "Full-Stack Developer",
    company: "Apollotec.pt",
    subtitle:
      "Built custom integrations with Zoho CRM to automate business email-template workflows.",
    fullDescription:
      "I worked on integrating Zoho CRM with custom React dashboards and Python backend services. This involved building API connectors, automating data synchronization, and creating intuitive interfaces for business process automation.",
    tech: ["Python", "Zoho API", "React.js"],
    projectIds: ["apollotec-emails"],
    slug: "apollotec",
    image: "/logos/apollotec.svg",
    gallery: ["/images/apollotec-1.jpg", "/images/apollotec-2.jpg"],
    website: "https://apollotec.pt/en/",
  },
  {
    year: "2024/2025",
    role: "DevOps/Full-Stack Developer",
    company: "ETPZP",
    subtitle:
      "For my high school, I developed an internal Flash SMS messaging app that is actively used.",
    fullDescription:
      "ETPZP is an SMS messaging system I built for internal school communications. It features real-time message delivery, scheduling capabilities, and detailed analytics. The infrastructure is deployed on Linux servers with Next.js frontend and PostgreSQL backend.",
    tech: ["Linux", "Next.js", "PostgreSQL", "Docker", "GatewayApi REST API"],
    projectIds: ["etpzp-sms"],
    slug: "etpzp",
    image: "/logos/etpzp.jpg",
    gallery: [
      "/images/etpzp-1.jpg",
      "/images/etpzp-2.jpg",
      "/images/etpzp-3.jpg",
    ],
    website: "https://etpzp.pt",
  },
  {
    year: "2024",
    role: "Frontend/WordPress Developer",
    company: "Hope Media House - Vancouver, BC",
    subtitle: "The internship that got me started with web development.",
    fullDescription:
      "My first professional experience, working on WordPress-based projects and custom PHP integrations. I learned the fundamentals of web development, client communication, and delivering quality-assured work under deadline.",
    tech: [
      "PHP",
      "Google Maps API",
      "JavaScript",
      "WordPress",
      "FileZilla & SSH",
    ],
    projectIds: ["hmh"],
    slug: "hmh",
    image: "/logos/hmh-sm.png",
    gallery: ["/images/hmh-1.jpg", "/images/hmh-2.jpg"],
    website: "https://hopemediahouse.ca",
  },
];

export function getJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectsByJobId(jobId: string): Project[] {
  return projects.filter((project) => project.jobId === jobId);
}

export function getJobIdByProjectId(projectId: string): string | undefined {
  const project = projects.find((p) => p.slug === projectId);
  return project?.jobId;
}

export const YDA_TECH = ["TypeScript", "Next.js", "Prisma"];
