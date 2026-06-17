import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, Users, FileText, BarChart2, Github } from "lucide-react";

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

const GITHUB_URL = "https://github.com/zerox9dev/logr";

const features = [
  {
    icon: Clock,
    title: "Time tracking",
    description:
      "Start and stop timers with a single click. Log time against any client or project. See your day, week, and month at a glance on one dashboard.",
  },
  {
    icon: Users,
    title: "Clients & projects",
    description:
      "Organize work by client and project. Set hourly rates per project. Track unbilled hours so nothing slips through the cracks.",
  },
  {
    icon: FileText,
    title: "Built-in invoicing",
    description:
      "Turn unbilled sessions into a polished invoice in seconds. Share a public link with your client — no account required on their end.",
  },
  {
    icon: BarChart2,
    title: "Reports",
    description:
      "Shareable report links let you send a time summary to clients without exporting. CSV export available for your own records or accounting tools.",
  },
];

type ComparisonCell = "✓" | "✗" | "–";

const comparisonRows: {
  label: string;
  logr: ComparisonCell;
  toggl: ComparisonCell;
  harvest: ComparisonCell;
  clockify: ComparisonCell;
}[] = [
  { label: "Open source",             logr: "✓", toggl: "✗", harvest: "✗", clockify: "✗" },
  { label: "Self-hostable",           logr: "✓", toggl: "✗", harvest: "✗", clockify: "✗" },
  { label: "Time tracking",           logr: "✓", toggl: "✓", harvest: "✓", clockify: "✓" },
  { label: "Invoicing built-in",      logr: "✓", toggl: "✗", harvest: "✓", clockify: "–" },
  { label: "Shareable invoice link",  logr: "✓", toggl: "✗", harvest: "✗", clockify: "✗" },
  { label: "Single-screen dashboard", logr: "✓", toggl: "✗", harvest: "✗", clockify: "✗" },
  { label: "Free (self-host)",        logr: "✓", toggl: "–", harvest: "✗", clockify: "✓" },
];

