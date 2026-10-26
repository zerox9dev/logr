import Link from "next/link";
import {
  Bot,
  Download,
  FileText,
  Github,
  Layers,
  Link2,
  ListChecks,
  MessageCircle,
  PencilLine,
  Receipt,
  Server,
  Share2,
  Timer,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { postsByDate } from "@/data/posts";
import {
  Band,
  CheckList,
  CtaBand,
  EventChip,
  GITHUB_URL,
  Keycap,
  PillLink,
  SectionHeading,
  Sticker,
  type Tone,
} from "@/components/marketing/primitives";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { ComparisonTable, type Cell } from "@/components/marketing/comparison-table";
import { PostCards, RowHeading } from "@/components/marketing/post-cards";
import { FeatureTabs } from "@/components/marketing/feature-tabs";
import { TryIt } from "@/components/marketing/try-it";
import {
  AssistantDemo,
  CommandDemo,
  ImportDemo,
  InvoiceDemo,
  ManualDemo,
  RatesDemo,
  ReportDemo,
  ShareDemo,
  TimelineDemo,
  TimerDemo,
} from "@/components/marketing/demos";

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
      "Logr is an open-source, self-hostable time tracker with built-in invoicing for freelancers and agencies. Track time, manage clients and projects, build invoices from unbilled sessions, and share public invoice links — all from one fast workspace with instant client-side navigation.",
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

/* ── Hero ──────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section data-testid="home-hero" className="mx-auto w-full max-w-[1080px] px-6 pt-16 pb-16 md:px-10 lg:pt-24">
      <p className="font-mono text-[12px] font-medium tracking-[0.08em] text-heading/45 uppercase">
        Open source · Self-hostable · AGPL-3.0
      </p>
      <h1 className="mt-5 text-[46px] leading-[1.06] font-semibold tracking-[-0.05em] sm:text-[64px] lg:text-[68px]">
        Track{" "}
        <span className="whitespace-nowrap">
          every <Sticker inline icon={Timer} tone="coral" tilt="-rotate-6" />
        </span>{" "}
        hour, <br className="max-lg:hidden" />
        bill{" "}
        <span className="whitespace-nowrap">
          every <Sticker inline icon={Receipt} tone="green" tilt="rotate-6" />
        </span>{" "}
        minute.
      </h1>
      <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <p className="max-w-[540px] text-[18px] leading-[1.55] text-heading/60">
          A clean, self-hostable time tracker for people who bill by the hour. Start a timer, watch your day take
          shape, and invoice in one click.
        </p>
        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap items-center gap-3">
            <PillLink href="/login">Start tracking — free</PillLink>
            <PillLink href="/app" tone="soft">
              Live demo
            </PillLink>
          </div>
          <p className="text-[13px] text-heading/45">No card required · Your data stays yours</p>
        </div>
      </div>
    </section>
  );
}

function TryItBand() {
  return (
    <section className="relative max-md:hidden">
      <Band className="flex items-center justify-center gap-3 py-3.5">
        <span className="rounded-full bg-heading px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-[0.08em] text-white uppercase">
          Try it
        </span>
        <span className="text-[13px] text-heading/55">
          Pick a project, press Start, then switch projects — every session lands in today&apos;s list.
        </span>
      </Band>
      <Band>
        <TryIt />
      </Band>
    </section>
  );
}

/* ── Feature tabs ──────────────────────────────────────────────────────── */

function TrackSection() {
  return (
    <section>
      <Band className="px-6 py-20 md:px-10">
        <SectionHeading id="features" eyebrow="Track your day" title="Every hour, accounted for">
          A timer, a timeline and a keyboard — nothing between you and the work.
        </SectionHeading>
      </Band>
      <Band>
        <FeatureTabs
          id="track"
          features={[
            {
              title: "Start a timer in one click",
              body: "Pick a client and project, press Start. Each project carries its own rate, so earnings add up as you work.",
              tint: "var(--color-tint-peach)",
              marker: <Sticker small icon={Timer} tone="coral" />,
              demo: <TimerDemo />,
            },
            {
              title: "Add the time you forgot",
              body: "Log a session after the fact — date, start, end, project — and it lands on the right day.",
              tint: "var(--color-tint-mint)",
              marker: <Sticker small icon={PencilLine} tone="green" />,
              demo: <ManualDemo />,
            },
            {
              title: "Watch your day take shape",
              body: "A live timeline shows where the hours went, split by project, as you track them.",
              tint: "var(--color-tint-lilac)",
              marker: <Sticker small icon={TrendingUp} tone="violet" />,
              demo: <TimelineDemo />,
            },
            {
              title: "Jump anywhere with ⌘K",
              body: "Type what you want — a client, a report, a new invoice — and go straight there.",
              tint: "var(--color-tint-sky)",
              marker: <Keycap>⌘K</Keycap>,
              demo: <CommandDemo />,
            },
            {
              title: "Bring your Toggl history",
              body: "Upload a Toggl CSV export and Logr maps every entry to your clients and projects.",
              tint: "var(--color-tint-cream)",
              marker: <Sticker small icon={Upload} tone="amber" />,
              demo: <ImportDemo />,
            },
          ]}
        />
      </Band>
    </section>
  );
}

function BillSection() {
  return (
    <section>
      <Band className="px-6 py-20 md:px-10">
        <SectionHeading id="invoicing" eyebrow="Bill your clients" title="From tracked hours to a paid invoice">
          Rates, invoices and reports live next to the timer — not in a second tool.
        </SectionHeading>
      </Band>
      <Band>
        <FeatureTabs
          id="bill"
          flip
          features={[
            {
              title: "Rates per client and project",
              body: "Set an hourly rate once. Every session is priced the moment it is tracked.",
              tint: "var(--color-tint-lilac)",
              marker: <Sticker small icon={Wallet} tone="violet" />,
              demo: <RatesDemo />,
            },
            {
              title: "Invoice from unbilled time",
              body: "Logr gathers every unbilled session for a client into a draft invoice. Adjust lines, add a note, done.",
              tint: "var(--color-tint-cream)",
              marker: <Sticker small icon={Receipt} tone="amber" />,
              demo: <InvoiceDemo />,
            },
            {
              title: "Share a link, no account needed",
              body: "Send a public invoice link. Your client opens it in any browser — no sign-up, no login.",
              tint: "var(--color-tint-peach)",
              marker: <Sticker small icon={Link2} tone="coral" />,
              demo: <ShareDemo />,
            },
            {
              title: "Reports you can send",
              body: "Pick a range, filter by client, and copy a public report link to back up the invoice.",
              tint: "var(--color-tint-sky)",
              marker: <Sticker small icon={Share2} tone="blue" />,
              demo: <ReportDemo />,
            },
            {
              title: "Ask the assistant",
              body: "Ask about your hours in plain words. Self-hosters switch it on with an Anthropic API key.",
              tint: "var(--color-tint-mint)",
              marker: <Sticker small icon={Bot} tone="green" />,
              demo: <AssistantDemo />,
            },
          ]}
        />
      </Band>
    </section>
  );
}

/* ── Self-host in three steps ──────────────────────────────────────────── */

const STEPS: { title: string; body: string; tint: string; scene: React.ReactNode }[] = [
  {
    title: "Deploy to Vercel",
    body: "Click Deploy in the GitHub repo. Vercel builds and hosts Logr in under two minutes.",
    tint: "var(--color-tint-sky)",
    scene: (
      <div className="w-[220px] rounded-2xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(20,20,20,0.25)] ring-1 ring-heading/6">
        <span className="flex h-9 items-center justify-center gap-2 rounded-full bg-heading text-[12.5px] font-semibold text-white">
          <Github className="size-3.5" /> Deploy
        </span>
        <p className="mt-3 flex items-center justify-between text-[12px] text-heading/60">
          logr-yourname.vercel.app <span className="font-medium text-[#2e9b5f]">Ready</span>
        </p>
      </div>
    ),
  },
  {
    title: "Point it at PocketBase",
    body: "Run PocketBase anywhere and set POCKETBASE_URL. Bundled migrations create the schema on first boot.",
    tint: "var(--color-tint-mint)",
    scene: (
      <div className="w-[220px] rounded-2xl bg-white p-3 font-mono text-[11px] shadow-[0_8px_24px_-12px_rgba(20,20,20,0.25)] ring-1 ring-heading/6">
        <p className="text-heading/45"># .env</p>
        <p>
          POCKETBASE_URL=<span className="text-[#1d5e3a]">https://pb.you.dev</span>
        </p>
        <p>
          ANTHROPIC_API_KEY=<span className="text-heading/40">optional</span>
        </p>
      </div>
    ),
  },
  {
    title: "Sign in and track",
    body: "Create your account, add a client, start your first timer. Everything is ready to go.",
    tint: "var(--color-tint-peach)",
    scene: (
      <div className="flex w-[220px] flex-col gap-1.5 rounded-2xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(20,20,20,0.25)] ring-1 ring-heading/6">
        <EventChip tone="violet" title="Acme · Website" time="00:12:48 · running" />
        <EventChip tone="green" title="Northwind · Audit" time="1h 30m · $180.00" />
      </div>
    ),
  },
];

function SelfHostSection() {
  return (
    <section>
      <Band className="px-6 py-20 md:px-10">
        <SectionHeading id="self-host" eyebrow="Self-host" title="Your server in three steps">
          Logr is licensed under AGPL-3.0 — free to run on your own infrastructure.
        </SectionHeading>
      </Band>
      <Band className="grid gap-px bg-heading/8 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex flex-col bg-white">
            <div className="px-8 pt-8 pb-7 md:min-h-[172px]">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-heading text-[13px] font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="text-[18px] font-semibold tracking-[-0.02em]">{s.title}</h3>
              </div>
              <p className="mt-2 text-[15px] leading-[1.5] text-heading/60 md:pl-10">{s.body}</p>
            </div>
            <div style={{ backgroundColor: s.tint }} className="flex flex-1 items-center justify-center px-6 py-8">
              {s.scene}
            </div>
          </div>
        ))}
      </Band>
    </section>
  );
}

