import { Link } from "react-router-dom";
import {
  Timer, BarChart3, Receipt, Kanban, Users, FolderOpen,
  Zap, Shield, Smartphone, ArrowRight, Check, Github, Star,
  Clock, Keyboard,
} from "lucide-react";
import { t, getFreeFeatures, getProFeatures } from "@/lib/i18n";
import s from "./landing-page.module.css";

function Logo() {
  return (
    <div className={s.logo}>
      <div className={s.logoBox}>
        <Timer className={s.logoIcon} />
      </div>
      <span className={s.logoName}>Logr</span>
    </div>
  );
}

const FEATURE_ICONS = [Clock, FolderOpen, Users, Receipt, Kanban, BarChart3];
const FEATURE_KEYS = ["time", "projects", "clients", "invoices", "funnels", "reports"];
const EXTRA_ICONS = [Keyboard, Zap, Smartphone, Shield];
const EXTRA_KEYS = ["keyboard", "speed", "mobile", "privacy"];

export function LandingPage() {
  return (
    <div className={s.landing}>
      {/* Nav */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          <Logo />
          <div className={s.navLinks}>
            <a href="#features" className={[s.navLink, s.navLinkHidden].join(" ")}>{t("nav.features")}</a>
            <a href="#pricing" className={[s.navLink, s.navLinkHidden].join(" ")}>{t("nav.pricing")}</a>
            <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer" className={[s.navLink, s.navLinkHidden].join(" ")}>
              <Github style={{ width: 16, height: 16 }} />
            </a>
            <Link to="/app" className={s.navCta}>
              {t("nav.openApp")} <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroBadge}>
            <span className={s.heroDot} />
            {t("hero.badge")}
          </div>
          <h1 className={s.heroTitle}>
            {t("hero.title1")}<br />
            <span className={s.heroMuted}>{t("hero.title2")}</span><br />
            {t("hero.title3")}
          </h1>
          <p className={s.heroDesc}>{t("hero.desc")}</p>
          <div className={s.heroActions}>
            <Link to="/app" className={s.heroPrimary}>
              {t("hero.cta")} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer" className={s.heroSecondary}>
              <Github style={{ width: 16, height: 16 }} /> {t("hero.github")}
            </a>
          </div>
          <div className={s.heroChecks}>
            <span className={s.heroCheck}><Check className={s.heroCheckIcon} /> {t("hero.check1")}</span>
            <span className={s.heroCheck}><Check className={s.heroCheckIcon} /> {t("hero.check2")}</span>
            <span className={s.heroCheck}><Check className={s.heroCheckIcon} /> {t("hero.check3")}</span>
          </div>
        </div>
      </section>

      {/* App preview */}
      <section className={s.previewSection}>
        <div className={s.previewOuter}>
          <div className={s.previewInner}>
            <div className={s.previewBar}>
              <div className={s.previewDots}>
                <div className={s.previewDot} />
                <div className={s.previewDot} />
                <div className={s.previewDot} />
              </div>
              <div className={s.previewUrl}>
                <div className={s.previewUrlBg}>logr.work</div>
              </div>
            </div>
            <div className={s.previewBody}>
              <div className={s.previewTopRow}>
                <div>
                  <div className={s.previewGreeting}>{t("preview.greeting")}</div>
                  <div className={s.previewSub}>{t("preview.sub")}</div>
                </div>
                <div className={s.previewTimer}>
                  <div className={s.previewTimerDot} />
                  <span className={s.previewTimerTime}>01:24:37</span>
                  <span className={s.previewTimerProject}>Website Redesign</span>
                </div>
              </div>
              <div className={s.previewCards}>
                {[
                  { key: "preview.today", value: "4h 12m", sub: "+18%" },
                  { key: "preview.week", value: "22h 45m", sub: "Target: 40h" },
                  { key: "preview.unpaid", value: "$3,450", sub: "2 invoices" },
                  { key: "preview.pipeline", value: "$12,800", sub: "5 deals" },
                ].map((card) => (
                  <div key={card.key} className={s.previewCard}>
                    <div className={s.previewCardLabel}>{t(card.key)}</div>
                    <div className={s.previewCardValue}>{card.value}</div>
                    <div className={s.previewCardSub}>{card.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={s.features}>
        <div className={s.featuresCenter}>
          <h2 className={s.featuresTitle}>{t("features.title")}</h2>
          <p className={s.featuresDesc}>{t("features.desc")}</p>
        </div>
        <div className={s.featuresGrid}>
          {FEATURE_KEYS.map((key, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={key} className={s.featureItem}>
                <div className={s.featureIcon}>
                  <Icon className={s.featureIconSvg} />
                </div>
                <h3 className={s.featureName}>{t(`feat.${key}.title`)}</h3>
                <p className={s.featureDesc}>{t(`feat.${key}.desc`)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Extras */}
      <section className={s.extras}>
        <div className={s.extrasBox}>
          <h3 className={s.extrasTitle}>{t("extras.title")}</h3>
          <div className={s.extrasGrid}>
            {EXTRA_KEYS.map((key, i) => {
              const Icon = EXTRA_ICONS[i];
              return (
                <div key={key} className={s.extraItem}>
                  <div className={s.extraIcon}>
                    <Icon className={s.extraIconSvg} />
                  </div>
                  <p className={s.extraText}>{t(`extras.${key}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={s.pricing}>
        <div className={s.featuresCenter}>
          <h2 className={s.featuresTitle}>{t("pricing.title")}</h2>
          <p className={s.featuresDesc}>{t("pricing.desc")}</p>
        </div>
        <div className={s.pricingGrid}>
          <div className={s.pricingCard}>
            <div className={s.pricingTier}>{t("pricing.free")}</div>
            <div className={s.pricingPrice}>
              <span className={s.pricingAmount}>$0</span>
              <span className={s.pricingPeriod}>{t("pricing.forever")}</span>
            </div>
            <p className={s.pricingDesc}>{t("pricing.freeDesc")}</p>
            <Link to="/app" className={s.pricingCta}>{t("pricing.getStarted")}</Link>
            <ul className={s.pricingFeatures}>
              {getFreeFeatures().map((f) => (
                <li key={f} className={s.pricingFeature}>
                  <Check className={s.pricingCheckIcon} /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className={[s.pricingCard, s.pricingCardPro].join(" ")}>
            <div className={s.pricingBadge}>{t("pricing.comingSoon")}</div>
            <div className={s.pricingTier}>{t("pricing.pro")}</div>
            <div className={s.pricingPrice}>
              <span className={s.pricingAmount}>$9</span>
              <span className={s.pricingPeriod}>{t("pricing.month")}</span>
            </div>
            <p className={s.pricingDesc}>{t("pricing.proDesc")}</p>
            <button disabled className={s.pricingCtaDisabled}>{t("pricing.joinWaitlist")}</button>
            <ul className={s.pricingFeatures}>
              {getProFeatures().map((f) => (
                <li key={f} className={s.pricingFeature}>
                  <Check className={s.pricingCheckIcon} /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaSection}>
        <div className={s.ctaBox}>
          <h2 className={s.ctaTitle}>
            {t("cta.title1")}<br />{t("cta.title2")}
          </h2>
          <p className={s.ctaDesc}>{t("cta.desc")}</p>
          <div className={s.ctaActions}>
            <Link to="/app" className={s.ctaPrimary}>
              {t("cta.open")} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer" className={s.ctaSecondary}>
              <Star style={{ width: 16, height: 16 }} /> {t("cta.star")}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLeft}>
            <Logo />
            <span className={s.footerDot}>·</span>
            <span>{t("footer.builtBy")} <a href="https://zerox9dev.com" target="_blank" rel="noopener noreferrer" className={s.footerAuthor}>zerox9dev</a></span>
          </div>
          <div className={s.footerRight}>
            <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer" className={s.footerLink}>GitHub</a>
            <a href="https://t.me/Pix2Code" target="_blank" rel="noopener noreferrer" className={s.footerLink}>Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
