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
  { icon: FolderOpen, titleKey: "feat.projects.title", descKey: "feat.projects.desc" },
  { icon: Clock, titleKey: "feat.time.title", descKey: "feat.time.desc" },
  { icon: Receipt, titleKey: "feat.invoices.title", descKey: "feat.invoices.desc" },
  { icon: Users, titleKey: "feat.funnels.title", descKey: "feat.funnels.desc" },
  { icon: BarChart3, titleKey: "feat.reports.title", descKey: "feat.reports.desc" },
  { icon: DollarSign, titleKey: "feat.currency.title", descKey: "feat.currency.desc" },
];

const STEPS = [
  { num: "1", titleKey: "howit.step1.title", descKey: "howit.step1.desc" },
  { num: "2", titleKey: "howit.step2.title", descKey: "howit.step2.desc" },
  { num: "3", titleKey: "howit.step3.title", descKey: "howit.step3.desc" },
];

const PRICING_FEATURE_KEYS = [
  "feat.clients.title",
  "feat.time.title",
  "feat.invoices.title",
  "feat.funnels.title",
  "feat.currency.title",
  "feat.reports.title",
  "feat.pdf.title",
];

const FAQ_ITEMS = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
];

/* ─── FAQ Accordion Item ─── */
function FaqItem({ qKey, aKey }: { qKey: string; aKey: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.faqItem}>
      <button className={s.faqQuestion} onClick={() => setOpen(!open)}>
        <span>{t(qKey)}</span>
        <ChevronDown className={`${s.faqChevron} ${open ? s.faqChevronOpen : ""}`} />
      </button>
      {open && <p className={s.faqAnswer}>{t(aKey)}</p>}
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
            <a href="#how-it-works" className={s.navLink}>{t("nav.howItWorks")}</a>
            <a href="#features" className={s.navLink}>{t("nav.features")}</a>
            <a href="#pricing" className={s.navLink}>{t("nav.pricing")}</a>
          </div>
          <Link to="/app" className={s.navCta}>{t("hero.tryFree")}</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <p className={s.heroLabel}>{t("hero.label")}</p>
          <h1 className={s.heroTitle}>
            {t("hero.title1")}<br />
            {t("hero.title2")}<br />
            {t("hero.title3")}
          </h1>
          <p className={s.heroDesc}>{t("hero.desc")}</p>
          <div className={s.heroActions}>
            <Link to="/app" className={s.heroPrimary}>
              {t("hero.tryFree")} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <a href="#how-it-works" className={s.heroSecondary}>
              {t("hero.seeHow")}
            </a>
          </div>
        </div>
        {/* Dashboard preview */}
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
                  <div className={s.previewGreeting}>{t("preview.greeting")}</div>
                  <div className={s.previewSub}>{t("preview.sub")}</div>
                </div>
                <div className={s.previewTimer}>
                  <span className={s.previewTimerDot} />
                  <span className={s.previewTimerTime}>01:24:37</span>
                  <span className={s.previewTimerProject}>Website Redesign</span>
                </div>
              </div>
              <div className={s.previewCards}>
                {[
                  { labelKey: "preview.today", value: "4h 12m", sub: "+18%" },
                  { labelKey: "preview.week", value: "22h 45m", sub: "Target: 40h" },
                  { labelKey: "preview.unpaid", value: "$3,450", sub: "2 invoices" },
                  { labelKey: "preview.pipeline", value: "$12,800", sub: "5 deals" },
                ].map((c) => (
                  <div key={c.labelKey} className={s.previewCard}>
                    <div className={s.previewCardLabel}>{t(c.labelKey)}</div>
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
          <h2 className={s.sectionTitle}>{t("features.title")}</h2>
          <p className={s.sectionDesc}>{t("features.desc")}</p>
        </div>
        <div className={s.featuresGrid}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.titleKey} className={s.featureItem}>
                <div className={s.featureIcon}>
                  <Icon className={s.featureIconSvg} />
                </div>
                <h3 className={s.featureName}>{t(f.titleKey)}</h3>
                <p className={s.featureDesc}>{t(f.descKey)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className={s.howItWorks}>
        <div className={s.sectionCenter}>
          <h2 className={s.sectionTitle}>{t("howit.title")}</h2>
          <p className={s.sectionDesc}>{t("howit.desc")}</p>
        </div>
        <div className={s.stepsGrid}>
          {STEPS.map((step) => (
            <div key={step.num} className={s.stepItem}>
              <div className={s.stepNum}>{step.num}</div>
              <h3 className={s.stepTitle}>{t(step.titleKey)}</h3>
              <p className={s.stepDesc}>{t(step.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className={s.pricing}>
        <div className={s.sectionCenter}>
          <h2 className={s.sectionTitle}>{t("pricing.title")}</h2>
          <p className={s.sectionDesc}>{t("pricing.desc")}</p>
        </div>
        <div className={s.pricingCard}>
          <div className={s.pricingHeader}>
            <span className={s.pricingTier}>{t("pricing.free")}</span>
            <div className={s.pricingPrice}>
              <span className={s.pricingAmount}>$0</span>
              <span className={s.pricingPeriod}>{t("pricing.forever")}</span>
            </div>
            <p className={s.pricingDesc}>{t("pricing.freeLabel")}</p>
          </div>
          <ul className={s.pricingFeatures}>
            {PRICING_FEATURE_KEYS.map((key) => (
              <li key={key} className={s.pricingFeature}>
                <Check className={s.pricingCheckIcon} /> {t(key)}
              </li>
            ))}
          </ul>
          <Link to="/app" className={s.pricingCta}>
            {t("pricing.tryFree")} <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={s.faq}>
        <div className={s.sectionCenter}>
          <h2 className={s.sectionTitle}>{t("faq.title")}</h2>
        </div>
        <div className={s.faqList}>
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.qKey} qKey={item.qKey} aKey={item.aKey} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span className={s.footerCopy}>{t("footer.copy")}</span>
          <div className={s.footerLinks}>
            <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer" className={s.footerLink}>GitHub</a>
            <a href="/privacy" className={s.footerLink}>{t("footer.privacy")}</a>
            <a href="mailto:zerox9dev.work@icloud.com" className={s.footerLink}>{t("footer.contact")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
