import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Logr — CRM и тайм-трекер для фрилансеров",
  description:
    "Всё в одном: учёт времени, управление клиентами, воронки продаж и профессиональные счета для фрилансеров.",
  openGraph: {
    title: "Logr — CRM и тайм-трекер для фрилансеров",
    description:
      "Всё в одном: учёт времени, управление клиентами, воронки продаж и профессиональные счета для фрилансеров.",
    url: "https://logr.work/ru",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Logr — CRM и тайм-трекер для фрилансеров",
      },
    ],
  },
  twitter: {
    title: "Logr — CRM и тайм-трекер для фрилансеров",
    description:
      "Всё в одном: учёт времени, управление клиентами, воронки продаж и профессиональные счета для фрилансеров.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://logr.work/ru",
    languages: {
      en: "https://logr.work",
      ru: "https://logr.work/ru",
      uk: "https://logr.work/uk",
      "x-default": "https://logr.work",
    },
  },
};

export default function PageRu() {
  return <LandingPage lang="ru" />;
}
