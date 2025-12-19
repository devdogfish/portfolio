"use client";

import { jobs, projects } from "@/lib/data";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { Footer } from "@/components/shared";
import { useRouter } from "next/navigation";

export default function Home() {
  const { theme } = useNextTheme();
  const [activeSection, setActiveSection] = useState("");
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Update URL when active section changes
  useEffect(() => {
    if (activeSection) {
      router.replace(`#${activeSection}`, { scroll: false }); // This scrolls automatically anyway when the url is updated
    }
  }, [activeSection, router]);

  const featuredProjects = [
    projects.find((p) => p.slug === "etpzp-sms"),
    projects.find((p) => p.slug === "sitings"),
    projects.find((p) => p.slug === "yda-app"),
    projects.find((p) => p.slug === "workouts-tracker"),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {["intro", "projects", "jobs", "video", "connect"].map((section) => (
            <button
              key={section}
              onClick={() =>
                document
                  .getElementById(section)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                activeSection === section
                  ? "bg-foreground"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Navigate to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        <header
          id="intro"
          ref={(el) => {
            sectionsRef.current[0] = el;
          }}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">
                  PORTFOLIO / 2025
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                  Luigi
                  <br />
                  <span className="text-muted-foreground">Girke</span>
                </h1>
              </div>

              <div className="space-y-6 max-w-md">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  DevOps Engineer building reliable systems at the intersection
                  of
                  <span className="text-foreground"> automation</span>,
                  <span className="text-foreground"> infrastructure</span>, and
                  <span className="text-foreground"> deployment</span>.
                </p>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Originally from{" "}
                  <span className="text-foreground font-medium">
                    Berlin, Germany
                  </span>
                  , currently attending university in Halifax, Canada.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Available for internships
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">
                  CURRENTLY
                </div>
                <div className="space-y-2">
                  <div className="text-foreground">Software Developer</div>
                  <div className="text-muted-foreground">
                    Young Drivers Academy
                  </div>
                  <div className="text-xs text-muted-foreground">
                    July 2025 — Present
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">
                  FOCUS
                </div>
                <div className="flex flex-wrap gap-2">
                  {["TypeScript", "Next.js", "Prisma"].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section
          id="projects"
          ref={(el) => {
            sectionsRef.current[1] = el;
          }}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">
              Highlighted Projects
            </h2>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {featuredProjects.map((project) => (
                <Link
                  key={project!.slug}
                  href={`/project/${project!.slug}`}
                  className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg cursor-pointer h-full flex flex-col"
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{project!.year}</span>
                      {project!.deployed && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(project!.deployed as string, "_blank");
                          }}
                          className="p-1.5 hover:bg-muted-foreground/10 rounded transition-colors duration-300 opacity-0 group-hover:opacity-100"
                          aria-label="Open deployed project"
                        >
                          <svg
                            className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
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
                        </button>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                      {project!.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">
                      {project!.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 mt-4">
                    <span>View Details</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          id="jobs"
          ref={(el) => {
            sectionsRef.current[2] = el;
          }}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">
                Work Experience
              </h2>
              <div className="text-sm text-muted-foreground font-mono">
                2024 — 2025
              </div>
            </div>

            <div className="space-y-8 sm:space-y-12">
              {jobs.map((job, index) => (
                <Link
                  key={index}
                  href={`/job/${job.slug}`}
                  className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500 cursor-pointer"
                >
                  <div className="lg:col-span-2">
                    <div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                      {job.year}
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium">
                        {job.role}
                      </h3>
                      <div className="text-muted-foreground">{job.company}</div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-lg">
                      {job.subtitle}
                    </p>
                  </div>

                  <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end mt-2 lg:mt-0 content-start">
                    {job.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs text-muted-foreground rounded group-hover:border-muted-foreground/50 transition-colors duration-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          id="video"
          ref={(el) => {
            sectionsRef.current[3] = el;
          }}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">About</h2>

            <section className="space-y-6">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/7C0bCrV_Jc8"
                  title="About me video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </section>
            {/* <div className="w-full aspect-video border border-border rounded-lg overflow-hidden bg-muted/20"></div> */}
          </div>
        </section>

        <section
          id="connect"
          ref={(el) => {
            sectionsRef.current[4] = el;
          }}
          className="py-20 sm:py-32 opacity-0"
        >
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl font-light">Let's Connect</h2>

              <div className="space-y-6">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Always interested in new opportunities, collaborations, and
                  conversations about technology.
                </p>

                <div className="space-y-4">
                  <Link
                    href="mailto:devdogfish@proton.me"
                    className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                  >
                    <span className="text-base sm:text-lg">
                      devdogfish@proton.me
                    </span>
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="text-sm text-muted-foreground font-mono">
                ELSEWHERE
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "GitHub",
                    handle: "@devdogfish",
                    url: "https://github.com/devdogfish",
                  },
                  {
                    name: "LinkedIn",
                    handle: "in/luigigirke",
                    url: "https://www.linkedin.com/in/luigigirke/",
                  },
                ].map((social) => (
                  <Link
                    key={social.name}
                    href={social.url}
                    className="group p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
                    target="_blank"
                  >
                    <div className="space-y-2">
                      <div className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                        {social.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {social.handle}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  );
}
