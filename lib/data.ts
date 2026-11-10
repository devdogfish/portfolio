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
    slug: "rbc-analytics",
    title: "RBC Website Analytics",
    year: "2026",
    role: "Software Developer Intern",
    subtitle: "An internal platform for finding website content and reviewing accessibility, SEO, and performance issues.",
    fullDescription:
      "I built an internal website and marketing platform at RBC Capital Markets. A Playwright crawler saves server-rendered HTML, browser-rendered HTML, and page assets so teams can search past scans and compare changed pages. One scan covered 3,500 pages, and the tool cut content searches from hours or days to under an hour.\n\nThe platform reconstructs each page and marks axe-core and Lighthouse findings on the affected elements. I also built an assistant connected to the company’s AI gateway to answer questions about the platform’s data and create records. Separate from the crawler, I turned website profile records into Excel, CSV, and JSON files and maintained trackers for Marketing covering roughly 800 profiles marked for removal.",
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
      "I built Kristina Girke’s website around her painting series and exhibitions. Visitors can browse bodies of work, view individual paintings, and explore the exhibition timeline. I used Next.js for the website and Sanity for content editing, so the artist can update artwork and exhibitions from a studio interface.",
    technologies: ["Next.js", "Sanity"],
    videoUrl: null,
    jobId: "personal",
    deployed: "https://kristinagirke.com",
  },
  {
    slug: "yda-app",
    title: "CRM for Young Drivers Academy",
    year: "2025–26",
    role: "Full Stack Developer",
    subtitle: "Customer management and go-kart booking system.",
    fullDescription:
      "I built and launched a signup and invoicing app as the sole developer for Young Drivers Academy, a Dutch go-karting school. The app replaced manual registration records and gives staff a way to see who’s attending, which mechanics are needed, and what parts to bring. It has around 50 active users across four account types: parents, drivers, mechanics, and administrators.\n\nEvent signups feed into an invoice creation and approval workflow. The app generates invoice PDFs, stores them in Google Drive, and sends app emails through Resend. I built the app with TypeScript, Next.js, and Prisma, and set up a GitHub Actions deployment pipeline for development, test, and live environments.",
    technologies: ["TypeScript", "Next.js", "Prisma Postgres", "Tailwind CSS"],
    videoUrl: null,
    jobId: "yda",
    image: "/images/yda-3.png",
    deployed: "https://app.yda-kart.com/",
  },
  {
    slug: "sitings",
    title: "Sitings Platform",
    year: "2024",
    role: "Frontend Engineer",
    subtitle: "Real estate location analysis and site selection tool.",
    fullDescription:
      "Sitings is a real estate company, and I contributed to their website by creating features that enable clients to explore property listings through an interactive, user-friendly interface. I completed this project during my internship at HopeMediaHouse, where I was provided with the designs, and my role was to execute them. The platform prominently features a Google Maps integration, displaying properties as clustered pins. This allows users to visually browse locations and utilize a ‘Search in this area’ feature, which dynamically filters listings based on the current map bounds.\n\nBeyond the map, the system includes comprehensive attribute-based filtering - users can narrow down properties by various criteria, with all selections persisting in the URL so filtered views can be shared or bookmarked. The technical foundation relies on PHP and WordPress's ACF plugin to manage custom post types and metadata for properties and tenants, which are then rendered across multiple page templates: a main listings page with all the filters, an individual property page, and a tenant page.\n\nEvery filter state and map position is encoded in the URL parameters, meaning when someone refreshes the page or shares a link, the exact view is preserved and reapplied automatically. I built the frontend using HTML, CSS, and JavaScript alongside PHP templating, which gave me a solid grasp of how these fundamental technologies work together in a real-world application. The project is live at sitings.ca and continues to serve the company's clients in their property search process.",
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
    subtitle: "An email template tool that fills employee details and job titles from Zoho.",
    fullDescription:
      "I independently built and launched an email template app for Apollotec’s nine-person team. The app pulls employee details and job titles from the Zoho API to fill in templates and replace manual copying.",
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
      "In May 2024, I independently completed my first medium-sized application: a web-based Flash SMS management system for ETPZP, my technical high school in Portugal, to replace expensive third-party SMS services. Sending, scheduling message delivery, contact management, auto-save drafts, recipient validation, and an admin dashboard with analytics and user rankings were among the most notable features. The school's staff now uses the system for urgent announcements. What began as a high school final project expanded into \"almost a product that I could sell,\" as the jury commented at the end of my presentation.\n\nI built the project in TypeScript using the Next.js framework, with PostgreSQL for the database queried through raw SQL. The platform also supported internationalization with the translations managed on the i18nexus platform from which it fetches the newest translations whenever a server is started.\n\nFor authentication, I integrated the system with the school’s existing authentication solution: an Active Directory server which used LDAP queries via the `activedirectory2` library. After authentication I persist the authenticated state along with some more user data in a secure cookie which expires after 24 hours. I chose the session-based authentication architecture over token-based as I only have one server and session-based was arguably more secure.\n\nThe SMS delivery operates through GatewayAPI’s REST API with costs at around 3-7 cents (EUR) per message. The API permitted me to send, schedule and cancel scheduled messages and even fetch some analytics for the admin dashboard.\n\nOne thing that took a long time was implementing all the error handling and the interactive UI on the new message page. Beyond type-validation, I validated phone numbers using another library prior to any API calls. I also had to handle all API potential error messages and translate them.\n\nDeploying to production was an invaluable learning experience - I self-hosted everything on a local PC, which taught me the foundations of networking and deployment methods. I used Docker Compose for multi-container orchestration, deploying PostgreSQL for the database layer and Nginx as a web server with SSL encryption via Let's Encrypt. I also set up dynamic DNS using No-IP to ensure consistent access despite a dynamic IP address and a redirection to forward network traffic from the router to the machine’s port where the application was running. I also automated database seeding with a retry mechanism that polls the database connection until it's ready.\n\nPlease feel free to dive into the project and documentation below.",
    technologies: [
      "Next.js",
      "PostgreSQL",
      "Linux",
      "Docker",
      "GatewayAPI REST API",
    ],

    jobId: "etpzp-sms",

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
      "In September 2025, I began developing a workout tracking progressive web application to solve a personal problem: I needed a customized solution for tracking workouts and performing progressive overload calculations that existing apps couldn't provide. My fitness journey started with Google Sheets, but the friction of manually entering data became tedious. I then tried Google Forms, which reduced some friction but still required too many clicks and context switches. That's when I realized: why not build my own form with a laser focus on UX and minimal friction? So I did.\n\nI built the application in React.js using Vite, hosted on Netlify with continuous deployment from GitHub. The architecture uses Google Sheets as the backend database, which still allows me to query, sort, and filter data using familiar spreadsheet functions while providing a proper API for the frontend. This hybrid approach gave me the flexibility of a database with the accessibility of a spreadsheet I could manually inspect or modify when needed.\n\nOn the frontend, I created reusable data fetching hooks for cleaner code and better separation of concerns. One of the most technically interesting features is the workout calculator that automatically computes the workout for a specific day based on progressive overload principles - taking previous performance data and suggesting incremental increases in weight or volume. I also built custom parsers to transform Google Sheets' tabular data into normalized application state, handling validation and formatting edge cases.\n\nFor data mutations, I created multiple server actions using Google Apps Script deployed as web apps. Each script handles a specific operation: creating new workout entries, editing existing data, deleting rows, and performing specialized mutations with validation. To maintain type safety across the application, I automated TypeScript definition generation from the Google Sheets schema, eliminating manual type maintenance and reducing bugs.\n\nThe frontend work involved building intuitive React components with Context API for state management and React Router for navigation. I implemented comprehensive visualizations including sleep quality tracking, progressive overload analysis, exercise history, and estimated one-rep max calculations with interactive charting. The focus was always on reducing friction - every interaction was designed to be as fast and intuitive as possible.\n\nCurrently, I'm implementing PWA features with a service worker and local storage queue. This will enable offline workout logging - critical for gym environments with poor connectivity. When the device regains internet access, queued workouts will automatically sync to Google Sheets, ensuring no data loss while maintaining the seamless user experience.\n\nThe application is fully customizable for individual workout routines and tracking preferences, making it adaptable to different training methodologies and fitness goals.\n\nPlease feel free to explore the GitHub repository below.",
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
      "I built this system to solve a real problem: applying to jobs takes forever. If you're a student or anyone searching for work right now, you know how competitive the tech job market is. Writing a custom resume and cover letter for each position can eat up hours of your day. This automation handles all of that while I focus on preparing for interviews.\n\nThe system runs on n8n, a workflow automation platform. It starts by scraping LinkedIn job listings using Apify. Once it has the jobs, it compares them against my existing database in Google Sheets and only adds new ones. For each new job, it calls the Mapbox API to get the exact coordinates so I can display them on an interactive map later.\n\nThe most important workflow runs every few minutes. It grabs one job at a time and first checks if I'm actually eligible based on my experience. Then it hunts for the hiring manager's email. It looks in the job description first, then asks Perplexity to search the web, and finally falls back to Apollo's API if needed. Once it finds an email, the real magic happens.\n\nThe workflow calls my Express API to fetch my base resume in JSON format. An AI model then drafts a cover letter tailored to that specific job description and tweaks my resume to highlight the most relevant experience. The modified JSON gets sent to my PDF endpoint, which generates a clean, professionally formatted resume. The system then creates a draft in my Gmail with everything attached. I like drafts instead of auto-sending because I want to skim each application before it goes out.\n\nOn the backend, I built a Node.js and Express server with a few key endpoints. The main one accepts JSON and returns a beautifully structured PDF resume. There's also an endpoint that fetches data from Google Sheets to keep that information off the client. All routes are protected with hashed API key authentication for security.\n\nThe frontend is a React dashboard built with Vite and shadcn UI components. The centerpiece is a 3D spinning globe powered by Mapbox GL that shows all my job applications scattered across the world. There's also a heat map displaying how many applications I sent each day, and I can click any date to see the full report. The search works across everything - if I type a city name, both the map and the results list update instantly. Clicking a result zooms the globe to that location.\n\nThe result is unlimited high-quality, tailored applications. What used to take me hours of manual work now takes about five minutes to review. This is exactly where AI shines - handling repetitive tasks so I can focus on what actually matters.\n\nAll the code is available on GitHub. Check out the live demo and repositories below. The demo password is \"demo\".",
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
        url: "https://github.com/devdogfish/jobs-api",
        label: "Backend API",
      },
    ],
    deployed: "https://jobs.demo.girke.dev",
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
    year: "2026",
    role: "Software Developer Intern",
    company: "RBC Capital Markets",
    subtitle:
      "Published content across four websites, then built internal tools for website analytics and operations.",
    fullDescription:
      "I work in Digital Technologies within Quantitative Technology Services at RBC Capital Markets. In my first three months I published or updated roughly 60 articles in OpenText TeamSite, handled about 10 website change requests a day, and built Excel trackers for Marketing. I then built an internal website and marketing platform, putting the first version into the test environment in two weeks. I also wrote front- and back-end unit tests and reviewed pull requests on a separate client-onboarding app.",
    tech: ["TypeScript", "React", "FastAPI", "OpenText TeamSite", "Excel"],
    projectIds: ["rbc-analytics"],
    slug: "rbc",
    gallery: [],
    website: "https://www.rbccm.com",
  },
  {
    year: "2025–26",
    role: "Full-Stack Developer",
    company: "Young Drivers Academy",
    subtitle:
      "Built and launched a registration and invoicing app for a Dutch karting school as the sole developer.",
    fullDescription:
      "I built a customer management app for Young Drivers Academy that replaced manual signup records, organized participant data, and connected event registration with invoice creation and approval. Around 50 active users access the app across four account types: parents, drivers, mechanics, and administrators.",
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
      "Built an email template tool used across the nine-person company to replace manual copying from Zoho.",
    fullDescription:
      "I independently built a React and Express app that fills email templates with employee details and job titles from Zoho.",
    tech: ["Express", "Zoho API", "React"],
    projectIds: ["apollotec-emails"],
    slug: "apollotec",
    image: "/logos/apollotec.svg",
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
    website: "https://etpzp.pt",
  },
  {
    year: "2024",
    role: "Frontend, WordPress & Shopify Developer",
    company: "Hope Media House - Vancouver, BC",
    subtitle: "Turned mockups into responsive pages and built WordPress features and Shopify themes for four agency clients.",
    fullDescription:
      "I built WordPress features and Shopify themes for Baden, Beautifi, DonChendo, and Sitings. For Sitings I built an interactive property map using WordPress custom post types, Advanced Custom Fields, Google Maps, and AJAX.",
    tech: [
      "PHP",
      "Google Maps API",
      "JavaScript",
      "WordPress",
      "FileZilla & SSH",
    ],
    projectIds: ["sitings"],
    slug: "hmh",
    image: "/logos/hmh-sm.png",
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
