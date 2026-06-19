import type { Metadata } from "next";
import Link from "next/link";
import { competitors } from "@/data/competitors";

export const metadata: Metadata = {
  title: "Time Tracker Alternatives — Logr",
  description:
    "Compare open-source and self-hostable free time tracker alternatives to Toggl, Clockify, Harvest, and more. Logr is AGPL-3.0, self-hostable, and free forever.",
  alternates: {
    canonical: "https://logr.work/alternatives",
  },
};

export default function AlternativesPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Open-Source Time Tracker Alternatives",
    description:
      "A collection of comparison pages for open-source and self-hostable time tracker alternatives.",
    itemListElement: competitors.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Logr vs ${c.name}`,
      url: `https://logr.work/alternatives/${c.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://logr.work" },
      { "@type": "ListItem", position: 2, name: "Alternatives", item: "https://logr.work/alternatives" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-md text-tertiary flex items-center gap-2">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>›</span>
        <span className="text-ink">Alternatives</span>
      </nav>

      {/* Hero card */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col gap-6">
        <div className="inline-flex gap-2 items-center">
          <svg viewBox="0 0 8 8" className="size-2 shrink-0">
            <circle cx="4" cy="4" r="4" fill="#18181b" />
          </svg>
          <span className="text-md-minus font-medium text-dark-1">Open source · Self-hostable · AGPL-3.0</span>
        </div>

        <h1 className="text-[32px] sm:text-[40px] font-bold text-heading leading-[1.1] tracking-[-0.5px]">
          Open source &amp; self-hosted time tracker alternatives
        </h1>

        <p className="text-base text-ink leading-relaxed max-w-[640px]">
          Looking for an open source or self-hosted time tracker alternative to Toggl,
          Clockify, Harvest, or another proprietary tool? Logr is a free, AGPL-3.0
          self-hostable time tracker with built-in invoicing — your data lives in your
          own database, not a vendor&apos;s server. Browse the comparison pages below to
          see how Logr stacks up against popular time tracking tools.
        </p>
      </div>

      {/* Competitor cards grid */}
      <div className="flex flex-col gap-4">
        {competitors.map((c) => (
          <Link
            key={c.slug}
            href={`/alternatives/${c.slug}`}
            className="bg-card border border-line p-6 sm:p-8 flex flex-col gap-2 hover:border-line-2 transition-colors group"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-semibold text-heading group-hover:text-ink transition-colors">
                Logr vs {c.name}
              </span>
              <span className="text-md text-tertiary shrink-0">→</span>
            </div>
            <p className="text-md text-tertiary leading-relaxed">{c.tagline}</p>
          </Link>
        ))}
      </div>

      {/* Why self-host callout */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-heading">Why choose an open-source time tracker?</h2>
        <p className="text-base text-ink leading-relaxed">
          Proprietary time tracking tools can change pricing overnight, lock your data
          behind export paywalls, or simply shut down. An open-source, self-hostable
          time tracker means your data, your rules — no vendor lock-in, no per-seat
          fees, no surprises.
        </p>
        <ul className="flex flex-col gap-3">
          {[
            "Full data ownership — your time entries live in your own database.",
            "No per-seat fees — self-hosted Logr is free for any team size.",
            "Auditable codebase — every line is public under AGPL-3.0.",
            "Deploy anywhere — Vercel, Railway, Fly.io, or your own VPS.",
          ].map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-money font-bold text-base shrink-0 mt-[1px]">✓</span>
              <span className="text-md text-ink leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-heading">Ready to own your time data?</span>
          <span className="text-md text-tertiary">Free forever on logr.work, or self-host in minutes.</span>
        </div>
        <div className="flex gap-3 flex-wrap shrink-0">
          <Link
            href="/login"
            className="bg-ink text-white px-6 py-3 text-base font-semibold whitespace-nowrap"
          >
            Start tracking — free
          </Link>
          <a
            href="https://github.com/zerox9dev/logr"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-line-2 bg-card px-6 py-3 text-base font-medium text-heading whitespace-nowrap"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </>
  );
}
