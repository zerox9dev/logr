import Link from "next/link";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Logr",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://logr.work",
    description:
      "Logr is an open-source, self-hostable time tracker with built-in invoicing for freelancers and agencies. Track time, manage clients and projects, build invoices from unbilled sessions, and share public invoice links — all in one single-screen dashboard.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    softwareVersion: "1.0",
    softwareRequirements: "Web browser",
    author: {
      "@type": "Organization",
      name: "Logr",
      url: "https://logr.work",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Logr",
    url: "https://logr.work",
    sameAs: ["https://github.com/zerox9dev/logr"],
    description:
      "Open-source time tracking and invoicing for freelancers and agencies.",
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

        {/* ── Footer ── */}
        <footer className="bg-card border-t border-line-2 px-5 sm:px-8 lg:px-35 py-5 flex flex-col sm:flex-row gap-3 items-center justify-between text-md-minus text-tertiary">
          <span>© 2026 logr.work. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
            <a href="#">Status</a>
          </div>
        </footer>
      </div>
    </>
  );
}