/* ── Details grid ──────────────────────────────────────────────────────── */

const DETAILS: { title: string; body: string; icon?: typeof Timer; tone?: Tone; keycap?: string }[] = [
  { title: "Clients and projects", body: "Each client holds many projects, each with its own rate.", icon: Users, tone: "violet" },
  { title: "Command menu", body: "Press ⌘K to reach any page or action without the mouse.", keycap: "⌘K" },
  { title: "Billable vs internal", body: "The dashboard splits billable hours from internal ones, so you see what pays.", icon: ListChecks, tone: "green" },
  { title: "Invoice history", body: "Every invoice, its status and its total, one click from the sidebar.", icon: FileText, tone: "coral" },
  { title: "Toggl import", body: "Move years of history over from a Toggl CSV export in one go.", icon: Download, tone: "amber" },
  { title: "Jira worklogs", body: "Connect Jira Cloud and your sessions land there as worklogs.", icon: Layers, tone: "blue" },
  { title: "AI project suggestions", body: "Describe what you are doing; Logr suggests the project from your history.", icon: MessageCircle, tone: "violet" },
  { title: "Your data, your server", body: "Self-host with PocketBase. Your time entries never touch our servers.", icon: Server, tone: "green" },
];

function DetailsSection() {
  return (
    <section>
      <Band className="px-6 py-20 md:px-10">
        <SectionHeading eyebrow="The details" title="More features you will use every day" />
      </Band>
      <Band className="grid gap-px bg-heading/8 md:grid-cols-2">
        {DETAILS.map((d) => (
          <div key={d.title} className="group grid grid-cols-[48px_1fr] items-start gap-4 bg-white px-6 py-6 md:px-8">
            <div className="flex h-10 items-center">
              {d.keycap ? (
                <Keycap>{d.keycap}</Keycap>
              ) : d.icon ? (
                <Sticker icon={d.icon} tone={d.tone ?? "green"} className="group-hover:-translate-y-0.5 group-hover:-rotate-6" />
              ) : null}
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.01em]">{d.title}</h3>
              <p className="mt-1 text-[14px] leading-[1.5] text-heading/60">{d.body}</p>
            </div>
          </div>
        ))}
      </Band>
    </section>
  );
}

