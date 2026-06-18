import Link from "next/link";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://logr.work/#software",
    name: "Logr",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://logr.work",
    description:
      "Logr is an open-source, self-hostable time tracker with built-in invoicing for freelancers and agencies. Track time, manage clients and projects, build invoices from unbilled sessions, and share public invoice links — all in one single-screen dashboard.",
    screenshot: "https://logr.work/logr.png",
    featureList: [
      "Time tracking",
      "Clients & projects",
      "Invoicing",
      "Shareable reports",
      "Daily AI recap",
      "Self-hostable",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
    },
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    softwareVersion: "1.0",
    softwareRequirements: "Web browser",
    author: {
      "@type": "Organization",
      "@id": "https://logr.work/#organization",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://logr.work/#organization",
    name: "Logr",
    url: "https://logr.work",
    logo: "https://logr.work/logr.png",
    sameAs: ["https://github.com/zerox9dev/logr"],
    description:
      "Open-source time tracking and invoicing for freelancers and agencies.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://logr.work/#website",
    name: "Logr",
    url: "https://logr.work",
    publisher: { "@id": "https://logr.work/#organization" },
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-card">
        {/* ── Header ── */}
        <header className="sticky top-0 z-30 bg-card border-b border-line flex items-center justify-between px-5 sm:px-8 lg:px-35 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-end gap-[2px]">
              <span className="w-[3px] bg-ink h-[7px]" />
              <span className="w-[3px] bg-ink h-[11px]" />
              <span className="w-[3px] bg-ink h-[8px]" />
              <span className="w-[3px] bg-ink h-[15px]" />
            </div>
            <span className="text-[16px] font-bold tracking-[-0.3px] text-ink">logr.work</span>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-1.5">
            <Link href="/login" className="px-4 py-2 text-md font-medium text-ink">
              Log in
            </Link>
            <Link href="/login" className="bg-ink text-white px-4 py-2 text-md font-medium">
              Sign up
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="bg-page flex flex-col items-center text-center pt-24 pb-[72px] px-6 sm:px-10 gap-6">
          {/* Eyebrow */}
          <div className="inline-flex gap-2 items-center px-3 py-1.5">
            <svg viewBox="0 0 8 8" className="size-2 shrink-0">
              <circle cx="4" cy="4" r="4" fill="#18181b" />
            </svg>
            <span className="text-md-minus font-medium text-dark-1">Self-hostable · Open source</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-hero leading-[1.04] text-heading max-w-[880px]">
            Track every hour.<br />Bill every minute.
          </h1>

          {/* Subtext */}
          <p className="text-[18px] leading-[1.5] text-[#52525b] max-w-[604px]">
            A clean, self-hostable time tracker for people who bill by the hour. Start a timer, watch your day take shape, and invoice in one click.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href="/login"
              className="bg-heading text-white px-[30px] py-[11px] text-base font-semibold"
            >
              Start tracking — free
            </Link>
            <Link
              href="/app"
              className="bg-card border border-gray-300 px-[22px] py-[11px] text-base font-medium text-heading"
            >
              Live demo
            </Link>
          </div>

          <p className="text-sm text-placeholder">No card required · Your data stays yours</p>

          {/* Spacer */}
          <div className="h-6" />

          {/* Product Mockup */}
          <div className="w-full max-w-[920px] flex flex-col gap-2">
            {/* Time-tracker card */}
            <div className="bg-card border border-line p-6 flex flex-col gap-4">
              {/* Top row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Timer block */}
                <div className="flex items-center gap-3 flex-wrap">
                  <svg viewBox="0 0 9 9" className="shrink-0" width="9" height="9">
                    <circle cx="4.5" cy="4.5" r="4.5" fill="#a1a1aa" />
                  </svg>
                  <span className="font-bold text-hero tracking-[2px] text-placeholder tnum">00:00:00</span>
                  <span className="bg-page px-[11px] py-1 text-sm font-semibold text-placeholder">—/hr</span>
                  <span className="text-base font-semibold text-placeholder">$0.00 earned</span>
                </div>
                {/* Actions */}
                <div className="flex gap-2.5 items-center">
                  <button className="bg-money text-white px-[30px] py-[11px] text-base font-semibold">
                    Start
                  </button>
                  <button className="bg-card border border-gray-300 h-10 px-[22px] inline-flex items-center text-md font-medium text-ink">
                    Manual
                  </button>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center gap-2.5">
                <div className="bg-purple-soft inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5">
                  <span className="w-4 h-3 bg-timeline shrink-0" />
                  <span className="text-md font-semibold text-heading">Select project</span>
                </div>
                <span className="text-base text-muted-foreground">›</span>
                <span className="text-base font-medium text-heading">No task selected</span>
              </div>
            </div>

            {/* Timeline card */}
            <div className="bg-card border border-line p-6 flex flex-col gap-[18px]">
              <p className="text-[18px] font-semibold text-heading">Timeline</p>

              {/* Bar */}
              <div className="relative h-2.5 w-full bg-grid">
                <span className="absolute top-0 h-2.5 bg-timeline" style={{ left: "2.05%", width: "16.9%" }} />
                <span className="absolute top-0 h-2.5 bg-placeholder" style={{ left: "21%", width: "5.3%" }} />
                <span className="absolute top-0 h-2.5 bg-timeline" style={{ left: "29%", width: "9.7%" }} />
                <span className="absolute top-0 h-2.5 bg-error-soft" style={{ left: "47.3%", width: "8%" }} />
                <span className="absolute top-0 h-2.5 bg-timeline" style={{ left: "56.2%", width: "18.5%" }} />
                <span className="absolute top-0 h-2.5 bg-placeholder" style={{ left: "76.3%", width: "7%" }} />
                <span className="absolute top-0 h-2.5 bg-timeline" style={{ left: "85.1%", width: "14.9%" }} />
              </div>

              {/* Axis */}
              <div className="flex justify-between text-sm-minus text-muted-foreground tnum">
                <span>09:00</span>
                <span>11:00</span>
                <span>13:00</span>
                <span>15:00</span>
                <span>17:00</span>
                <span>19:00</span>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-[18px] items-center">
                <div className="flex gap-1.5 items-center">
                  <span className="w-[10px] h-[10px] bg-timeline shrink-0" />
                  <span className="text-sm text-timeline">Focus · 5h 41m</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className="w-[10px] h-[10px] bg-placeholder shrink-0" />
                  <span className="text-sm text-placeholder">Meetings · 1h 10m</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className="w-[10px] h-[10px] bg-error-soft shrink-0" />
                  <span className="text-sm text-error-soft">Breaks · 45m</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="bg-card px-6 sm:px-10 py-20 flex justify-center">
          <div className="w-full max-w-[920px] grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {/* Feature 1 */}
            <div className="flex flex-col gap-3 items-start">
              <svg viewBox="0 0 8 8" className="size-2 shrink-0">
                <circle cx="4" cy="4" r="4" fill="#18181b" />
              </svg>
              <h3 className="text-lg font-semibold text-heading">Live timeline</h3>
              <p className="text-md text-tertiary leading-relaxed">Your day, visualized as you track it — no manual logging.</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-3 items-start">
              <svg viewBox="0 0 8 8" className="size-2 shrink-0">
                <circle cx="4" cy="4" r="4" fill="#16a34a" />
              </svg>
              <h3 className="text-lg font-semibold text-heading">Billable by client</h3>
              <p className="text-md text-tertiary leading-relaxed">Rates, earnings and invoices, all in one place.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-3 items-start">
              <svg viewBox="0 0 8 8" className="size-2 shrink-0">
                <circle cx="4" cy="4" r="4" fill="#7c3aed" />
              </svg>
              <h3 className="text-lg font-semibold text-heading">Daily AI recap</h3>
              <p className="text-md text-tertiary leading-relaxed">See where your focus actually went, every day.</p>
            </div>
          </div>
        </section>

        {/* ── What is Logr ── */}
        <section className="bg-page px-6 sm:px-10 py-20 flex justify-center">
          <div className="w-full max-w-[1080px] bg-card border border-line p-10 sm:p-14 flex flex-col gap-5">
            <h2 className="font-display text-[28px] leading-[1.1] text-heading">What is Logr?</h2>
            <p className="text-base leading-[1.7] text-tertiary max-w-[680px]">
              Logr is an open-source, self-hostable time tracker with built-in invoicing for freelancers and agencies. Hit start on the one-click timer and every second is captured against the client and project you choose — each with its own hourly rate. When you are ready to bill, Logr collects every unbilled session into a draft invoice in seconds. Send your client a shareable invoice link they can open in any browser, no account required. The entire product lives on a single screen: timer, timeline, clients, projects, and invoices in one place, with nothing hidden behind nested menus. Logr is licensed under AGPL-3.0 and built on React, Next.js, and Supabase. You can self-host it for free on any infrastructure that runs Node.js, or use the hosted version at logr.work.
            </p>
          </div>
        </section>

        {/* ── Comparison ── */}
        <section className="bg-card px-6 sm:px-10 py-20 flex justify-center">
          <div className="w-full max-w-[1080px] flex flex-col gap-8">
            <h2 className="font-display text-[28px] leading-[1.1] text-heading">How does Logr compare?</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-base">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left py-3 pr-6 font-semibold text-heading w-[220px]">Feature</th>
                    <th className="py-3 px-4 font-semibold text-heading bg-wash text-center">Logr</th>
                    <th className="py-3 px-4 font-medium text-tertiary text-center">Toggl</th>
                    <th className="py-3 px-4 font-medium text-tertiary text-center">Harvest</th>
                    <th className="py-3 px-4 font-medium text-tertiary text-center">Clockify</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Open source", true, false, false, false],
                    ["Self-hostable", true, false, false, false],
                    ["Time tracking", true, true, true, true],
                    ["Invoicing built-in", true, false, true, false],
                    ["Shareable invoice links", true, false, false, false],
                    ["Single-screen", true, false, false, false],
                    ["Free (self-host)", true, "Partial", "Partial", "Partial"],
                  ].map(([label, logr, toggl, harvest, clockify]) => (
                    <tr key={String(label)} className="border-b border-line last:border-0">
                      <td className="py-3 pr-6 text-tertiary">{label}</td>
                      <td className="py-3 px-4 text-center bg-wash font-semibold text-money">
                        {logr === true ? "✓" : logr === false ? <span className="text-muted-foreground">✗</span> : <span className="text-muted-foreground">{logr}</span>}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {toggl === true ? "✓" : toggl === false ? "✗" : toggl}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {harvest === true ? "✓" : harvest === false ? "✗" : harvest}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {clockify === true ? "✓" : clockify === false ? "✗" : clockify}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Self-host in minutes ── */}
        <section className="bg-page px-6 sm:px-10 py-20 flex justify-center">
          <div className="w-full max-w-[1080px] bg-card border border-line p-10 sm:p-14 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-[28px] leading-[1.1] text-heading">Self-host in minutes</h2>
              <p className="text-base text-tertiary">Logr is licensed under{" "}
                <a
                  href="https://www.gnu.org/licenses/agpl-3.0.html"
                  className="underline text-ink"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AGPL-3.0
                </a>
                {" "}— free to run on your own infrastructure.
              </p>
            </div>
            <ol className="flex flex-col gap-6">
              <li className="flex gap-5 items-start">
                <span className="shrink-0 w-7 h-7 bg-ink text-white text-sm font-semibold flex items-center justify-center">1</span>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-heading">Deploy to Vercel</p>
                  <p className="text-base text-tertiary leading-relaxed">Click &ldquo;Deploy&rdquo; in the GitHub repo and Vercel will build and host Logr for you in under two minutes.</p>
                </div>
              </li>
              <li className="flex gap-5 items-start">
                <span className="shrink-0 w-7 h-7 bg-ink text-white text-sm font-semibold flex items-center justify-center">2</span>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-heading">Connect a Supabase project</p>
                  <p className="text-base text-tertiary leading-relaxed">Create a free Supabase project, paste the URL and anon key into Vercel environment variables, and run the included migrations.</p>
                </div>
              </li>
              <li className="flex gap-5 items-start">
                <span className="shrink-0 w-7 h-7 bg-ink text-white text-sm font-semibold flex items-center justify-center">3</span>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-heading">Sign in and track</p>
                  <p className="text-base text-tertiary leading-relaxed">Open your deployment, create your account, add a client, and start your first timer. Everything is ready to go.</p>
                </div>
              </li>
            </ol>
            <div className="pt-2">
              <a
                href="https://github.com/zerox9dev/logr"
                className="inline-flex items-center gap-2 bg-heading text-white px-5 py-2.5 text-base font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-card px-6 sm:px-10 py-20 flex justify-center">
          <div className="w-full max-w-[1080px] flex flex-col gap-10">
            <h2 className="font-display text-[28px] leading-[1.1] text-heading">Frequently asked questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-heading">Is Logr free?</h3>
                <p className="text-base text-tertiary leading-relaxed">
                  Yes. Logr is open source under AGPL-3.0, which means you can self-host it at zero cost on any infrastructure you choose. The hosted version at logr.work is also free to use. There is no paid tier, no feature gating, and no hidden seats pricing. Your data stays in the Supabase project you control.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-heading">Is Logr a good open-source Toggl alternative?</h3>
                <p className="text-base text-tertiary leading-relaxed">
                  If you need time tracking with invoicing that you can fully control, yes. Toggl Track is a solid product but it is closed source, cloud-only, and invoicing requires a paid plan. Logr covers the same core workflow — timer, projects, clients, reports — and adds invoice generation and shareable invoice links out of the box, with no subscription required.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-heading">Can I self-host Logr?</h3>
                <p className="text-base text-tertiary leading-relaxed">
                  Absolutely. Logr is designed to be self-hosted. The stack is Next.js for the frontend and API routes, and Supabase (Postgres + Auth + Storage) for the database. Deploy the Next.js app anywhere that supports Node.js — Vercel, Fly.io, a VPS — point it at your own Supabase project, run the migrations, and you have a fully private instance. Instructions are in the GitHub repo.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-heading">Does Logr handle invoicing?</h3>
                <p className="text-base text-tertiary leading-relaxed">
                  Yes. Invoicing is built into Logr, not bolted on. Every time entry is tagged as billable or non-billable. When you are ready to invoice a client, Logr collects all unbilled sessions into a draft invoice automatically. You can adjust line items, add a note, and send the client a public link — they can view and download the invoice without creating an account.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-heading">Can I import from Toggl?</h3>
                <p className="text-base text-tertiary leading-relaxed">
                  Yes. Logr supports importing time entries from a Toggl CSV export. Go to Settings, choose Import, upload your Toggl CSV, and Logr will map the entries to your existing clients and projects. It is a one-time migration path, so you do not lose historical data when you switch.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-heading">Does Logr work for agencies?</h3>
                <p className="text-base text-tertiary leading-relaxed">
                  Yes. Logr is built around a clients-and-projects model that suits agencies well. Each client can have multiple projects, each project carries its own hourly rate, and reports can be filtered and shared per client. You can generate separate invoices for each client from a single account, making it straightforward to manage billing across a portfolio of ongoing engagements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-card border-t border-line-2 px-5 sm:px-8 lg:px-35 py-5 flex flex-col sm:flex-row gap-3 items-center justify-between text-md-minus text-tertiary">
          <span>© 2026 logr.work. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy#cookies">Cookies</Link>
            <a href="#">Status</a>
            <a
              href="https://github.com/zerox9dev/logr"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
