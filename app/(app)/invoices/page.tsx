import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Invoices",
  description: "Create, send, and track professional invoices built from your tracked sessions.",
  robots: { index: false },
};

export default function InvoicesPage() {
  return <LogrApp initialScreen="invoices" />;
}
