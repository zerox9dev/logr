import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Logr — Time Tracking & Invoicing for Freelancers",
  description:
    "Open-source, self-hostable Toggl alternative with built-in invoicing. Track time, bill clients, and get paid from one fast dashboard.",
  metadataBase: new URL("https://logr.work"),
  openGraph: {
    title: "Logr — open-source time tracking & invoicing",
    description: "Track time, manage clients, send invoices. Free & open source.",
    url: "https://logr.work",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
