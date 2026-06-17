import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, FileText, BarChart2, Github, Star } from "lucide-react";

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

const comparisonRows: { label: string; logr: ComparisonCell; toggl: ComparisonCell; harvest: ComparisonCell; clockify: ComparisonCell }[] = [
  { label: "Open source",           logr: "✓", toggl: "✗", harvest: "✗", clockify: "✗" },
  { label: "Self-hostable",         logr: "✓", toggl: "✗", harvest: "✗", clockify: "✗" },
  { label: "Time tracking",         logr: "✓", toggl: "✓", harvest: "✓", clockify: "✓" },
  { label: "Invoicing built-in",    logr: "✓", toggl: "✗", harvest: "✓", clockify: "–" },
  { label: "Shareable invoice link",logr: "✓", toggl: "✗", harvest: "✗", clockify: "✗" },
  { label: "Single-screen dashboard",logr:"✓", toggl: "✗", harvest: "✗", clockify: "✗" },
  { label: "Free (self-host)",      logr: "✓", toggl: "–", harvest: "✗", clockify: "✓" },
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
        {/* ── Nav ── */}
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-4">
            <span className="text-lg font-bold text-heading tracking-tight">
              logr
            </span>
            <nav className="flex items-center gap-3">
              <Button variant="outline" size="default" asChild>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Github className="size-4" />
                  GitHub
                </a>
              </Button>
              <Button size="default" asChild>
                <Link href="/app">Get started</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main>
          {/* ── Section 1: Hero ── */}
          <section className="border-b border-line bg-card">
            <div className="mx-auto max-w-[1080px] px-6 py-24 text-center">
              <h1 className="text-hero font-extrabold leading-none tracking-tight text-heading">
                Logr
              </h1>
              <p className="mx-auto mt-4 max-w-[560px] text-5xl font-semibold leading-tight text-heading">
                Open-source, self-hostable time tracking with built-in invoicing
              </p>
              <p className="mx-auto mt-6 max-w-[500px] text-lg text-tertiary">
                Track time, manage clients and projects, build invoices from
                unbilled sessions, and share public payment links — all in one
                place. The Toggl alternative you can actually own.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" asChild>
                  <Link href="/app">Get started free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Star className="size-4" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </section>

          {/* ── Section 2: Definition block (GEO-critical) ── */}
          <section className="border-b border-line bg-wash">
            <div className="mx-auto max-w-[1080px] px-6 py-16">
              <p className="mx-auto max-w-[680px] text-base leading-relaxed text-ink">
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

          {/* ── Section 3: Features grid ── */}
          <section className="border-b border-line bg-card">
            <div className="mx-auto max-w-[1080px] px-6 py-20">
              <h2 className="text-4xl font-bold text-heading">
                Everything in one screen
              </h2>
              <p className="mt-2 text-base text-tertiary">
                Track time, manage clients, build invoices, and share reports —
                without leaving the dashboard.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {features.map(({ icon: Icon, title, description }) => (
                  <Card key={title}>
                    <CardContent className="pt-6">
                      <div className="mb-4 inline-flex bg-wash p-3">
                        <Icon className="size-5 text-ink" />
                      </div>
                      <h3 className="text-base font-semibold text-heading">
                        {title}
                      </h3>
                      <p className="mt-2 text-md text-tertiary">{description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* ── Section 4: Comparison table ── */}
          <section className="border-b border-line bg-wash">
            <div className="mx-auto max-w-[1080px] px-6 py-20">
              <h2 className="text-4xl font-bold text-heading">
                How does Logr compare?
              </h2>
              <p className="mt-2 text-base text-tertiary">
                Logr vs the most popular time-tracking tools on the market.
              </p>

              <div className="mt-10 overflow-x-auto">
                <table className="w-full border-collapse border border-line bg-card text-base">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-5 py-4 text-left text-md font-semibold text-heading">
                        Feature
                      </th>
                      <th className="border-l border-line bg-ink px-5 py-4 text-center text-md font-semibold text-white">
                        Logr
                      </th>
                      <th className="border-l border-line px-5 py-4 text-center text-md font-semibold text-heading">
                        Toggl
                      </th>
                      <th className="border-l border-line px-5 py-4 text-center text-md font-semibold text-heading">
                        Harvest
                      </th>
                      <th className="border-l border-line px-5 py-4 text-center text-md font-semibold text-heading">
                        Clockify
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr
                        key={row.label}
                        className={`border-b border-line ${i % 2 === 1 ? "bg-wash" : "bg-card"}`}
                      >
                        <td className="px-5 py-3 text-md text-ink">
                          {row.label}
                        </td>
                        <td className="border-l border-line bg-ink/5 px-5 py-3 text-center font-semibold text-money">
                          {row.logr}
                        </td>
                        <td className="border-l border-line px-5 py-3 text-center text-tertiary">
                          {row.toggl}
                        </td>
                        <td className="border-l border-line px-5 py-3 text-center text-tertiary">
                          {row.harvest}
                        </td>
                        <td className="border-l border-line px-5 py-3 text-center text-tertiary">
                          {row.clockify}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── Section 5: FAQ ── */}
          <section className="border-b border-line bg-card">
            <div className="mx-auto max-w-[1080px] px-6 py-20">
              <h2 className="text-4xl font-bold text-heading">
                Frequently asked questions
              </h2>

              <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="border border-line bg-wash p-6">
                    <h3 className="text-base font-semibold text-heading">{q}</h3>
                    <p className="mt-3 text-md leading-relaxed text-tertiary">
                      {a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA band ── */}
          <section className="border-b border-line bg-ink">
            <div className="mx-auto max-w-[1080px] px-6 py-20 text-center">
              <h2 className="text-4xl font-bold text-white">
                Own your time data. Ship faster.
              </h2>
              <p className="mx-auto mt-4 max-w-[480px] text-base text-gray-400">
                Logr is free to self-host. Get started in minutes — no credit
                card, no vendor lock-in.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" className="bg-white text-ink hover:bg-gray-100" asChild>
                  <Link href="/app">Launch dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Star className="size-4" />
                    Star on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-line bg-card">
          <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
            <span className="text-md font-bold text-heading">logr</span>
            <nav className="flex flex-wrap items-center gap-6 text-md text-tertiary">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                GitHub
              </a>
              <a
                href="https://github.com/zerox9dev/logr/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                License (AGPL-3.0)
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-ink"
              >
                <Star className="size-3.5" />
                Star on GitHub
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