/* ── Comparison ────────────────────────────────────────────────────────── */

const COMPARISON: [string, ...Cell[]][] = [
  ["Open source", true, false, false, false],
  ["Self-hostable", true, false, false, false],
  ["Time tracking", true, true, true, true],
  ["Invoicing built-in", true, false, true, false],
  ["Shareable invoice links", true, false, false, false],
  ["Instant, no-reload navigation", true, false, false, false],
  ["Free (self-host)", true, "Partial", "Partial", "Partial"],
];

function ComparisonSection() {
  return (
    <section>
      <Band className="px-6 py-20 md:px-10">
        <SectionHeading eyebrow="Compare" title="How does Logr compare?">
          The workflow of Toggl, Harvest and Clockify — with the source code and the database in your hands.
        </SectionHeading>
      </Band>
      <ComparisonTable columns={["Logr", "Toggl", "Harvest", "Clockify"]} rows={COMPARISON} />
    </section>
  );
}

/* ── Pricing ───────────────────────────────────────────────────────────── */

function PricingSection() {
  return (
    <section>
      <Band className="px-6 py-20 md:px-10">
        <SectionHeading id="pricing" eyebrow="Pricing" title="Free. Really.">
          No paid tier, no feature gating, no seat pricing. Use logr.work, or run it yourself.
        </SectionHeading>
      </Band>
      <Band className="grid gap-px bg-heading/8 md:grid-cols-2">
        <div className="flex flex-col bg-tint-peach px-6 py-10 md:px-10">
          <p className="text-[15px] font-semibold">Hosted or self-hosted</p>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="text-[64px] leading-none font-semibold tracking-[-0.04em]">$0</span>
            <span className="text-[15px] text-heading/55">forever</span>
          </p>
          <p className="mt-3 text-[14px] text-heading/55">AGPL-3.0. Every feature, for any team size.</p>
          <div className="mt-auto flex flex-col gap-3 pt-12">
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-full bg-heading text-[15px] font-semibold text-white transition-[opacity,scale] duration-150 hover:opacity-85 active:scale-[0.97]"
            >
              Start tracking — free
            </Link>
            <p className="text-center text-[13px] text-heading/45">No card required.</p>
          </div>
        </div>
        <div className="bg-white px-6 py-10 md:px-10">
          <p className="text-[15px] font-semibold">Everything included</p>
          <div className="mt-6">
            <CheckList
              items={[
                "Unlimited clients, projects and sessions",
                "Invoices built from unbilled time",
                "Public invoice and report links",
                "Toggl CSV import",
                "Jira integration",
                "AI assistant with your own Anthropic key",
                "Self-hosting with Docker Compose or Vercel",
              ]}
            />
          </div>
          <p className="mt-8 text-[14px] leading-[1.55] text-heading/55">
            Timer, timeline, reports and the command menu are included too.
          </p>
        </div>
      </Band>
    </section>
  );
}

