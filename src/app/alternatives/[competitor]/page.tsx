import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { competitors, getCompetitor } from "@/data/competitors";
import type { ComparisonRow, MigrationStep } from "@/data/competitors";
import { Band, CheckList, Crumbs, CtaBand, PageHero, SectionHeading, SplitSection } from "@/components/marketing/primitives";
import { ComparisonTable } from "@/components/marketing/comparison-table";

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

      <PageHero
        above={
          <Crumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Alternatives", href: "/alternatives" },
              { label: c.displayName },
            ]}
          />
        }
        eyebrow={c.tagline}
        title={`The open-source ${c.displayName} alternative`}
      >
        {c.heroCopy}
      </PageHero>

      <section>
        <Band className="px-6 py-16 md:px-10">
          <SectionHeading eyebrow="Compare" title={`Logr vs ${c.name}`}>
            Feature by feature, as of June 2026.
          </SectionHeading>
        </Band>
        <ComparisonTable
          columns={["Logr", c.name]}
          rows={c.comparisonRows.map(({ feature, logr, competitor }: ComparisonRow) => [feature, logr, competitor])}
        />
      </section>

      <section>
        <Band className="px-6 py-16 md:px-10">
          <SectionHeading eyebrow="Switch" title={c.migrationTitle}>
            {c.migrationIntro}
          </SectionHeading>
        </Band>
        <Band className={`grid gap-px bg-heading/8 ${c.migrationSteps.length % 3 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {c.migrationSteps.map(({ title, body }: MigrationStep, i: number) => (
            <div key={title} className="bg-white px-6 py-8 md:px-8">
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-heading text-[13px] font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h3>
              </div>
              <p className="mt-2 text-[15px] leading-[1.55] text-heading/60 md:pl-10">{body}</p>
            </div>
          ))}
        </Band>
      </section>

      <SplitSection eyebrow="Own your data" title="Why self-host your time tracker?">
        <p className="text-[16px] leading-[1.7] text-heading/70">
          When you self-host Logr, your time entries, client names, billing rates, and invoices are stored in your
          own PocketBase database — not on a vendor&apos;s servers. That matters for freelancers working with NDAs,
          agencies handling sensitive client projects, and anyone who has watched a beloved SaaS tool sunset or
          triple its pricing overnight.
        </p>
        <div className="mt-8">
          <CheckList
            items={[
              "No vendor lock-in — export or migrate anytime, it is your database.",
              "No per-seat fees — self-hosted Logr is free for any team size.",
              "Audit the code — AGPL-3.0 means every line is public and verifiable.",
              "Deploy anywhere — Vercel, Railway, Fly.io, your own VPS.",
            ]}
          />
        </div>
      </SplitSection>

      <CtaBand title="Ready to own your time data?">Free forever on logr.work, or self-host in minutes.</CtaBand>
    </>
  );
}
