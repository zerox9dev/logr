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
  title: {
    default: "Logr",
    template: "%s | Logr",
  },
  description: "Freelance time tracker for client/project work with CSV and invoice export.",
  applicationName: "Logr",
  openGraph: {
    title: "Logr",
    description: "Freelance time tracker for client/project work with CSV and invoice export.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logr",
    description: "Freelance time tracker for client/project work with CSV and invoice export.",
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
