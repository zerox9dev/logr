import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Calistoga } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./providers";
import { THEME_SCRIPT } from "@/lib/theme-script";

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
    // suppressHydrationWarning: THEME_SCRIPT sets data-theme on <html> before hydration.
    <html lang="en" className={`${inter.variable} ${calistoga.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Script
          src="https://umami.mirvald.com/script.js"
          data-website-id="77e07cae-fa4b-4023-ba0b-bab2f2dae7ac"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
