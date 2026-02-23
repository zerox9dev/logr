import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Logr — Time Tracker for Freelancers",
  description: "Track time, organize clients/projects, and export professional invoices.",
};

export default function Page() {
  return <LandingPage />;
}
