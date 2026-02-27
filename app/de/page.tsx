import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Logr — CRM und Zeiterfassung für Freelancer",
  description:
    "Alles in einem: Zeiterfassung, Kundenverwaltung, Verkaufstrichter und professionelle Rechnungen für Freelancer.",
  openGraph: {
    title: "Logr — CRM und Zeiterfassung für Freelancer",
    description:
      "Alles in einem: Zeiterfassung, Kundenverwaltung, Verkaufstrichter und professionelle Rechnungen für Freelancer.",
    url: "https://logr.work/de",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Logr — CRM und Zeiterfassung für Freelancer" }],
  },
  twitter: {
    title: "Logr — CRM und Zeiterfassung für Freelancer",
    description:
      "Alles in einem: Zeiterfassung, Kundenverwaltung, Verkaufstrichter und professionelle Rechnungen für Freelancer.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://logr.work/de",
    languages: {
      en: "https://logr.work",
      ru: "https://logr.work/ru",
      uk: "https://logr.work/uk",
      pl: "https://logr.work/pl",
      de: "https://logr.work/de",
      "x-default": "https://logr.work",
    },
  },
};

export default function PageDe() {
  return <LandingPage lang="de" />;
}
