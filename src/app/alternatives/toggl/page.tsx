import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Logr — The Open-Source, Self-Hostable Toggl Alternative",
  description:
    "Logr is a free, open-source, self-hostable alternative to Toggl Track with built-in invoicing. Track time, bill clients, own your data — AGPL-3.0.",
  alternates: {
    canonical: "https://logr.work/alternatives/toggl",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://logr.work" },
    { "@type": "ListItem", position: 2, name: "Alternatives", item: "https://logr.work/alternatives" },
    { "@type": "ListItem", position: 3, name: "Toggl", item: "https://logr.work/alternatives/toggl" },
  ],
};

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-line flex items-center justify-between px-5 sm:px-8 lg:px-16 h-14">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex items-end gap-[2px]">
          <span className="w-[3px] bg-ink h-[7px]" />
          <span className="w-[3px] bg-ink h-[11px]" />
          <span className="w-[3px] bg-ink h-[8px]" />
          <span className="w-[3px] bg-ink h-[15px]" />
        </div>
        <span className="text-[16px] font-bold tracking-[-0.3px] text-ink">logr.work</span>
      </Link>
      <Link href="/login" className="bg-ink text-white px-4 py-2 text-md font-medium">
        Get started
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-card border-t border-line-2 px-5 sm:px-8 lg:px-16 py-5 flex flex-col sm:flex-row gap-3 items-center justify-between text-md-minus text-tertiary">
      <span>© 2026 logr.work. All rights reserved.</span>
      <div className="flex gap-6">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  );
}

export default function TogglAlternativePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-page min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 px-5 sm:px-8 py-16 flex justify-center">
          <div className="w-full max-w-[800px] flex flex-col gap-8">

            {/* Breadcrumb */}
            <nav className="text-md text-tertiary flex items-center gap-2">
              <Link href="/" className="hover:text-ink">Home</Link>
              <span>›</span>
              <span>Alternatives</span>
              <span>›</span>
              <span className="text-ink">Toggl</span>
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
                The open-source Toggl alternative
              </h1>

              <p className="text-base text-ink leading-relaxed max-w-[640px]">
                Toggl Track is a polished, well-loved time tracker — but it is proprietary,
                cloud-only, and charges per seat as your team grows. Logr is a free,
                open-source alternative built for freelancers and small agencies who want to
                own their data. It ships with a live timeline, per-client billing rates,
                and built-in invoicing so you never need a separate invoice tool. Because
                Logr is self-hostable, your time entries and client data live in your own
                Supabase database — no vendor lock-in, no per-seat pricing, no data brokers.
                The entire codebase is published under the GNU Affero General Public
                License v3.0 (AGPL-3.0), so you can audit, fork, and contribute freely.
              </p>
            </div>

            {/* Comparison table */}
            <div className="bg-card border border-line flex flex-col gap-0">
              <div className="px-8 pt-8 pb-5 border-b border-line">
                <h2 className="text-xl font-semibold text-heading">Logr vs Toggl Track — feature comparison</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-base text-ink">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left px-8 py-4 text-md font-semibold text-heading w-1/2">Feature</th>
                      <th className="text-center px-6 py-4 text-md font-semibold text-money w-1/4">Logr</th>
                      <th className="text-center px-6 py-4 text-md font-semibold text-tertiary w-1/4">Toggl Track</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Open source", true, false],
                      ["Self-hostable", true, false],
                      ["Full data ownership", true, false],
                      ["Built-in invoicing", true, false],
                      ["Per-seat pricing", false, true],
                      ["Import from Toggl CSV", true, false],
                      ["Shareable invoice & report links", true, true],
                      ["Live day timeline", true, true],
                      ["License", "AGPL-3.0", "Proprietary"],
                    ].map(([feature, logr, toggl], i) => (
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
                          {typeof toggl === "boolean" ? (
                            toggl ? (
                              <span className="text-ink font-semibold text-base">✓</span>
                            ) : (
                              <span className="text-placeholder text-base">✗</span>
                            )
                          ) : (
                            <span className="text-md text-tertiary">{toggl}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Switching from Toggl */}
            <div className="bg-card border border-line p-8 sm:p-12 flex flex-col gap-6">
              <h2 className="text-xl font-semibold text-heading">Switching from Toggl Track</h2>
              <p className="text-base text-ink leading-relaxed">
                Migrating from Toggl is straightforward. Logr has a first-class CSV import
                that understands Toggl&apos;s export format — projects, clients, durations, and
                descriptions are all preserved. There is no manual re-entry required.
              </p>

              <ol className="flex flex-col gap-4 list-none">
                {[
                  {
                    step: "1",
                    title: "Export your data from Toggl",
                    body: "In Toggl Track, go to Reports → Detailed → Export as CSV. You can export any date range — export everything for a full migration.",
                  },
                  {
                    step: "2",
                    title: "Import the CSV into Logr",
                    body: "In the Logr dashboard, open the Import panel and drag in your Toggl CSV. Logr maps columns automatically and creates any missing clients or projects.",
                  },
                  {
                    step: "3",
                    title: "Start tracking — your history is intact",
                    body: "All your past time entries appear in Logr immediately. From here you can create invoices from unbilled sessions, share report links with clients, and set per-client billing rates.",
                  },
                ].map(({ step, title, body }) => (
                  <li key={step} className="flex gap-5 items-start">
                    <span className="shrink-0 w-7 h-7 bg-ink text-white text-md font-bold flex items-center justify-center">
                      {step}
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

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
