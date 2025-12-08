import { getProject, projects, getJobIdByProjectId, getJob } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ParentJobCard } from "@/components/parent-job";
import { Footer } from "@/components/shared";

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const jobId = getJobIdByProjectId(slug);
  const parentJob = jobId ? getJob(jobId) : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Header with back button */}
        <header className="py-8 sm:py-12 border-b border-border">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 mb-8"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to projects
          </Link>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono">
              {project.year}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
              {project.title}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              {project.description}
            </p>
          </div>
        </header>

        {/* Main content */}
        <article className="py-12 sm:py-16 space-y-12">
          <section className="space-y-6">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`${project.videoUrl}?autoplay=1&mute=1`}
                title={project.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </section>

          {/* Description */}
          <section className="space-y-6">
            <div className="prose prose-invert max-w-2xl">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {project.fullDescription}
              </p>
            </div>
          </section>

          {/* Technologies */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Project URL */}
          <section className="space-y-6 border-t border-border pt-12">
            {project.website ? (
              <Link
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity duration-300 font-medium"
              >
                <span>Visit Project</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            ) : (
              "This project does not have a website to show"
            )}
          </section>

          {/* Related Job */}
          {parentJob && <ParentJobCard job={parentJob} variant="logo" />}
        </article>

        <Footer />
      </main>
    </div>
  );
}
