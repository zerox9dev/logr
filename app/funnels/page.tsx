import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Funnels",
  description: "Sales and job application funnels.",
};

export default function FunnelsPage() {
  return <LogrApp initialScreen="pipeline" />;
}
