import { InvoiceDetail } from "@/components/shared/invoice-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <InvoiceDetail id={id} />;
}