/* ── Blog ──────────────────────────────────────────────────────────────── */

function BlogSection() {
  return (
    <section>
      <RowHeading
        eyebrow="From the blog"
        title="Guides for people who bill by the hour"
        link={{ href: "/blog", label: "All articles" }}
      />
      <PostCards posts={postsByDate.slice(0, 3)} />
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────────────────────────────── */

const FAQ = [
  {
    question: "What is Logr?",
    answer:
      "Logr is an open-source, self-hostable time tracker with built-in invoicing for freelancers and agencies. Hit start on the one-click timer and every second is captured against the client and project you choose — each with its own hourly rate. When you are ready to bill, Logr collects every unbilled session into a draft invoice in seconds. Send your client a shareable invoice link they can open in any browser, no account required. The whole product sits behind one sidebar — dashboard, projects, sessions, clients, invoices, reports, and settings — and every section is one click away, loaded client-side with no page reloads and nothing buried in nested menus. Logr is licensed under AGPL-3.0 and built on React, Next.js, and PocketBase. You can self-host it for free on any infrastructure that runs Node.js, or use the hosted version at logr.work.",
  },
  {
    question: "Is Logr free?",
    answer:
      "Yes. Logr is open source under AGPL-3.0, which means you can self-host it at zero cost on any infrastructure you choose. The hosted version at logr.work is also free to use. There is no paid tier, no feature gating, and no hidden seats pricing. Your data stays in the PocketBase instance you control.",
  },
  {
    question: "Is Logr a good open-source Toggl alternative?",
    answer:
      "If you need time tracking with invoicing that you can fully control, yes. Toggl Track is a solid product but it is closed source, cloud-only, and invoicing requires a paid plan. Logr covers the same core workflow — timer, projects, clients, reports — and adds invoice generation and shareable invoice links out of the box, with no subscription required.",
  },
  {
    question: "Can I self-host Logr?",
    answer:
      "Absolutely. Logr is designed to be self-hosted. The stack is Next.js for the frontend and API routes, and PocketBase (SQLite-backed, with auth and per-record API rules built in) for the database. The repo ships a Docker Compose file that runs both, and the bundled migrations create the schema on first boot. Deploy the Next.js app anywhere that supports Node.js — Vercel, Fly.io, a VPS — point POCKETBASE_URL at your own PocketBase instance, and you have a fully private setup. Instructions are in the GitHub repo.",
  },
  {
    question: "Does Logr handle invoicing?",
    answer:
      "Yes. Invoicing is built into Logr, not bolted on. Every time entry is tagged as billable or non-billable. When you are ready to invoice a client, Logr collects all unbilled sessions into a draft invoice automatically. You can adjust line items, add a note, and send the client a public link — they can view and download the invoice without creating an account.",
  },
  {
    question: "Can I import from Toggl?",
    answer:
      "Yes. Logr supports importing time entries from a Toggl CSV export. Go to Settings, choose Import, upload your Toggl CSV, and Logr will map the entries to your existing clients and projects. It is a one-time migration path, so you do not lose historical data when you switch.",
  },
  {
    question: "Does Logr work for agencies?",
    answer:
      "Yes. Logr is built around a clients-and-projects model that suits agencies well. Each client can have multiple projects, each project carries its own hourly rate, and reports can be filtered and shared per client. You can generate separate invoices for each client from a single account, making it straightforward to manage billing across a portfolio of ongoing engagements.",
  },
];

function FaqSection() {
  return (
    <section>
      <Band className="grid gap-px bg-heading/8 md:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-white px-6 py-16 md:px-10">
          <div className="md:sticky md:top-28">
            <p id="faq" className="scroll-mt-24 font-mono text-[12px] font-medium tracking-[0.08em] text-coral uppercase">
              FAQ
            </p>
            <h2 className="mt-3 text-[36px] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[44px]">
              Frequently asked questions
            </h2>
            <p className="mt-4 max-w-[340px] text-[16px] leading-[1.55] text-heading/60">
              Anything else? Open an issue on{" "}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-heading underline decoration-heading/20 underline-offset-4 hover:decoration-heading"
              >
                GitHub
              </a>
              .
            </p>
            <Sticker icon={MessageCircle} tone="violet" tilt="-rotate-6" className="mt-8 size-16! rounded-[18px]! [&>svg]:size-8! max-md:hidden" />
          </div>
        </div>
        <div className="flex flex-col bg-white">
          {FAQ.map((item, i) => (
            <details key={item.question} open={i === 0} className="group border-b border-heading/8 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-6 text-[16px] font-semibold md:px-10 [&::-webkit-details-marker]:hidden">
                <h3>{item.question}</h3>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-heading/5 transition-[rotate,background-color,color] duration-300 group-open:rotate-45 group-open:bg-coral group-open:text-white">
                  <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M6 1.5v9M1.5 6h9" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="-mt-2 px-6 pb-6 text-[15px] leading-[1.6] text-heading/65 md:px-10">{item.answer}</p>
            </details>
          ))}
        </div>
      </Band>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <MarketingPage>
        <Hero />
        <TryItBand />
        <TrackSection />
        <BillSection />
        <SelfHostSection />
        <DetailsSection />
        <ComparisonSection />
        <PricingSection />
        <BlogSection />
        <FaqSection />
        <CtaBand />
      </MarketingPage>
    </>
  );
}
