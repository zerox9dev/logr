import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your time, revenue, collection rate, and sales funnel health.",
  robots: { index: false },
};

export default function DashboardPage() {
  return <LogrApp initialScreen="dashboard" />;
}
