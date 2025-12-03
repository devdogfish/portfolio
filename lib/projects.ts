export interface Project {
  slug: string
  title: string
  year: string
  role: string
  description: string
  fullDescription: string
  technologies: string[]
  projectUrl: string
  image?: string
}

export const projects: Project[] = [
  {
    slug: "yda",
    title: "YDA Project",
    year: "2024",
    role: "Full Stack Developer",
    description: "A comprehensive platform for data analytics and visualization.",
    fullDescription:
      "YDA is a full-stack data analytics platform designed to help businesses understand their metrics at a glance. Built with modern technologies, it provides real-time dashboards, custom report generation, and actionable insights into user behavior and performance metrics.",
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    projectUrl: "https://yda-project.com",
  },
  {
    slug: "sitings",
    title: "Sitings Platform",
    year: "2023",
    role: "Frontend Engineer",
    description: "Real estate location analysis and site selection tool.",
    fullDescription:
      "Sitings is a specialized platform for real estate professionals to analyze potential property locations. It integrates mapping data, demographic information, and market analysis to provide comprehensive insights for site selection decisions.",
    technologies: ["React", "MapBox", "TypeScript", "TailwindCSS", "GraphQL"],
    projectUrl: "https://sitings-platform.com",
  },
  {
    slug: "etpzp-sms",
    title: "ETPZP SMS System",
    year: "2023",
    role: "Senior Full Stack Engineer",
    description: "Enterprise messaging platform for business communications.",
    fullDescription:
      "ETPZP SMS is an enterprise-grade SMS messaging system designed for high-volume business communications. It provides reliable message delivery, detailed analytics, and advanced scheduling capabilities for marketing and operational teams.",
    technologies: ["Node.js", "Express", "PostgreSQL", "React", "AWS"],
    projectUrl: "https://etpzp-sms.com",
  },
]

export function getProject(slug: string) {
  console.log("looking for project with slug:", slug);
  
  return projects.find((project) => project.slug === slug)
}
