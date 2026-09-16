import { ClientDetail } from "@/components/shared/client-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ClientDetail id={id} />;
}
