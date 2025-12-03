import { jobs, getJob, getProjectsByJobId } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

export function generateStaticParams() {
  return jobs.map((job) => ({
    slug: job.slug,
  }));
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = getJob(slug);

  if (!job) {
    notFound();
  }

  const relatedProjects = getProjectsByJobId(job.slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Header with back button */}
        <header className="py-8 sm:py-12 border-b border-border">
          <Link
            href="/#jobs"
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
            Back to work
          </Link>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono">
              {job.year}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
              {job.role}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              {job.company}
            </p>
          </div>
        </header>

        {/* Main content */}
        <article className="py-12 sm:py-16 space-y-12">
          {job.gallery && job.gallery.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-light">Gallery</h2>
              <div
                className={`grid gap-4 ${
                  job.gallery.length === 1
                    ? "grid-cols-1"
                    : job.gallery.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                }`}
              >
                {job.gallery.map((image, idx) => (
                  <div
                    key={idx}
                    className="aspect-video bg-muted rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${job.company} gallery image ${idx + 1}`}
                      width={500}
                      height={281}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="space-y-6">
            <div className="prose prose-invert max-w-2xl">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {job.fullDescription}
              </p>
            </div>
          </section>

          {/* Technologies */}
          <section className="space-y-6">
            <h2 className="text-2xl font-light">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {job.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="space-y-6 border-t border-border pt-12">
              <h2 className="text-2xl font-light">Related Projects</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedProjects.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/project/${project.slug}`}
                    className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, idx) => (
                          <span
                            key={tech}
                            className="text-xs text-muted-foreground"
                          >
                            {tech}
                            {idx < Math.min(3, project.technologies.length) - 1
                              ? ","
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </div>
  );
}
