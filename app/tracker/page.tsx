import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Tracker",
  description: "Freelance time tracker for client/project work with CSV and invoice export.",
};

export default function TrackerPage() {
  return <LogrApp initialScreen="tracker" />;
}
