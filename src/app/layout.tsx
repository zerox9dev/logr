import type { Metadata } from "next";
import { Inter, Calistoga } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-calistoga",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Logr — Open-Source Time Tracking & Invoicing for Freelancers",
  description:
    "Open-source, self-hostable Toggl alternative with built-in invoicing. Track time, bill clients, and get paid from one fast dashboard.",
  metadataBase: new URL("https://logr.work"),
  alternates: {
    canonical: "https://logr.work",
  },
  openGraph: {
    title: "Logr — open-source time tracking & invoicing",
    description: "Track time, manage clients, send invoices. Free & open source.",
    url: "https://logr.work",
    type: "website",
    images: [{ url: "/logr.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@logrwork",
    title: "Logr — open-source time tracking & invoicing",
    description: "Track time, manage clients, send invoices. Free & open source.",
    images: ["/logr.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${calistoga.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
