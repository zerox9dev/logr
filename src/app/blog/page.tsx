import type { Metadata } from "next";
import Link from "next/link";
import { postsByDate } from "@/data/posts";

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

      {/* Breadcrumb */}
      <nav className="text-md text-tertiary flex items-center gap-2">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>›</span>
        <span className="text-ink">Blog</span>
      </nav>

      {/* Hero card */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col gap-6">
        <div className="inline-flex gap-2 items-center">
          <svg viewBox="0 0 8 8" className="size-2 shrink-0">
            <circle cx="4" cy="4" r="4" fill="#18181b" />
          </svg>
          <span className="text-md-minus font-medium text-dark-1">
            Guides for freelancers &amp; small agencies
          </span>
        </div>

        <h1 className="text-[32px] sm:text-[40px] font-bold text-heading leading-[1.1] tracking-[-0.5px]">
          The Logr blog
        </h1>

        <p className="text-base text-ink leading-relaxed max-w-[640px]">
          No growth-hacking fluff — just the things that decide whether freelance work is
          profitable: what to charge, which hours are actually billable, how to turn tracked
          time into a paid invoice, and how to keep your client data on infrastructure you
          own.
        </p>
      </div>

      {/* Post list */}
      <div className="flex flex-col gap-4">
        {postsByDate.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="bg-card border border-line p-8 flex flex-col gap-3 hover:border-line-2 transition-colors"
          >
            <div className="flex items-center gap-3 text-md-minus text-tertiary">
              <span className="font-medium text-dark-1">{p.category}</span>
              <span>·</span>
              <time dateTime={p.date}>{DATE_FORMAT.format(new Date(p.date))}</time>
              <span>·</span>
              <span>{p.readingMinutes} min read</span>
            </div>
            <h2 className="text-lg font-semibold text-heading leading-snug">{p.title}</h2>
            <p className="text-md text-ink leading-relaxed">{p.description}</p>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-heading">
            Track it, bill it, get paid
          </span>
          <span className="text-md text-tertiary">
            Free forever on logr.work, or self-host in minutes.
          </span>
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
