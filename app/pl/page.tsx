import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Logr — CRM i tracker czasu dla freelancerów",
  description:
    "Wszystko w jednym: śledzenie czasu, zarządzanie klientami, lejki sprzedaży i profesjonalne faktury dla freelancerów.",
  openGraph: {
    title: "Logr — CRM i tracker czasu dla freelancerów",
    description:
      "Wszystko w jednym: śledzenie czasu, zarządzanie klientami, lejki sprzedaży i profesjonalne faktury dla freelancerów.",
    url: "https://logr.work/pl",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Logr — CRM i tracker czasu dla freelancerów" }],
  },
  twitter: {
    title: "Logr — CRM i tracker czasu dla freelancerów",
    description:
      "Wszystko w jednym: śledzenie czasu, zarządzanie klientami, lejki sprzedaży i profesjonalne faktury dla freelancerów.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://logr.work/pl",
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

export default function PagePl() {
  return <LandingPage lang="pl" />;
}
