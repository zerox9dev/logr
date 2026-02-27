import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Invoices",
  description: "Invoice drafts and payment tracking.",
};

export default function InvoicesPage() {
  return <LogrApp initialScreen="invoices" />;
}
