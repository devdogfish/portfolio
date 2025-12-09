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
              {project.subtitle}
            </p>
          </div>
        </header>

        {/* Main content */}
        <article className="py-12 sm:py-16 space-y-12">
          <section className="space-y-6">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {project.videoUrl ? (
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
              ) : (
                <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <p className="text-lg text-muted-foreground font-medium">
                      Video Coming Soon
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This project showcase is in the making
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-6">
            <p className="text-lg leading-relaxed text-justify text-muted-foreground whitespace-pre-line">
              {project.fullDescription}
            </p>
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
          {/* Project Resources - new section for presentations, docs, github, deployed version */}
          {(project.presentations ||
            project.documentation ||
            project.github ||
            project.deployed) && (
            <section className="space-y-6 border-t border-border pt-12">
              <h2 className="text-2xl font-light">Project Resources</h2>

              <div className="grid gap-4 sm:gap-6">
                {/* Presentations */}
                {project.presentations && project.presentations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-mono text-muted-foreground">
                      PRESENTATIONS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.presentations.map((presentation) => (
                        <Link
                          key={`${presentation.language}-presentation`}
                          href={presentation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-foreground hover:bg-muted transition-all duration-300"
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
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          <span className="text-sm">
                            {presentation.label ||
                              `Presentation (${presentation.language.toUpperCase()})`}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documentation */}
                {project.documentation && project.documentation.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-mono text-muted-foreground">
                      DOCUMENTATION
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.documentation.map((doc) => (
                        <Link
                          key={`${doc.language}-doc`}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-foreground hover:bg-muted transition-all duration-300"
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-sm">
                            {doc.label ||
                              `Documentation (${doc.language.toUpperCase()})`}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* GitHub & Deployed Version */}
                <div className="flex flex-wrap gap-2">
                  {project.github && (
                    <Link
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-foreground hover:bg-muted transition-all duration-300"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      <span className="text-sm">View on GitHub</span>
                    </Link>
                  )}

                  {project.deployed && (
                    <Link
                      href={project.deployed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-foreground hover:bg-muted transition-all duration-300"
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span className="text-sm">View Deployed Version</span>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          )}
          {/* Related Job */}
          {parentJob && <ParentJobCard job={parentJob} variant="logo" />}
        </article>

        <Footer />
      </main>
    </div>
  );
}
