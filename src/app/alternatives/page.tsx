import type { Metadata } from "next";
import Link from "next/link";
import { competitors } from "@/data/competitors";
import { Band, CheckList, Crumbs, CtaBand, PageHero, SplitSection } from "@/components/marketing/primitives";

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

      <PageHero
        above={<Crumbs items={[{ label: "Home", href: "/" }, { label: "Alternatives" }]} />}
        eyebrow="Open source · Self-hostable · AGPL-3.0"
        title="Open source & self-hosted time tracker alternatives"
      >
        Looking for an open source or self-hosted time tracker alternative to Toggl, Clockify, Harvest, or another
        proprietary tool? Logr is a free, AGPL-3.0 self-hostable time tracker with built-in invoicing — your data
        lives in your own database, not a vendor&apos;s server. Browse the comparison pages below to see how Logr
        stacks up against popular time tracking tools.
      </PageHero>

      <Band className="grid gap-px bg-heading/8 md:grid-cols-2">
        {competitors.map((c) => (
          <Link
            key={c.slug}
            href={`/alternatives/${c.slug}`}
            className="group flex flex-col gap-2 bg-white px-6 py-8 transition-colors hover:bg-heading/[0.02] md:px-10"
          >
            <span className="flex items-center justify-between gap-4">
              <span className="text-[20px] font-semibold tracking-[-0.025em]">Logr vs {c.name}</span>
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-heading/5 text-heading/50 transition-[background-color,color,translate] duration-200 group-hover:translate-x-0.5 group-hover:bg-heading group-hover:text-white"
              >
                →
              </span>
            </span>
            <span className="max-w-[420px] text-[14px] leading-[1.55] text-heading/60">{c.tagline}</span>
          </Link>
        ))}
        {competitors.length % 2 ? <div aria-hidden="true" className="bg-white max-md:hidden" /> : null}
      </Band>

      <SplitSection eyebrow="Why open source" title="Why choose an open-source time tracker?">
        <p className="text-[16px] leading-[1.7] text-heading/70">
          Proprietary time tracking tools can change pricing overnight, lock your data behind export paywalls, or
          simply shut down. An open-source, self-hostable time tracker means your data, your rules — no vendor
          lock-in, no per-seat fees, no surprises.
        </p>
        <div className="mt-8">
          <CheckList
            items={[
              "Full data ownership — your time entries live in your own database.",
              "No per-seat fees — self-hosted Logr is free for any team size.",
              "Auditable codebase — every line is public under AGPL-3.0.",
              "Deploy anywhere — Vercel, Railway, Fly.io, or your own VPS.",
            ]}
          />
        </div>
      </SplitSection>

      <CtaBand title="Ready to own your time data?">Free forever on logr.work, or self-host in minutes.</CtaBand>
    </>
  );
}
