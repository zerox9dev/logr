import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://logr.app"),
  title: {
    default: "Logr — Freelancer CRM & Time Tracker",
    template: "%s | Logr",
  },
  description:
    "All-in-one CRM for freelancers: track time, manage clients, run sales funnels, and generate professional invoices.",
  applicationName: "Logr",
  keywords: [
    "freelancer CRM",
    "time tracker",
    "invoice generator",
    "sales funnel",
    "client management",
    "freelance tool",
  ],
  authors: [{ name: "Logr" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    siteName: "Logr",
    title: "Logr — Freelancer CRM & Time Tracker",
    description:
      "All-in-one CRM for freelancers: track time, manage clients, run sales funnels, and generate professional invoices.",
    type: "website",
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
    card: "summary_large_image",
    title: "Logr — Freelancer CRM & Time Tracker",
    description:
      "All-in-one CRM for freelancers: track time, manage clients, run sales funnels, and generate professional invoices.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
