import { ProjectDetail } from "@/components/shared/project-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ProjectDetail id={id} />;
}