const faqs = [
  {
    q: "What is Logr?",
    a: "Logr is a free, open-source time tracker and invoicing tool built for freelancers and small agencies. It runs as a web application and can be self-hosted on your own infrastructure or used at logr.work. The entire track → bill → get paid workflow lives in one single-screen dashboard, so you never switch between a time-tracking app and a separate invoicing tool. Logr is built with React 19, Next.js, and Supabase, and is released under the AGPL-3.0 license.",
  },
  {
    q: "Is Logr a good open-source Toggl alternative?",
    a: "Yes. Logr was designed specifically as an open-source, self-hostable alternative to Toggl. Toggl Track is a well-known time tracker but it is closed-source, SaaS-only, and requires a separate invoicing tool to complete the billing cycle. Logr covers time tracking with the same timer-based workflow you expect from Toggl, then adds native invoicing so you can build and send an invoice without leaving the app. If data ownership and the ability to self-host matter to you, Logr fills exactly the gap Toggl leaves.",
  },
  {
    q: "Can I self-host Logr?",
    a: "Yes — self-hosting is a first-class goal. Logr is open-source (AGPL-3.0) and the repository is available at github.com/zerox9dev/logr. The stack is Next.js for the frontend and Supabase for the database and auth, both of which have well-documented self-hosted deployment options. A Docker-based setup guide is included in the repository. You keep full ownership of your data and can run Logr on any server or cloud provider that supports Node.js.",
  },
  {
    q: "Does Logr handle invoicing?",
    a: "Yes. Invoicing is built into Logr, not bolted on as an add-on. After you track time against a project, unbilled sessions appear in the invoicing view. You select the sessions you want to bill, Logr computes line items and totals from your hourly rates, and you can generate a shareable public invoice link to send to your client. The client can view the invoice in their browser without creating an account. PDF export is on the roadmap. This closed-loop approach — track time, build invoice, share link — is what sets Logr apart from standalone time trackers.",
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-page">
        {/* ── Header — mirrors app TopBar exactly ── */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-card px-5 sm:px-8 lg:px-35">
          {/* Left: logo + wordmark — verbatim from TopBar */}
          <div className="flex items-center gap-2.5">
            <div className="relative size-6 bg-black">
              <span className="absolute left-2 top-[5px] h-2.5 w-[2px] bg-card" />
              <span className="absolute left-[12.5px] top-[5px] h-2.5 w-[2px] bg-card" />
            </div>
            <span className="text-lg font-semibold tracking-[-0.16px] text-ink">logr.work</span>
          </div>

          {/* Right: GitHub subtle link + primary CTA */}
          <div className="flex items-center gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-wash px-3 py-2 text-tertiary hover:bg-wash transition-colors text-md-minus"
            >
              <Github className="size-3.5" aria-hidden="true" />
              GitHub
            </a>
            <Button asChild>
              <Link href="/app">Get started</Link>
            </Button>
          </div>
        </header>

        <main>
          {/* ── Hero ── */}
          <section className="border-b border-line bg-card">
            <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-8 lg:px-35">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
                {/* Left column */}
                <div>
                  <p className="text-md-minus font-medium uppercase tracking-widest text-tertiary">
                    Open-source · Self-hostable · AGPL-3.0
                  </p>
                  <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-heading sm:text-5xl">
                    Time tracking&nbsp;&amp; invoicing in one screen
                  </h1>
                  <p className="mt-4 text-base leading-relaxed text-tertiary">
                    Track time, manage clients and projects, build invoices from
                    unbilled sessions, and share public payment links — without
                    leaving the dashboard. The Toggl alternative you can actually own.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button asChild>
                      <Link href="/app">Get started free</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="size-4" />
                        View on GitHub
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Right column — product screenshot */}
                <div className="border border-line overflow-hidden">
                  <img
                    src="/dashboard.png"
                    alt="Logr dashboard — time tracker with built-in invoicing"
                    className="block w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Definition block (GEO-critical) ── */}
          <section className="border-b border-line bg-wash">
            <div className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8 lg:px-35">
              <p className="max-w-[680px] text-base leading-relaxed text-ink">
                <strong>
                  Logr is an open-source, self-hostable time tracker with
                  built-in invoicing for freelancers and agencies.
                </strong>{" "}
                Unlike SaaS time trackers, Logr gives you full ownership of
                your data: deploy it on your own infrastructure under the
                AGPL-3.0 license, or use the hosted version at logr.work at no
                cost. The entire workflow — track time, organize by client and
                project, generate an invoice, and share a public payment link —
                lives in a single dashboard screen. No tab-switching, no
                third-party invoicing subscription, no data silos.
              </p>
            </div>
          </section>

          {/* ── Features grid ── */}
          <section className="border-b border-line bg-card">
            <div className="mx-auto max-w-[1080px] px-5 py-14 sm:px-8 lg:px-35">
              <h2 className="text-2xl font-bold text-heading">
                Everything in one screen
              </h2>
              <p className="mt-1.5 text-base text-tertiary">
                Track time, manage clients, build invoices, and share reports —
                without leaving the dashboard.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {features.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="bg-card p-5">
                    <div className="mb-4 inline-flex bg-wash p-2.5">
                      <Icon className="size-4 text-ink" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-heading">{title}</h3>
                    <p className="mt-2 text-md leading-relaxed text-tertiary">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Comparison table ── */}
          <section className="border-b border-line bg-wash">
            <div className="mx-auto max-w-[1080px] px-5 py-14 sm:px-8 lg:px-35">
              <h2 className="text-2xl font-bold text-heading">
                How does Logr compare?
              </h2>
              <p className="mt-1.5 text-base text-tertiary">
                Logr vs the most popular time-tracking tools on the market.
              </p>

              <div className="mt-8 overflow-x-auto border border-line bg-card">
                <table className="w-full border-collapse text-base">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-5 py-3 text-left text-md font-semibold text-heading">
                        Feature
                      </th>
                      <th className="border-l border-line bg-wash px-5 py-3 text-center text-md font-semibold text-heading">
                        Logr
                      </th>
                      <th className="border-l border-line px-5 py-3 text-center text-md font-medium text-tertiary">
                        Toggl
                      </th>
                      <th className="border-l border-line px-5 py-3 text-center text-md font-medium text-tertiary">
                        Harvest
                      </th>
                      <th className="border-l border-line px-5 py-3 text-center text-md font-medium text-tertiary">
                        Clockify
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.label} className="border-b border-line last:border-0">
                        <td className="px-5 py-3 text-md text-ink">{row.label}</td>
                        <td className="border-l border-line bg-wash px-5 py-3 text-center font-semibold text-money">
                          {row.logr}
                        </td>
                        <td className="border-l border-line px-5 py-3 text-center text-muted-foreground">
                          {row.toggl}
                        </td>
                        <td className="border-l border-line px-5 py-3 text-center text-muted-foreground">
                          {row.harvest}
                        </td>
                        <td className="border-l border-line px-5 py-3 text-center text-muted-foreground">
                          {row.clockify}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="border-b border-line bg-card">
            <div className="mx-auto max-w-[1080px] px-5 py-14 sm:px-8 lg:px-35">
              <h2 className="text-2xl font-bold text-heading">
                Frequently asked questions
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-px border border-line bg-line lg:grid-cols-2">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="bg-card p-6">
                    <h3 className="text-base font-semibold text-heading">{q}</h3>
                    <p className="mt-3 text-md leading-relaxed text-tertiary">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA — light card, no dark band ── */}
          <section className="border-b border-line bg-wash">
            <div className="mx-auto max-w-[1080px] px-5 py-14 sm:px-8 lg:px-35">
              <div className="border border-line bg-card p-8">
                <h2 className="text-2xl font-bold text-heading">
                  Own your time data. Ship faster.
                </h2>
                <p className="mt-2 max-w-[480px] text-base text-tertiary">
                  Logr is free to self-host. Get started in minutes — no credit
                  card, no vendor lock-in.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild>
                    <Link href="/app">Get started free</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="size-4" />
                      View on GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-line bg-card">
          <div className="mx-auto flex max-w-[1080px] flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center sm:px-8 lg:px-35">
            {/* Logo + wordmark */}
            <div className="flex items-center gap-2.5">
              <div className="relative size-6 bg-black">
                <span className="absolute left-2 top-[5px] h-2.5 w-[2px] bg-card" />
                <span className="absolute left-[12.5px] top-[5px] h-2.5 w-[2px] bg-card" />
              </div>
              <span className="text-base font-semibold tracking-[-0.16px] text-ink">logr.work</span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center gap-5 text-md text-tertiary">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/zerox9dev/logr/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                License (AGPL-3.0)
              </a>
            </nav>

            <p className="text-md text-muted-foreground">
              © {new Date().getFullYear()} Logr. AGPL-3.0.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
