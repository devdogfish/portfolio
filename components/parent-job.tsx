"use client";

import Link from "next/link";
import type { Job } from "@/lib/data";
import SquareImage from "./square-image";

interface ParentJobCardProps {
  job: Job;
  variant?: "logo" | "timeline" | "inline" | "badge";
}

export function ParentJobCard({ job, variant = "logo" }: ParentJobCardProps) {
  if (variant === "logo") {
    return (
      <Link
        href={`/job/${job.slug}`}
        className="group block p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg hover:bg-muted/30"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {/* <Image
              src={job.image || ""}
              width={128}
              height={128}
              alt={job.company}
              // className="w-16 h-16 rounded-lg object-cover bg-muted"
            /> */}
            <SquareImage src={job.image} />
          </div>
          <div className="grow space-y-1">
            <h3 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
              {job.role}
            </h3>
            <p className="text-muted-foreground">{job.company}</p>
            <p className="text-sm text-muted-foreground/70 pt-1">{job.year}</p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "timeline") {
    return (
      <Link href={`/job/${job.slug}`} className="group block relative pl-8">
        {/* Timeline line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border group-hover:bg-muted-foreground/50 transition-colors duration-300" />
        {/* Timeline dot */}
        <div className="absolute -left-1.5 top-2 w-3 h-3 bg-background border-2 border-border group-hover:border-muted-foreground/50 rounded-full transition-all duration-300" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
              {job.role}
            </h3>
            <span className="text-sm text-muted-foreground">{job.year}</span>
          </div>
          <p className="text-muted-foreground">{job.company}</p>
        </div>
      </Link>
    );
  }

  if (variant === "inline") {
    return (
      <Link
        href={`/job/${job.slug}`}
        className="group inline hover:underline hover:text-muted-foreground transition-colors duration-300"
      >
        <span className="font-medium">{job.role}</span>
        <span className="text-muted-foreground"> at </span>
        <span className="font-medium">{job.company}</span>
        <span className="text-muted-foreground text-sm"> ({job.year})</span>
      </Link>
    );
  }

  // variant === 'badge'
  return (
    <Link
      href={`/job/${job.slug}`}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-all duration-300 border border-border hover:border-muted-foreground/50 group"
    >
      <span className="text-sm font-medium text-foreground">{job.company}</span>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
        {job.year}
      </span>
    </Link>
  );
}
