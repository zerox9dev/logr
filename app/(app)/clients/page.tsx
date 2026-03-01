import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Clients",
  description: "Manage client profiles, contact details, tags, notes, and revenue history.",
  robots: { index: false },
};

export default function ClientsPage() {
  return <LogrApp initialScreen="clients" />;
}
