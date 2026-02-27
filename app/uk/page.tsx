import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Logr — CRM і тайм-трекер для фрилансерів",
  description:
    "Все в одному: облік часу, управління клієнтами, воронки продажів та професійні рахунки для фрилансерів.",
  openGraph: {
    title: "Logr — CRM і тайм-трекер для фрилансерів",
    description:
      "Все в одному: облік часу, управління клієнтами, воронки продажів та професійні рахунки для фрилансерів.",
    url: "https://logr.work/uk",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Logr — CRM і тайм-трекер для фрилансерів",
      },
    ],
  },
  twitter: {
    title: "Logr — CRM і тайм-трекер для фрилансерів",
    description:
      "Все в одному: облік часу, управління клієнтами, воронки продажів та професійні рахунки для фрилансерів.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://logr.work/uk",
    languages: {
      en: "https://logr.work",
      ru: "https://logr.work/ru",
      uk: "https://logr.work/uk",
      "pl": "https://logr.work/pl",
      "de": "https://logr.work/de",
      "x-default": "https://logr.work",
    },
  },
};

export default function PageUk() {
  return <LandingPage lang="uk" />;
}
