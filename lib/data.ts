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
  github?: string;
  deployed?: string;
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
      "A comprehensive customer management platform for Young Drivers Academy that handles booking reservations, customer profiles, and go-kart scheduling. Features include real-time availability updates, multi-location support, customer communication tools, and administrative dashboards for staff management.",
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
    // deployed: null,
  },
  {
    slug: "etpzp-sms",
    title: "ETPZP SMS System",
    year: "2024/2025",
    role: "DevOps/Full Stack Developer",
    subtitle: "Enterprise messaging platform for school communications.",
    fullDescription:
      "In May 2024, I independently completed my first medium-sized application: a web-based flash SMS management system for ETPZP, my technical high school in Portugal, to replace expensive third-party SMS services. Sending, scheduling message delivery, contact management, auto-save drafts, recipient validation, and an admin dashboard with analytics and user rankings were among the most notable features. The school's staff now uses the system for urgent announcements. What began as a high school final project expanded into \"almost a product that I could sell,\" as the jury commented at the end of my presentation.\n\nI built the project in TypeScript using the Next.js framework, with PostgreSQL for the database queried through raw SQL. The platform also supported internationalization with the translations managed on the i18nexus platform from which it fetches the newest translations whenever a server is started.\n\nFor authentication, I integrated the system with the school’s existing authentication solution: an Active Directory server which used LDAP queries via the `activedirectory2` library. After authentication I persist the authenticated state along with some more user data in a secure cookie which expires after 24 hours. I chose the session-based authentication architecture over token-based as I only have one server and session-based was arguably more secure.\n\nThe SMS delivery operates through GatewayAPI’s REST API with costs at around 3-7 cents (EUR) per message. The API permitted me to send, schedule and cancel scheduled messages and even fetch some analytics for the admin dashboard.\n\nOne thing that took a long time was implementing all the error handling and the interactive UI on the new message page. Beyond type-validation, I validated phone numbers using another library prior to any API calls. I also had to handle all API potential error messages and translate them.\n\nDeploying to production was an invaluable learning experience—I self-hosted everything on a local PC, which taught me the foundations of networking and deployment methods. I used Docker Compose for multi-container orchestration, deploying PostgreSQL for the database layer and Nginx as a web server with SSL encryption via Let's Encrypt. I also set up dynamic DNS using No-IP to ensure consistent access despite a dynamic IP address and a redirection to forward network traffic from the router to the machine’s port where the application was running. I also automated database seeding with a retry mechanism that polls the database connection until it's ready.\n\nPlease feel free to dive into the project and documentation below.",
    technologies: ["Next.js", "PostgreSQL", "Linux"],
    videoUrl: "https://www.youtube.com/embed/AMUkiqL2Gew",
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
    github: "https://github.com/devdogfish/etpzp-sms",
    deployed: "https://etpzp-sms-three.vercel.app/",
  },
  {
    slug: "workouts-tracker",
    title: "Personal Workouts Tracker",
    year: "2025",
    role: "Web Developer",
    subtitle: "Track and manage your fitness goals and progress.",
    fullDescription:
      "A personal project designed to track workouts, set fitness goals, and monitor progress over time. Features include workout logging, progress analytics, goal setting, and social sharing capabilities.",
    technologies: [
      "React",
      "Node.js",
      "Google Sheets API",
      "Google Apps Script",
    ],
    videoUrl: null,
    jobId: "personal",
    deployed: "https://luigifit.netlify.app",
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
      "At Young Drivers Academy, I developed a comprehensive customer management application that handles bookings, customer profiles, and go-kart scheduling. This was a solo full-stack project where I built the entire system from the ground up, implementing real-time updates, complex scheduling logic, and an intuitive user interface for both staff and customers.",
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
      "For my high school, I developed an internal flash-SMS messaging app that is actively used.",
    fullDescription:
      "ETPZP is an SMS messaging system I built for internal school communications. It features real-time message delivery, scheduling capabilities, and detailed analytics. The infrastructure is deployed on Linux servers with Next.js frontend and PostgreSQL backend.",
    tech: ["Linux", "Next.js", "PostgreSQL"],
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
