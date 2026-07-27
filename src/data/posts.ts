import type { ComponentType } from "react";

/**
 * Blog post registry for /blog/*.
 * Metadata lives here (single source of truth for the index page, SEO, sitemap
 * and RSS); the article body lives next to it as MDX in src/content/blog/.
 *
 * The `load` map is explicit rather than a dynamic template-literal import so
 * both the Turbopack dev build and the production build can statically resolve
 * every article.
 */
export interface Post {
  /** URL slug — the dynamic route segment */
  slug: string;
  /** h1 / index card title */
  title: string;
  /** SEO <title> — falls back to `title` when omitted */
  seoTitle?: string;
  /** SEO meta description, also used as the index card excerpt */
  description: string;
  /** ISO date (YYYY-MM-DD) of first publication */
  date: string;
  /** ISO date of the last meaningful content update */
  updated?: string;
  /** Reading time in minutes, rounded */
  readingMinutes: number;
  /** Short category label shown on cards */
  category: "Invoicing" | "Rates" | "Time tracking" | "Agencies" | "Self-hosting";
  /** MDX loader for the article body */
  load: () => Promise<{ default: ComponentType }>;
}

export const posts: Post[] = [
  {
    slug: "how-to-invoice-a-client-as-a-freelancer",
    title: "How to invoice a client as a freelancer",
    seoTitle: "How to Invoice a Client as a Freelancer (2026 Guide + Checklist)",
    description:
      "Everything a freelance invoice needs — required fields, numbering, tax, payment terms — plus how to turn tracked hours into a sent invoice in minutes.",
    date: "2026-07-27",
    readingMinutes: 8,
    category: "Invoicing",
    load: () => import("@/content/blog/how-to-invoice-a-client-as-a-freelancer.mdx"),
  },
  {
    slug: "hourly-rate-calculator-for-freelancers",
    title: "How to set your freelance hourly rate (with the math)",
    seoTitle: "Freelance Hourly Rate: How to Calculate What to Charge",
    description:
      "A step-by-step formula for your hourly rate: target income, real expenses, and the billable utilization number most freelancers get wrong.",
    date: "2026-07-27",
    readingMinutes: 9,
    category: "Rates",
    load: () => import("@/content/blog/hourly-rate-calculator-for-freelancers.mdx"),
  },
  {
    slug: "billable-vs-non-billable-hours",
    title: "Billable vs non-billable hours",
    seoTitle: "Billable vs Non-Billable Hours: Definitions, Examples, Fixes",
    description:
      "What counts as billable, what does not, why the gap quietly costs you money, and how to shrink it without working more hours.",
    date: "2026-07-27",
    readingMinutes: 7,
    category: "Time tracking",
    load: () => import("@/content/blog/billable-vs-non-billable-hours.mdx"),
  },
  {
    slug: "how-to-track-billable-hours-accurately",
    title: "How to track billable hours accurately",
    seoTitle: "How to Track Billable Hours Accurately (Without the Guesswork)",
    description:
      "Timer vs retroactive timesheets, the habits that keep entries honest, and the five mistakes that make invoices smaller than the work.",
    date: "2026-07-27",
    readingMinutes: 8,
    category: "Time tracking",
    load: () => import("@/content/blog/how-to-track-billable-hours-accurately.mdx"),
  },
  {
    slug: "time-tracking-for-small-agencies",
    title: "Time tracking for small agencies",
    seoTitle: "Time Tracking for Small Agencies: Setup, Reports, Profitability",
    description:
      "How a 2–10 person agency should structure clients, projects and rates so weekly reporting and client-facing summaries take minutes, not hours.",
    date: "2026-07-27",
    readingMinutes: 9,
    category: "Agencies",
    load: () => import("@/content/blog/time-tracking-for-small-agencies.mdx"),
  },
  {
    slug: "self-hosted-time-tracking",
    title: "Self-hosted time tracking: why and how",
    seoTitle: "Self-Hosted Time Tracking: Own Your Data (Setup + Cost Compare)",
    description:
      "Why freelancers under NDA and agencies with client data self-host their tracker, what it actually costs, and how to deploy one in minutes.",
    date: "2026-07-27",
    readingMinutes: 8,
    category: "Self-hosting",
    load: () => import("@/content/blog/self-hosted-time-tracking.mdx"),
  },
];

/** Posts newest-first, for the index page and feeds. */
export const postsByDate: Post[] = [...posts].sort((a, b) => b.date.localeCompare(a.date));

/** Look up a post by slug. Returns undefined for unknown slugs. */
export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
