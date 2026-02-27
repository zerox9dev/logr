import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Logr — Freelancer CRM & Time Tracker",
  description:
    "All-in-one CRM for freelancers: track time, manage clients, run sales funnels, and generate professional invoices.",
  openGraph: {
    title: "Logr — Freelancer CRM & Time Tracker",
    description:
      "All-in-one CRM for freelancers: track time, manage clients, run sales funnels, and generate professional invoices.",
    url: "https://logr.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Logr — Freelancer CRM & Time Tracker",
      },
    ],
  },
  twitter: {
    title: "Logr — Freelancer CRM & Time Tracker",
    description:
      "All-in-one CRM for freelancers: track time, manage clients, run sales funnels, and generate professional invoices.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://logr.app",
  },
};

export default function Page() {
  return <LandingPage />;
}
