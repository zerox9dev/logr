import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Clients",
  description: "Client CRM and profiles.",
};

export default function ClientsPage() {
  return <LogrApp initialScreen="clients" />;
}
