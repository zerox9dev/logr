import { Link } from "react-router-dom";
import {
  Timer, BarChart3, Receipt, Kanban, Users, FolderOpen,
  Zap, Shield, Smartphone, ArrowRight, Check, Github, Star,
  Clock, DollarSign, TrendingUp, Keyboard,
} from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
        <Timer className="h-4 w-4 text-white" />
      </div>
      <span className="text-xl font-bold tracking-tight">Logr</span>
    </div>
  );
}

const FEATURES = [
  {
    icon: Clock,
    title: "Time Tracking",
    desc: "One-click timer with keyboard shortcuts. Billable/non-billable. Duration parser (1h 30m, 1:30, 90m). Manual entries for past days.",
  },
  {
    icon: FolderOpen,
    title: "Projects",
    desc: "Track by project with color coding, budgets, hourly rates. Active, completed, archived statuses. See total hours and earnings at a glance.",
  },
  {
    icon: Users,
    title: "Clients",
    desc: "Full contact management — email, phone, address, notes. Per-client stats: hours tracked, invoiced, projects. Active/inactive status.",
  },
  {
    icon: Receipt,
    title: "Invoices",
    desc: "Professional invoices with live preview. Auto-fill from time entries. Tax, discounts, custom payment terms. Track draft → sent → paid.",
  },
  {
    icon: Kanban,
    title: "Funnels",
    desc: "Custom Kanban pipelines for anything — sales, job search, hiring. Create your own stages. Track deal values and move cards with a click.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    desc: "Visual breakdown by project and client. Date range filters (week, month, custom). Billable vs total hours. Earnings summary cards.",
  },
];

const EXTRAS = [
  { icon: Keyboard, text: "Keyboard shortcuts — Space to start, Esc to stop, ⌘K command palette" },
  { icon: Zap, text: "Zero loading — everything instant, runs locally in your browser" },
  { icon: Smartphone, text: "Mobile-ready with responsive layout and bottom navigation" },
  { icon: Shield, text: "Your data stays yours — no cloud, no tracking, no vendor lock-in" },
];

const FREE_FEATURES = [
  "Time tracking with timer",
  "Unlimited projects & clients",
  "Manual time entries",
  "Billable / non-billable",
  "Basic reports",
  "Keyboard shortcuts",
  "⌘K command palette",
  "Mobile responsive",
  "JSON export / import",
  "Open source (AGPL)",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Custom funnels (Kanban)",
  "Professional invoices",
  "Invoice live preview",
  "Tax & discount support",
  "Advanced reports",
  "PDF invoice export",
  "Payment integrations",
  "AI time entry (NL input)",
  "Weekly AI summary",
  "Multi-user / teams",
  "Priority support",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">Features</a>
            <a href="#pricing" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">Pricing</a>
            <a href="https://github.com/zerox9dev/logr-new" target="_blank" rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">
              <Github className="h-4 w-4" />
            </a>
            <Link to="/app"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
              Open App <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Free & open source
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Time tracking<br />
            <span className="text-zinc-400">for freelancers</span><br />
            who ship.
          </h1>
          <p className="mt-6 text-lg text-zinc-500 leading-relaxed max-w-lg">
            Track time, manage clients, send invoices, and close deals — all in one place.
            No bloat, no subscriptions, no BS. Just a clean tool that works.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
              Start Tracking <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://github.com/zerox9dev/logr-new" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Github className="h-4 w-4" /> View on GitHub
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1"><Check className="h-3 w-3" /> No signup required</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Works offline</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Your data, your device</span>
          </div>
        </div>
      </section>

      {/* App preview */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            {/* Fake app bar */}
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-200" />
                <div className="h-3 w-3 rounded-full bg-zinc-200" />
                <div className="h-3 w-3 rounded-full bg-zinc-200" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded-md bg-zinc-50 px-4 py-1 text-xs text-zinc-400">logr.work</div>
              </div>
            </div>
            {/* Fake dashboard content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-zinc-900">Good evening 👋</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Friday, March 6 · 3 projects active</div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-mono font-medium text-zinc-900">01:24:37</span>
                  <span className="text-xs text-zinc-400">Website Redesign</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Today", value: "4h 12m", sub: "+18% vs yesterday" },
                  { label: "This Week", value: "22h 45m", sub: "Target: 40h" },
                  { label: "Unpaid", value: "$3,450", sub: "2 invoices" },
                  { label: "Pipeline", value: "$12,800", sub: "5 active deals" },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg border border-zinc-100 p-3">
                    <div className="text-[10px] uppercase text-zinc-400 font-medium tracking-wider">{card.label}</div>
                    <div className="text-lg font-bold text-zinc-900 mt-1">{card.value}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{card.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-5xl px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Everything you need. Nothing you don't.</h2>
          <p className="mt-3 text-zinc-500">Built by a freelancer, for freelancers. Every feature solves a real problem.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-100 p-5 hover:border-zinc-200 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-zinc-50 flex items-center justify-center mb-3">
                <f.icon className="h-4.5 w-4.5 text-zinc-600" />
              </div>
              <h3 className="font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Extras */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-8">
          <h3 className="font-semibold text-zinc-900 mb-4">Also included</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXTRAS.map((e) => (
              <div key={e.text} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-md bg-white border border-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                  <e.icon className="h-3.5 w-3.5 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-600">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Simple pricing</h2>
          <p className="mt-3 text-zinc-500">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-xl border border-zinc-200 p-6">
            <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Free</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-zinc-900">$0</span>
              <span className="text-zinc-400">/forever</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Core time tracking for solo freelancers.</p>
            <Link to="/app"
              className="mt-6 block w-full rounded-lg border border-zinc-200 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              Get Started
            </Link>
            <ul className="mt-6 space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-zinc-900 p-6 relative">
            <div className="absolute -top-3 left-6 rounded-full bg-zinc-900 px-3 py-0.5 text-[10px] font-medium text-white uppercase tracking-wider">
              Coming soon
            </div>
            <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Pro</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-zinc-900">$9</span>
              <span className="text-zinc-400">/month</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Full CRM for serious freelancers.</p>
            <button disabled
              className="mt-6 block w-full rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-medium text-white opacity-50 cursor-not-allowed">
              Join Waitlist
            </button>
            <ul className="mt-6 space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-2xl bg-zinc-900 p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Stop paying for time trackers.<br />Start owning your workflow.
          </h2>
          <p className="mt-4 text-zinc-400 max-w-lg mx-auto">
            Logr is free, open source, and runs entirely in your browser.
            No signup, no credit card, no BS.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition-colors">
              Open Logr <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://github.com/zerox9dev/logr-new" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
              <Star className="h-4 w-4" /> Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 py-8 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-zinc-300">·</span>
            <span>Built by <a href="https://zerox9dev.com" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900">zerox9dev</a></span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/zerox9dev/logr-new" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">GitHub</a>
            <a href="https://t.me/Pix2Code" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
