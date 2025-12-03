import { getProject, projects } from "@/lib/projects";
import { ProjectDetail } from "@/components/project-detail";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// export async function generateMetadata({ params }: { params: { slug: string } }) {
//   const project = getProject(params.slug)

//   console.log(params.slug);
//   console.log("found slug");

//   if (!project) {
//     return {
//       title: "Project Not Found",
//     }
//   }

//   return {
//     title: `${project.title} - Luigi Girke`,
//     description: project.description,
//   }
// }

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  // if (params) {
  //   return <>{getProject(params.slug)?.description}</>
  // }
  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
