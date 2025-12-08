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
  description: string;
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
  description: string;
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
    description: "Customer management and go-kart booking system.",
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
    year: "2023",
    role: "Frontend Engineer",
    description: "Real estate location analysis and site selection tool.",
    fullDescription:
      "Sitings is a specialized platform for real estate professionals to analyze potential property locations. It integrates mapping data, demographic information, and market analysis to provide comprehensive insights for site selection decisions.",
    technologies: [
      "Google Maps REST API",
      "PHP",
      "JavaScript",
      "CSS",
      "WordPress ACF",
    ],
    videoUrl: null,
    jobId: "hmh",
    deployed: "https://sitings.ca",
  },
  {
    slug: "apollotec-emails",
    title: "Apollotec Email Management",
    year: "2025",
    role: "Full Stack Developer",
    description: "Custom Zoho CRM integration dashboard.",
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
    description: "Enterprise messaging platform for school communications.",
    fullDescription:
      "An enterprise-grade SMS messaging system designed for high-volume messaging within the school. It provides message scheduling, delivery tracking, template management, and analytics for admins.",
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
    year: "2024",
    role: "Full Stack Developer",
    description: "Track and manage your fitness goals and progress.",
    fullDescription:
      "A personal project designed to track workouts, set fitness goals, and monitor progress over time. Features include workout logging, progress analytics, goal setting, and social sharing capabilities.",
    technologies: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
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
    description:
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
    description:
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
    description:
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
    description: "The internship that got me started with web development.",
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
