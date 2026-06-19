/**
 * Competitor data for /alternatives/* pages.
 * Each entry is the single source of truth for SEO metadata, comparison rows,
 * migration steps, and page copy.
 *
 * Competitor pricing/feature claims verified June 2026 against official sources.
 */

export interface ComparisonRow {
  feature: string;
  logr: boolean | string;
  competitor: boolean | string;
}

export interface MigrationStep {
  title: string;
  body: string;
}

export interface Competitor {
  /** URL slug — used as the dynamic route segment */
  slug: string;
  /** Short name used in prose (e.g. "Toggl Track") */
  name: string;
  /** Display name for h1 / page title (e.g. "Toggl") */
  displayName: string;
  /** One-line positioning tagline for the hero badge area */
  tagline: string;
  /** Hero paragraph — 2–4 sentences explaining the comparison */
  heroCopy: string;
  /** Comparison table rows */
  comparisonRows: ComparisonRow[];
  /** Section title for the migration / switching block */
  migrationTitle: string;
  /** Short intro for the migration section */
  migrationIntro: string;
  /** Numbered migration steps */
  migrationSteps: MigrationStep[];
  /** SEO <title> */
  seoTitle: string;
  /** SEO meta description */
  seoDescription: string;
}

export const competitors: Competitor[] = [
  // ─── Toggl ────────────────────────────────────────────────────────────────
  {
    slug: "toggl",
    name: "Toggl Track",
    displayName: "Toggl",
    tagline: "Open source · Self-hostable · AGPL-3.0",
    heroCopy:
      "Toggl Track is a polished, well-loved time tracker — but it is proprietary, " +
      "cloud-only, and charges per seat as your team grows. Logr is a free, " +
      "open-source alternative built for freelancers and small agencies who want to " +
      "own their data. It ships with a live timeline, per-client billing rates, " +
      "and built-in invoicing so you never need a separate invoice tool. Because " +
      "Logr is self-hostable, your time entries and client data live in your own " +
      "Supabase database — no vendor lock-in, no per-seat pricing, no data brokers. " +
      "The entire codebase is published under the GNU Affero General Public " +
      "License v3.0 (AGPL-3.0), so you can audit, fork, and contribute freely.",
    comparisonRows: [
      { feature: "Open source", logr: true, competitor: false },
      { feature: "Self-hostable", logr: true, competitor: false },
      { feature: "Full data ownership", logr: true, competitor: false },
      { feature: "Built-in invoicing", logr: true, competitor: false },
      { feature: "Per-seat pricing", logr: false, competitor: true },
      { feature: "Import from Toggl CSV", logr: true, competitor: false },
      { feature: "Shareable invoice & report links", logr: true, competitor: true },
      { feature: "Live day timeline", logr: true, competitor: true },
      { feature: "License", logr: "AGPL-3.0", competitor: "Proprietary" },
    ],
    migrationTitle: "Switching from Toggl Track",
    migrationIntro:
      "Migrating from Toggl is straightforward. Logr has a first-class CSV import " +
      "that understands Toggl's export format — projects, clients, durations, and " +
      "descriptions are all preserved. There is no manual re-entry required.",
    migrationSteps: [
      {
        title: "Export your data from Toggl",
        body: "In Toggl Track, go to Reports → Detailed → Export as CSV. You can export any date range — export everything for a full migration.",
      },
      {
        title: "Import the CSV into Logr",
        body: "In the Logr dashboard, open the Import panel and drag in your Toggl CSV. Logr maps columns automatically and creates any missing clients or projects.",
      },
      {
        title: "Start tracking — your history is intact",
        body: "All your past time entries appear in Logr immediately. From here you can create invoices from unbilled sessions, share report links with clients, and set per-client billing rates.",
      },
    ],
    seoTitle: "Logr — The Open-Source, Self-Hostable Toggl Alternative",
    seoDescription:
      "Logr is a free, open-source, self-hostable alternative to Toggl Track with built-in invoicing. Track time, bill clients, own your data — AGPL-3.0.",
  },

  // ─── Clockify ─────────────────────────────────────────────────────────────
  {
    slug: "clockify",
    name: "Clockify",
    displayName: "Clockify",
    tagline: "Open source · Self-hostable · AGPL-3.0",
    heroCopy:
      "Clockify offers a generous free tier for time tracking, but the product is " +
      "closed-source, cloud-only, and advanced features like invoicing are locked " +
      "behind paid plans. Logr gives you a fully open-source, self-hostable " +
      "alternative with built-in invoicing included at no cost. Your time entries " +
      "and client data live in your own database under your control, and the " +
      "AGPL-3.0 license means every line of code is publicly auditable. There are " +
      "no feature tiers — every capability is available from day one.",
    comparisonRows: [
      { feature: "Open source", logr: true, competitor: false },
      { feature: "Self-hostable", logr: true, competitor: false },
      { feature: "Full data ownership", logr: true, competitor: false },
      { feature: "Built-in invoicing", logr: true, competitor: "Paid plan" },
      { feature: "Free tier available", logr: true, competitor: true },
      { feature: "Per-seat pricing on paid plans", logr: false, competitor: true },
      { feature: "Shareable invoice & report links", logr: true, competitor: "Reports only (paid)" },
      { feature: "Live day timeline", logr: true, competitor: true },
      { feature: "License", logr: "AGPL-3.0", competitor: "Proprietary" },
    ],
    migrationTitle: "Switching from Clockify",
    migrationIntro:
      "Moving your data from Clockify to Logr takes a few minutes. Export your " +
      "time entries as a CSV and import them directly — Logr handles the column " +
      "mapping automatically.",
    migrationSteps: [
      {
        title: "Export your time entries from Clockify",
        body: "In Clockify, go to Reports → Detailed → Export. Choose CSV format and select the date range you want to migrate.",
      },
      {
        title: "Import into Logr",
        body: "Open the Logr dashboard, navigate to the Import panel, and upload your Clockify CSV. Logr will create any missing clients or projects automatically.",
      },
      {
        title: "Review and start billing",
        body: "Once imported, your historical entries are available immediately. Set per-client billing rates and generate invoices from unbilled sessions in one click.",
      },
    ],
    seoTitle: "Logr — Open-Source Clockify Alternative with Built-in Invoicing",
    seoDescription:
      "Looking for a Clockify alternative? Logr is a free, self-hostable, open-source time tracker with built-in invoicing. Own your data under AGPL-3.0.",
  },

  // ─── Harvest ──────────────────────────────────────────────────────────────
  {
    slug: "harvest",
    name: "Harvest",
    displayName: "Harvest",
    tagline: "Open source · Self-hostable · AGPL-3.0",
    heroCopy:
      "Harvest is a popular choice for time tracking with invoicing, but it comes " +
      "with per-seat pricing that adds up quickly for growing teams, and your data " +
      "lives entirely on Harvest's servers. Logr offers the same core workflow — " +
      "track time, bill clients, send invoices — as a free, open-source, " +
      "self-hostable alternative. With Logr you pay nothing, own your database, and " +
      "can audit or modify the entire codebase under AGPL-3.0. Shareable invoice " +
      "links let clients view their invoices in a browser without creating an account.",
    comparisonRows: [
      { feature: "Open source", logr: true, competitor: false },
      { feature: "Self-hostable", logr: true, competitor: false },
      { feature: "Full data ownership", logr: true, competitor: false },
      { feature: "Built-in invoicing", logr: true, competitor: true },
      { feature: "Per-seat pricing", logr: false, competitor: true },
      { feature: "Shareable invoice & report links", logr: true, competitor: true },
      { feature: "Live day timeline", logr: true, competitor: false },
      { feature: "Free to self-host", logr: true, competitor: false },
      { feature: "License", logr: "AGPL-3.0", competitor: "Proprietary" },
    ],
    migrationTitle: "Switching from Harvest",
    migrationIntro:
      "Harvest lets you export your time entries as CSV files. Logr can import " +
      "those files directly, preserving your project and client history so you " +
      "can continue billing without interruption.",
    migrationSteps: [
      {
        title: "Export your data from Harvest",
        body: "In Harvest, go to Reports → Detailed Report → Export. Download the CSV — you can export all historical data.",
      },
      {
        title: "Import into Logr",
        body: "Open the Import panel in the Logr dashboard and upload your Harvest CSV. Clients and projects are created automatically from the data.",
      },
      {
        title: "Resume billing from where you left off",
        body: "Your time history is in place. Set hourly rates per client, mark entries as billable, and generate your first invoice from unbilled sessions.",
      },
    ],
    seoTitle: "Logr — Free, Open-Source Harvest Alternative with Invoicing",
    seoDescription:
      "Logr is a free, self-hostable, open-source alternative to Harvest. Built-in invoicing, shareable invoice links, and full data ownership under AGPL-3.0.",
  },

  // ─── RescueTime ───────────────────────────────────────────────────────────
  {
    slug: "rescuetime",
    name: "RescueTime",
    displayName: "RescueTime",
    tagline: "Open source · Self-hostable · AGPL-3.0",
    heroCopy:
      "RescueTime focuses on passive, automatic time-tracking and productivity " +
      "analytics — it runs in the background and categorises your computer activity. " +
      "Logr takes a different angle: it is an intentional, manual time tracker " +
      "designed for freelancers and agencies who need to track billable hours per " +
      "client and generate invoices. Where RescueTime tells you how you spent your " +
      "day, Logr helps you bill for it — and because it is open-source and " +
      "self-hostable, your billing data stays in your own database, not on a " +
      "third-party server.",
    comparisonRows: [
      { feature: "Open source", logr: true, competitor: false },
      { feature: "Self-hostable", logr: true, competitor: false },
      { feature: "Full data ownership", logr: true, competitor: false },
      { feature: "Built-in invoicing", logr: true, competitor: false },
      { feature: "Manual / billable time tracking", logr: true, competitor: false },
      { feature: "Passive automatic tracking", logr: false, competitor: true },
      { feature: "Shareable invoice & report links", logr: true, competitor: false },
      { feature: "Free to self-host", logr: true, competitor: false },
      { feature: "License", logr: "AGPL-3.0", competitor: "Proprietary" },
    ],
    migrationTitle: "Moving from RescueTime to Logr",
    migrationIntro:
      "RescueTime and Logr serve different primary purposes, so migration is more " +
      "a workflow shift than a data migration. You start fresh in Logr — creating " +
      "clients, projects, and billing rates — and then track time intentionally " +
      "rather than passively.",
    migrationSteps: [
      {
        title: "Set up clients and projects in Logr",
        body: "Add the clients you bill and create projects for each engagement. Assign hourly rates to each project.",
      },
      {
        title: "Start tracking billable time",
        body: "Use the one-click timer in Logr to record time as you work. Every session is tagged to a client and project automatically.",
      },
      {
        title: "Invoice from unbilled sessions",
        body: "When it is time to bill, Logr collects all unbilled sessions for a client into a draft invoice. Send the client a shareable link — no account required on their end.",
      },
    ],
    seoTitle: "Logr — Open-Source RescueTime Alternative for Billable Time Tracking",
    seoDescription:
      "Need to bill clients, not just track habits? Logr is a free, open-source, self-hostable alternative to RescueTime focused on billable hours and invoicing.",
  },

  // ─── Hubstaff ─────────────────────────────────────────────────────────────
  {
    slug: "hubstaff",
    name: "Hubstaff",
    displayName: "Hubstaff",
    tagline: "Open source · Self-hostable · AGPL-3.0",
    heroCopy:
      "Hubstaff is a workforce management platform with time tracking, employee " +
      "monitoring, and project management features aimed at larger teams. For " +
      "freelancers and small agencies that just need to track hours and send " +
      "invoices, Hubstaff is often overkill — and its per-seat pricing scales " +
      "steeply. Logr focuses on the core workflow: start a timer, track hours " +
      "against a client, and generate an invoice. It is open-source, free to " +
      "self-host, and stores nothing on vendor servers. No employee monitoring, " +
      "no screenshot capture, no unnecessary complexity.",
    comparisonRows: [
      { feature: "Open source", logr: true, competitor: false },
      { feature: "Self-hostable", logr: true, competitor: false },
      { feature: "Full data ownership", logr: true, competitor: false },
      { feature: "Built-in invoicing", logr: true, competitor: true },
      { feature: "Employee monitoring / screenshots", logr: false, competitor: true },
      { feature: "Per-seat pricing", logr: false, competitor: true },
      { feature: "Shareable invoice & report links", logr: true, competitor: false },
      { feature: "Free to self-host", logr: true, competitor: false },
      { feature: "License", logr: "AGPL-3.0", competitor: "Proprietary" },
    ],
    migrationTitle: "Switching from Hubstaff",
    migrationIntro:
      "If you are using Hubstaff primarily for time tracking and invoicing, " +
      "migrating to Logr is straightforward. Export your time entries and import " +
      "them into Logr to preserve your billing history.",
    migrationSteps: [
      {
        title: "Export time entries from Hubstaff",
        body: "In Hubstaff, go to Reports → Time & Activity and export your data as CSV for the date range you want to migrate.",
      },
      {
        title: "Import into Logr",
        body: "Open the Logr dashboard, go to Import, and upload the exported CSV. Logr maps the data to clients and projects automatically.",
      },
      {
        title: "Set billing rates and resume invoicing",
        body: "Configure per-client hourly rates in Logr and generate invoices from unbilled sessions. Share invoice links directly with clients.",
      },
    ],
    seoTitle: "Logr — Open-Source Hubstaff Alternative Without Per-Seat Fees",
    seoDescription:
      "Logr is a free, open-source, self-hostable Hubstaff alternative for freelancers. Built-in invoicing, no employee monitoring, no per-seat pricing.",
  },

  // ─── Kimai ────────────────────────────────────────────────────────────────
  {
    slug: "kimai",
    name: "Kimai",
    displayName: "Kimai",
    tagline: "Open source · Self-hostable · AGPL-3.0",
    heroCopy:
      "Kimai is an established open-source time tracker built with PHP and Symfony, " +
      "requiring a server with PHP and a relational database to self-host. Logr is " +
      "a modern, open-source alternative built on Next.js and Supabase — deployable " +
      "to Vercel, Fly.io, or any Node.js host in minutes, with no PHP runtime " +
      "required. Both tools are AGPL-licensed and self-hostable; Logr differentiates " +
      "with a single-screen interface, built-in shareable invoice links, a live day " +
      "timeline, and a hosted MCP endpoint for AI assistant integration. " +
      "If you want a modern stack you can deploy with one click, Logr is worth a look.",
    comparisonRows: [
      { feature: "Open source", logr: true, competitor: true },
      { feature: "Self-hostable", logr: true, competitor: true },
      { feature: "Full data ownership", logr: true, competitor: true },
      { feature: "Built-in invoicing", logr: true, competitor: true },
      { feature: "Modern stack (Node.js / Next.js)", logr: true, competitor: false }, // Kimai uses PHP/Symfony
      { feature: "One-click cloud deploy", logr: true, competitor: false },
      { feature: "Shareable invoice & report links", logr: true, competitor: false },
      { feature: "Live day timeline", logr: true, competitor: false },
      { feature: "MCP / AI assistant endpoint", logr: true, competitor: false },
      { feature: "License", logr: "AGPL-3.0", competitor: "AGPL-3.0" },
    ],
    migrationTitle: "Switching from Kimai to Logr",
    migrationIntro:
      "Kimai supports CSV and JSON exports of time entries. You can import a CSV " +
      "export into Logr to carry over your time history before switching your " +
      "day-to-day tracking.",
    migrationSteps: [
      {
        title: "Export your data from Kimai",
        body: "In Kimai, go to the Timesheet view and export your entries as CSV. Select the date range covering your full history.",
      },
      {
        title: "Import into Logr",
        body: "Open the Import panel in the Logr dashboard and upload the CSV. Logr creates any missing clients or projects from the data automatically.",
      },
      {
        title: "Deploy Logr and start tracking",
        body: "Click 'Deploy to Vercel' in the Logr GitHub repo, connect your Supabase project, and you are ready. Your imported history is immediately available for invoicing.",
      },
    ],
    seoTitle: "Logr — Modern Open-Source Kimai Alternative (Next.js + Supabase)",
    seoDescription:
      "Logr is a modern, open-source Kimai alternative built on Next.js — deploy to Vercel in one click. AGPL-3.0, self-hostable, with built-in invoicing and shareable links.",
  },
];

/** Look up a competitor by slug. Returns undefined for unknown slugs. */
export function getCompetitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}
