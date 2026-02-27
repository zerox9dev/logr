import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview dashboard for time, revenue, collection rate, and pipeline health.",
};

export default function DashboardPage() {
  return <LogrApp initialScreen="dashboard" />;
}
