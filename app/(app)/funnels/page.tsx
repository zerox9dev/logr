import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Funnels",
  description: "Visual kanban funnels for freelance sales pipeline and job application tracking.",
  robots: { index: false },
};

export default function FunnelsPage() {
  return <LogrApp initialScreen="pipeline" />;
}
