export interface Project {
  slug: string;
  title: string;
  year: string;
  role: string;
  description: string;
  fullDescription: string;
  technologies: string[];
  projectUrl: string;
  jobId: string; // Which job this project belongs to
  image?: string;
}

export interface Job {
  slug: string;
  year: string;
  role: string;
  company: string;
  description: string;
  fullDescription: string;
  tech: string[];
  projectIds: string[]; // List of project slugs
  image?: string;
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
    projectUrl: "https://app.yda-kart.com/",
    jobId: "yda",
    image: "/images/project/yda/3.png",
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
    jobId: "hmh",
    projectUrl: "https://sitings-platform.com",
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
    projectUrl: "https://apollotec.pt/en/", // this one is unavailable because it is an internal tool - instead I just put the website of the company
    jobId: "apollotec",
    image: "/images/project/apollotec.jpg",
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
    projectUrl: "https://etpzp-sms.example.com",
    jobId: "etpzp-sms",
    image: "/images/project/etpzp-sms.jpg",
  },
  {
    slug: "hmh",
    title: "Hope Media House",
    year: "2024",
    role: "Frontend/WordPress Developer",
    description: "WordPress-based marketing website.",
    fullDescription:
      "A WordPress-based website for Hope Media House featuring custom PHP plugins, JavaScript interactions, and responsive design. This was my first professional project that taught me the fundamentals of web development and client communication.",
    technologies: ["WordPress", "PHP", "JavaScript", "SSH"],
    projectUrl: "https://hopemediahouse.ca",
    jobId: "hmh",
    image: "/images/project/hope-media.jpg",
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
    projectIds: ["yda-app"], // Links to projects
    slug: "yda",
    image: "/images/yda.jpg",
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
    projectIds: ["apollotec-dashboard"],
    slug: "apollotec",
    image: "/images/apollotec.jpg",
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
    projectIds: ["etpzp-sms", "etpzp-dashboard"],
    slug: "etpzp-sms",
    image: "/images/etpzp.jpg",
  },
  {
    year: "2024",
    role: "Frontend/WordPress Developer",
    company: "Hope Media House",
    description: "The internship that got me started with web development.",
    fullDescription:
      "My first professional experience, working on WordPress-based projects and custom PHP integrations. I learned the fundamentals of web development, client communication, and delivering high-quality work under deadline.",
    tech: ["PHP", "JavaScript", "WordPress"],
    projectIds: ["hope-media-site"],
    slug: "hmh",
    image: "/images/hmh.jpg",
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
