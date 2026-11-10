import type { ProfileId } from "@/lib/profiles";

type EmployerProfileId = Exclude<ProfileId, "default" | "client">;

type PortfolioContent = {
  headline: string;
  description: string;
  projects: string[];
  feature: { label: string; value: string; description: string };
  evidence?: Partial<Record<string, string>>;
};

type EmployerContent = PortfolioContent & {
  skills: { title: string; tools: string }[];
  jobs: string[];
  roleAtRbc: string;
  rbcSummary: string;
};

export const defaultContent: PortfolioContent = {
  headline: "Software, websites, and the work behind them.",
  description: "I’m Luigi Girke, a software developer in Halifax. I build web applications, client websites, and tools that make day-to-day work easier.",
  projects: ["rbc-analytics", "yda-app", "kristina-girke", "sitings", "etpzp-sms"],
  feature: { label: "RBC Capital Markets", value: "3,500", description: "pages captured in one recent scan by a crawler I built for an internal website analytics platform." },
};

export const clientContent: PortfolioContent = {
  headline: "Websites and tools built around how you work.",
  description: "I’m Luigi, an independent developer in Halifax. I build custom websites that present your work clearly and business tools that make running it easier. You work directly with the person building it.",
  projects: ["kristina-girke", "yda-app", "sitings", "apollotec-emails", "rbc-analytics"],
  feature: { label: "Selected client work", value: "Kristina Girke", description: "An artist’s website built around painting series and exhibitions, with a CMS for updating the work." },
  evidence: {
    "yda-app": "Online signups, customer records, and invoicing for a Dutch karting school, all in one place.",
    "sitings": "A live property map with filters and shareable searches, built at Hope Media House.",
    "apollotec-emails": "A tool that fills employee details from Zoho, replacing manual copying for a nine-person team.",
    "rbc-analytics": "An example of putting AI inside an existing workflow so staff can ask questions about website data and create records.",
  },
};

export const employerContent: Record<EmployerProfileId, EmployerContent> = {
  software: {
    headline: "Software engineering from first build to deployment.",
    description: "I’m Luigi Girke, a software developer at RBC Capital Markets and a computer science student at Dalhousie. I build TypeScript applications, integrate APIs, and ship tools people use at work.",
    feature: { label: "RBC Capital Markets", value: "Under 1 hour", description: "to find website content using a crawler I built. Some searches previously took hours or days." },
    projects: ["rbc-analytics", "yda-app", "etpzp-sms", "apollotec-emails", "sitings"],
    evidence: {
      "rbc-analytics": "Built a Playwright crawler and a visual review tool with accessibility, SEO, and performance findings overlaid on each page.",
      "yda-app": "Launched a Next.js and Prisma signup and invoicing app as the sole developer, with CI/CD across three environments.",
      "etpzp-sms": "Built and self-hosted a bilingual messaging system with scheduled SMS, PostgreSQL, and Active Directory sign-in.",
    },
    skills: [
      { title: "Applications", tools: "TypeScript, React, Next.js, Python, FastAPI, Node.js" },
      { title: "Data & testing", tools: "PostgreSQL, SQLite, Prisma, Playwright, unit testing" },
      { title: "Delivery & integration", tools: "GitHub Actions, Docker, Nginx, REST APIs, MCP" },
    ],
    jobs: ["rbc", "yda", "apollotec", "etpzp", "hmh"],
    roleAtRbc: "Software Developer Intern",
    rbcSummary: "Shipped the first version of an internal marketing and website platform to the test environment in two weeks. Wrote unit tests and reviewed pull requests on a separate client-onboarding app.",
  },
  "web-cms": {
    headline: "Web development and CMS publishing.",
    description: "I’m Luigi Girke. At RBC Capital Markets, I’ve published content across four websites and built features in OpenText TeamSite. My agency work includes WordPress features and Shopify themes.",
    feature: { label: "RBC Capital Markets", value: "≈60 articles", description: "published or updated in OpenText TeamSite in my first three months." },
    projects: ["sitings", "rbc-analytics", "kristina-girke", "yda-app"],
    evidence: {
      "sitings": "Turned agency designs into a WordPress property map with custom post types, ACF, grouped markers, and AJAX filters.",
      "rbc-analytics": "Built a visual page review tool that pinpoints accessibility, SEO, and performance findings.",
      "kristina-girke": "Built an artist portfolio around painting series and exhibitions, with Sanity for content editing.",
    },
    skills: [
      { title: "Publishing", tools: "OpenText TeamSite, WordPress, Advanced Custom Fields, Shopify, Sanity" },
      { title: "Frontend", tools: "HTML, CSS, JavaScript, PHP, XML, XSL" },
      { title: "Website checks", tools: "axe-core, Lighthouse, SEO metadata, content migration" },
    ],
    jobs: ["rbc", "hmh", "yda", "apollotec", "etpzp"],
    roleAtRbc: "Web Content Developer",
    rbcSummary: "Handled roughly 10 website change requests per day, tracked them in Asana, and built XSL components to pull TeamSite content records automatically.",
  },
  "admin-excel": {
    headline: "Excel tracking, records, and web operations.",
    description: "I’m Luigi Girke. At RBC Capital Markets, I’ve maintained Excel trackers for Marketing, handled requests from a shared inbox, and turned website records into data people could work with.",
    feature: { label: "RBC Capital Markets", value: "≈800 profiles", description: "tracked in Excel for Marketing as part of a website profile removal project." },
    projects: ["rbc-analytics", "apollotec-emails", "yda-app", "workouts-tracker"],
    evidence: {
      "rbc-analytics": "Turned website profile data into Excel, CSV, and JSON files for tracking and reporting.",
      "apollotec-emails": "Replaced manual copying with an email template tool that pulls employee details and job titles from Zoho.",
      "yda-app": "Replaced manual event registration records with online signups and organized invoice PDFs in Google Drive.",
      "workouts-tracker": "Built a personal logging tool using Google Sheets for records and Apps Script for validated updates.",
    },
    skills: [
      { title: "Spreadsheets", tools: "Excel, Google Sheets, XLOOKUP, VLOOKUP, data validation, conditional formatting" },
      { title: "Records & reporting", tools: "CSV, JSON, Google Drive, Excel trackers" },
      { title: "Request handling", tools: "Asana, shared inboxes, OpenText TeamSite" },
    ],
    jobs: ["rbc", "apollotec", "yda", "hmh", "etpzp"],
    roleAtRbc: "Web Content Developer",
    rbcSummary: "Managed change requests from the team’s shared inbox, maintained Excel records for Marketing, and tracked work through review in Asana.",
  },
};

export const clientServices = [
  { title: "Custom websites", description: "A site that makes your work easy to understand and gives you control over everyday edits. I design, build, and check it across screen sizes before launch." },
  { title: "Custom business tools", description: "Give signups, invoicing, or reporting a home of their own. I build around the way your team already works and connect the tools you rely on." },
  { title: "AI enablement", description: "Start with one task where AI could save time, such as looking up information or drafting a response. I build it into your workflow and check how it performs with real examples." },
];

export const clientProcess = [
  { title: "Talk through the work", description: "We look at what you have, what’s getting in the way, and what a useful first release would cover." },
  { title: "Review a working version", description: "You try the important pages or workflows early, while there’s still time to change them." },
  { title: "Test and hand over", description: "I check the finished work before launch and show you how to manage it yourself." },
];
