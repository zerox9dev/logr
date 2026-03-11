import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Timer, BarChart3, Receipt, Users, FolderOpen,
  ArrowRight, Check, Github, ChevronDown,
  Clock, DollarSign, FileText,
} from "lucide-react";
import { t } from "@/lib/i18n";
import s from "./landing-page.module.css";

/* ─── Feature data ─── */
const FEATURES = [
  { icon: FolderOpen, title: "Projects & Clients", desc: "Manage all your work and contacts in one place" },
  { icon: Clock, title: "Time Tracking", desc: "One-click timer with billable hours" },
  { icon: Receipt, title: "Invoicing", desc: "Generate and send professional invoices" },
  { icon: Users, title: "Sales Funnels", desc: "Track deals from lead to close" },
  { icon: BarChart3, title: "Reports", desc: "See where your time and money go" },
  { icon: DollarSign, title: "Multi-currency", desc: "USD, EUR, GBP, UAH, PLN" },
];

const STEPS = [
  { num: "1", title: "Start Timer", desc: "Track your work session" },
  { num: "2", title: "Create Invoice", desc: "Auto-generate from tracked time" },
  { num: "3", title: "Get Paid", desc: "Send to client and mark as paid" },
];

const PRICING_FEATURES = [
  "Unlimited clients & projects",
  "Time tracking & sessions",
  "Invoice generation & PDF export",
  "Sales funnels & pipelines",
  "Multi-currency support",
  "Reports & analytics",
  "Google sign-in",
  "Data stored securely in cloud",
];

const FAQ_ITEMS = [
  { q: "Is it really free?", a: "Yes, Logr is completely free during beta." },
  { q: "Do I need to create an account?", a: "Yes, sign in with Google." },
  { q: "Can I export my data?", a: "Yes, download invoices as PDF." },
  { q: "Is my data secure?", a: "Yes, stored in Supabase with encryption." },
];

/* ─── FAQ Accordion Item ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.faqItem}>
      <button className={s.faqQuestion} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <ChevronDown className={`${s.faqChevron} ${open ? s.faqChevronOpen : ""}`} />
      </button>
      {open && <p className={s.faqAnswer}>{a}</p>}
    </div>
  );
}

/* ─── Main Component ─── */
export function LandingPage() {
  return (
    <div className={s.landing}>
      {/* ── Navbar ── */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          <div className={s.logo}>
            <span className={s.logoName}>Logr</span>
          </div>
          <div className={s.navLinks}>
            <a href="#how-it-works" className={s.navLink}>How it Works</a>
            <a href="#features" className={s.navLink}>Features</a>
            <a href="#pricing" className={s.navLink}>Pricing</a>
          </div>
          <Link to="/app" className={s.navCta}>Try for Free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <p className={s.heroLabel}>Free CRM for freelancers</p>
          <h1 className={s.heroTitle}>
            Manage clients.<br />
            Track time.<br />
            Get paid.
          </h1>
          <p className={s.heroDesc}>
            Projects, time tracking, invoicing, and sales funnels - everything a freelancer needs in one place.
          </p>
          <div className={s.heroActions}>
            <Link to="/app" className={s.heroPrimary}>
              Try for Free <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <a href="#how-it-works" className={s.heroSecondary}>
              See How It Works
            </a>
          </div>
        </div>
        {/* Dashboard preview placeholder */}
        <div className={s.heroPreview}>
          <div className={s.heroPreviewInner}>
            <div className={s.previewBar}>
              <div className={s.previewDots}>
                <span className={s.previewDot} />
                <span className={s.previewDot} />
                <span className={s.previewDot} />
              </div>
              <div className={s.previewUrl}>logr.work</div>
            </div>
            <div className={s.previewBody}>
              <div className={s.previewTopRow}>
                <div>
                  <div className={s.previewGreeting}>Good evening 👋</div>
                  <div className={s.previewSub}>3 projects active</div>
                </div>
                <div className={s.previewTimer}>
                  <span className={s.previewTimerDot} />
                  <span className={s.previewTimerTime}>01:24:37</span>
                  <span className={s.previewTimerProject}>Website Redesign</span>
                </div>
              </div>
              <div className={s.previewCards}>
                {[
                  { label: "Today", value: "4h 12m", sub: "+18%" },
                  { label: "This Week", value: "22h 45m", sub: "Target: 40h" },
                  { label: "Unpaid", value: "$3,450", sub: "2 invoices" },
                  { label: "Pipeline", value: "$12,800", sub: "5 deals" },
                ].map((c) => (
                  <div key={c.label} className={s.previewCard}>
                    <div className={s.previewCardLabel}>{c.label}</div>
                    <div className={s.previewCardValue}>{c.value}</div>
                    <div className={s.previewCardSub}>{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={s.features}>
        <div className={s.sectionCenter}>
          <h2 className={s.sectionTitle}>Your freelance business, organized</h2>
          <p className={s.sectionDesc}>Clients, projects, time, invoices, and deals - all in one clean tool.</p>
        </div>
        <div className={s.featuresGrid}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={s.featureItem}>
                <div className={s.featureIcon}>
                  <Icon className={s.featureIconSvg} />
                </div>
                <h3 className={s.featureName}>{f.title}</h3>
                <p className={s.featureDesc}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className={s.howItWorks}>
        <div className={s.sectionCenter}>
          <h2 className={s.sectionTitle}>How it works</h2>
          <p className={s.sectionDesc}>Three simple steps to get paid for your work.</p>
        </div>
        <div className={s.stepsGrid}>
          {STEPS.map((step) => (
            <div key={step.num} className={s.stepItem}>
              <div className={s.stepNum}>{step.num}</div>
              <h3 className={s.stepTitle}>{step.title}</h3>
              <p className={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className={s.pricing}>
        <div className={s.sectionCenter}>
          <h2 className={s.sectionTitle}>Simple pricing</h2>
          <p className={s.sectionDesc}>Free while in beta. No credit card required.</p>
        </div>
        <div className={s.pricingCard}>
          <div className={s.pricingHeader}>
            <span className={s.pricingTier}>Free</span>
            <div className={s.pricingPrice}>
              <span className={s.pricingAmount}>$0</span>
              <span className={s.pricingPeriod}>/forever</span>
            </div>
            <p className={s.pricingDesc}>Everything included. No limits during beta.</p>
          </div>
          <ul className={s.pricingFeatures}>
            {PRICING_FEATURES.map((f) => (
              <li key={f} className={s.pricingFeature}>
                <Check className={s.pricingCheckIcon} /> {f}
              </li>
            ))}
          </ul>
          <Link to="/app" className={s.pricingCta}>
            Get Started Free <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={s.faq}>
        <div className={s.sectionCenter}>
          <h2 className={s.sectionTitle}>Frequently asked questions</h2>
        </div>
        <div className={s.faqList}>
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span className={s.footerCopy}>Logr © 2025</span>
          <div className={s.footerLinks}>
            <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer" className={s.footerLink}>GitHub</a>
            <a href="/privacy" className={s.footerLink}>Privacy</a>
            <a href="mailto:zerox9dev.work@icloud.com" className={s.footerLink}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
