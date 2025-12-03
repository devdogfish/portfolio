import { jobs } from "@/lib/data";
import React from "react";

export function generateStaticParams() {
  return jobs.map((job) => ({
    slug: job.slug,
  }));
}
export default function Page() {
  return <div>Work in progress</div>;
}
