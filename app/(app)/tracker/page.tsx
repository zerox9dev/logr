import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Tracker",
  description: "Log billable hours by client and project, export sessions to CSV, and build invoices from tracked time.",
  robots: { index: false },
};

export default function TrackerPage() {
  return <LogrApp initialScreen="tracker" />;
}
