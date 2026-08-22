"use client";

import { jobs, projects } from "@/lib/data";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/shared";
export default function Home() {
  const [activeSection, setActiveSection] = useState("");
  const [showChevron, setShowChevron] = useState(true);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    const handleScroll = () => {
      if (window.scrollY > 80) setShowChevron(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    if (activeSection) {
      window.history.replaceState(null, "", `#${activeSection}`);
    }
  }, [activeSection]);

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
          {["intro", "projects", "jobs", "connect"].map((section) => (
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
          className="min-h-[100svh] flex flex-col justify-center py-24 opacity-0 relative"
        >
          <div className="space-y-10">
            <div className="text-xs text-muted-foreground font-mono tracking-[0.2em]">
              PORTFOLIO / 2026
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight leading-none">
              Luigi
              <br />
              <span className="text-muted-foreground">Girke</span>
            </h1>

            <div className="space-y-4 max-w-md">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Software engineer building reliable systems at the
                intersection of
                <span className="text-foreground">
                  {" "}
                  TypeScript applications
                </span>
                ,<span className="text-foreground"> API integration</span>,
                <span className="text-foreground"> and deployment</span>.
              </p>

              <p className="text-sm text-muted-foreground/60 leading-relaxed">
                From{" "}
                <span className="text-muted-foreground">
                  Berlin, Germany
                </span>
                , currently studying in Halifax, Canada.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="https://www.linkedin.com/in/luigigirke/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Luigi Girke's LinkedIn profile"
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-foreground">Software Developer Intern</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">RBC Capital Markets</span>
              </Link>
            </div>

          <button
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-20 text-muted-foreground/50 hover:text-muted-foreground/80 animate-bounce cursor-pointer transition-opacity duration-500 ${showChevron ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-label="Scroll to projects"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          </div>
        </header>

        <section
          id="projects"
          ref={(el) => {
            sectionsRef.current[1] = el;
          }}
          className="pt-10 pb-16 sm:pt-16 sm:pb-24 opacity-0"
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
          className="py-16 sm:py-24 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">
                Work Experience
              </h2>
              <div className="text-sm text-muted-foreground font-mono">
                2024 - 2025
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

        {/* Video section hidden - will link to a different video later */}

        <section
          id="connect"
          ref={(el) => {
            sectionsRef.current[3] = el;
          }}
          className="py-16 sm:py-24 opacity-0"
        >
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl font-light">Let&apos;s Connect</h2>

              <div className="space-y-6">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Always interested in new opportunities, collaborations, and
                  conversations about technology.
                </p>

                <div className="space-y-4">
                  <Link
                    href="mailto:contact@luigigirke.com"
                    className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                  >
                    <span className="text-base sm:text-lg">
                      contact@luigigirke.com
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
                  {
                    name: "YouTube",
                    handle: "@devdogfish",
                    url: "https://www.youtube.com/@devdogfish",
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
