import type { Metadata } from "next";
import Link from "next/link";
import { postsByDate } from "@/data/posts";
import { Band, Crumbs, CtaBand, PageHero } from "@/components/marketing/primitives";

export const metadata: Metadata = {
  title: "Blog — Logr",
  description:
    "Practical guides on freelance invoicing, hourly rates, billable hours, and self-hosted time tracking — from the team building Logr.",
  alternates: {
    canonical: "https://logr.work/blog",
  },
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default function BlogIndexPage() {
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Logr Blog",
    url: "https://logr.work/blog",
    description:
      "Guides on freelance invoicing, rate setting, billable hours, and self-hosted time tracking.",
    blogPost: postsByDate.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.updated ?? p.date,
      url: `https://logr.work/blog/${p.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://logr.work" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://logr.work/blog" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHero
        above={<Crumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />}
        eyebrow="Guides for freelancers & small agencies"
        title="The Logr blog"
      >
        No growth-hacking fluff — just the things that decide whether freelance work is profitable: what to
        charge, which hours are actually billable, how to turn tracked time into a paid invoice, and how to keep
        your client data on infrastructure you own.
      </PageHero>

      <Band className="flex flex-col">
        {postsByDate.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group grid gap-3 border-b border-heading/8 px-6 py-8 transition-colors last:border-b-0 hover:bg-heading/[0.02] md:grid-cols-[220px_1fr_auto] md:gap-10 md:px-10"
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-coral uppercase">
                {p.category}
              </span>
              <span className="text-[13px] text-heading/45">
                <time dateTime={p.date}>{DATE_FORMAT.format(new Date(p.date))}</time> · {p.readingMinutes} min read
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-[22px] leading-[1.25] font-semibold tracking-[-0.025em]">{p.title}</h2>
              <p className="max-w-[620px] text-[15px] leading-[1.55] text-heading/60">{p.description}</p>
            </div>
            <span
              aria-hidden="true"
              className="hidden size-9 items-center justify-center self-center rounded-full bg-heading/5 text-heading/50 transition-[background-color,color,translate] duration-200 group-hover:translate-x-0.5 group-hover:bg-heading group-hover:text-white md:flex"
            >
              →
            </span>
          </Link>
        ))}
      </Band>

      <CtaBand title="Track it, bill it, get paid" />
    </>
  );
}
