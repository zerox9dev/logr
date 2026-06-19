import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { competitors, getCompetitor } from "@/data/competitors";
import type { ComparisonRow, MigrationStep } from "@/data/competitors";

interface PageProps {
  params: Promise<{ competitor: string }>;
}

export function generateStaticParams() {
  return competitors.map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) return {};
  return {
    title: c.seoTitle,
    description: c.seoDescription,
    alternates: {
      canonical: `https://logr.work/alternatives/${c.slug}`,
    },
  };
}

export default async function CompetitorPage({ params }: PageProps) {
  const { competitor: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://logr.work" },
      { "@type": "ListItem", position: 2, name: "Alternatives", item: "https://logr.work/alternatives" },
      { "@type": "ListItem", position: 3, name: c.displayName, item: `https://logr.work/alternatives/${c.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-md text-tertiary flex items-center gap-2">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>›</span>
        <span>Alternatives</span>
        <span>›</span>
        <span className="text-ink">{c.displayName}</span>
      </nav>

      {/* Hero card */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col gap-6">
        <div className="inline-flex gap-2 items-center">
          <svg viewBox="0 0 8 8" className="size-2 shrink-0">
            <circle cx="4" cy="4" r="4" fill="#18181b" />
          </svg>
          <span className="text-md-minus font-medium text-dark-1">{c.tagline}</span>
        </div>

        <h1 className="text-[32px] sm:text-[40px] font-bold text-heading leading-[1.1] tracking-[-0.5px]">
          The open-source {c.displayName} alternative
        </h1>

        <p className="text-base text-ink leading-relaxed max-w-[640px]">
          {c.heroCopy}
        </p>
      </div>

      {/* Comparison table */}
      <div className="bg-card border border-line flex flex-col gap-0">
        <div className="px-8 pt-8 pb-5 border-b border-line">
          <h2 className="text-xl font-semibold text-heading">
            Logr vs {c.name} — feature comparison
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-base text-ink">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-8 py-4 text-md font-semibold text-heading w-1/2">Feature</th>
                <th className="text-center px-6 py-4 text-md font-semibold text-money w-1/4">Logr</th>
                <th className="text-center px-6 py-4 text-md font-semibold text-tertiary w-1/4">{c.name}</th>
              </tr>
            </thead>
            <tbody>
              {c.comparisonRows.map(({ feature, logr, competitor }: ComparisonRow, i: number) => (
                <tr
                  key={i}
                  className="border-b border-line last:border-b-0 hover:bg-page transition-colors"
                >
                  <td className="px-8 py-4 text-md font-medium text-ink">{feature}</td>
                  <td className="px-6 py-4 text-center">
                    {typeof logr === "boolean" ? (
                      logr ? (
                        <span className="text-money font-semibold text-base">✓</span>
                      ) : (
                        <span className="text-placeholder text-base">✗</span>
                      )
                    ) : (
                      <span className="text-md font-medium text-money">{logr}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof competitor === "boolean" ? (
                      competitor ? (
                        <span className="text-ink font-semibold text-base">✓</span>
                      ) : (
                        <span className="text-placeholder text-base">✗</span>
                      )
                    ) : (
                      <span className="text-md text-tertiary">{competitor}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Migration section */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-heading">{c.migrationTitle}</h2>
        <p className="text-base text-ink leading-relaxed">{c.migrationIntro}</p>

        <ol className="flex flex-col gap-4 list-none">
          {c.migrationSteps.map(({ title, body }: MigrationStep, i: number) => (
            <li key={i} className="flex gap-5 items-start">
              <span className="shrink-0 w-7 h-7 bg-ink text-white text-md font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold text-heading">{title}</span>
                <span className="text-md text-tertiary leading-relaxed">{body}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Why self-host */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-heading">Why self-host your time tracker?</h2>
        <p className="text-base text-ink leading-relaxed">
          When you self-host Logr, your time entries, client names, billing rates, and
          invoices are stored in your own Postgres database — not on a vendor&apos;s
          servers. That matters for freelancers working with NDAs, agencies handling
          sensitive client projects, and anyone who has watched a beloved SaaS tool
          sunset or triple its pricing overnight.
        </p>
        <ul className="flex flex-col gap-3">
          {[
            "No vendor lock-in — export or migrate anytime, it is your database.",
            "No per-seat fees — self-hosted Logr is free for any team size.",
            "Audit the code — AGPL-3.0 means every line is public and verifiable.",
            "Deploy anywhere — Vercel, Railway, Fly.io, your own VPS.",
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
