"use client";

import Link from "next/link";
import type { Project } from "@/lib/projects";

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-20">
        {/* Back Navigation */}
        <div className="mb-12 sm:mb-16">
          <Link
            href="/#work"
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300"
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
            <span className="text-sm">Back to portfolio</span>
          </Link>
        </div>

        {/* Project Header */}
        <div className="space-y-4 sm:space-y-6 mb-12 sm:mb-16">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-mono">
              {project.year}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
              {project.title}
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 pt-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground font-mono mb-2">
                  ROLE
                </div>
                <p className="text-lg sm:text-xl">{project.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground font-mono mb-2">
                  TECHNOLOGIES
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border mb-12 sm:mb-16"></div>

        {/* Project Description */}
        <div className="space-y-8 sm:space-y-12 mb-12 sm:mb-16">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-light">
              About the Project
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {project.fullDescription}
            </p>
          </div>
        </div>

        {/* Project Link */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 py-8 sm:py-12 border-t border-border">
          <div>
            <div className="text-sm text-muted-foreground font-mono mb-3">
              VIEW PROJECT
            </div>
            <Link
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
            >
              <span className="text-lg sm:text-xl font-medium">
                {project.projectUrl}
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
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  );
}
