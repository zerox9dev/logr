"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const ARM_RATE = 75;
const BASE_SECONDS = 3600 + 23 * 60 + 47;
const LOST_TARGET = 6500;
type SiteLang = "en" | "ru" | "uk";

function detectSiteLanguage(): SiteLang {
  if (typeof window === "undefined") return "en";
  const raw = window.navigator.language || window.navigator.languages?.[0] || "en";
  const normalized = String(raw).toLowerCase();
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uk")) return "uk";
  return "en";
}

function subscribeLanguageChange(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("languagechange", onChange);
  return () => window.removeEventListener("languagechange", onChange);
}

const LANDING_COPY = {
  en: {
    nav: { preview: "Preview", features: "Features", pricing: "Pricing", tryFree: "Try free" },
    hero: {
      eyebrow: "Freelance time tracker",
      line1: "Your time",
      line2: "is your",
      line3: "currency.",
      sub: "Every unbilled minute is money left on the table. Logr makes every second visible - so you always get paid what you're worth.",
      start: "Start tracking free",
      see: "See it in action",
      now: "YOUR TIME, RIGHT NOW",
      workingOn: "Working on",
      project: "Homepage redesign",
      caption1: "In the film, you could see your time running out.",
      caption2: "With Logr, you can see it adding up.",
    },
    ticker: [
      "TIME IS MONEY",
      "EVERY MINUTE COUNTS",
      "LOG IT - BILL IT - KEEP IT",
      "DON'T WASTE A SECOND",
      "YOUR TIME - YOUR RULES",
      "FREELANCE SMARTER",
    ],
    impact: [
      {
        big: "2.5h",
        suffix: "/wk",
        desc: "Average time freelancers lose on admin - manually writing invoices, filling in spreadsheets, ",
        strong: "chasing hours they forgot to log.",
      },
      {
        desc: "Lost per year at $50/hr from those 2.5 hours. That's ",
        strong: "real money you worked for",
        tail: " - and never got paid.",
      },
      {
        big: "1",
        suffix: "app",
        desc: "Is all it takes to fix it. Track time, manage clients, log tasks, generate invoices. ",
        strong: "Everything in one place.",
      },
    ],
    preview: {
      title1: "The app.",
      title2: "Clean by design.",
      sub: "No onboarding, no tutorials. Add a client, type a task, press Space. That's it.",
    },
    features: {
      label: "Features",
      title1: "Built for how freelancers",
      title2: "actually work.",
      c1t1: "Space to",
      c1t2: "start",
      c1d: "Hit Space to start tracking. Hit Space to stop. The fastest time tracker is one that gets out of your way.",
      c2t1: "Clients",
      c2t2: "& projects",
      c2d: "Organize work by client, drill down into projects. See exactly how much each relationship earns you.",
      c3t1: "Session",
      c3t2: "notes",
      c3d: "Add a line describing what you did. It shows on your invoice - so clients pay without questions.",
      c4t1: "Invoice",
      c4t2: "in one click",
      c4d: "Filter by client and month, click PDF. A professional invoice ready to send in under 60 seconds.",
    },
    pricing: {
      label: "Pricing",
      title1: "Simple.",
      title2: "No surprises.",
      freeForever: "Free forever",
      noCard: "No credit card",
      getStarted: "Get started",
      comingSoon: "COMING SOON",
      perMonth: "per month",
      notAvailable: "Not available yet",
      unlimitedTracking: "Unlimited tracking",
      upToClients: "Up to 3 clients",
      unlimitedClients: "Unlimited clients",
      invoicePdf: "Invoice PDF",
      csvExport: "CSV export",
      cloudSync: "Cloud sync",
      multiDevice: "Multi-device",
    },
    cta: {
      title1: "Stop losing time.",
      title2: "Start earning more.",
      tryFree: "Try Logr for free",
      seeApp: "See the app",
    },
    footer: {
      copy: "© 2026 Logr. Built for freelancers.",
      app: "App",
      pricing: "Pricing",
      privacy: "Privacy",
    },
  },
  ru: {
    nav: { preview: "Обзор", features: "Возможности", pricing: "Цены", tryFree: "Попробовать" },
    hero: {
      eyebrow: "Трекер времени для фрилансеров",
      line1: "Твое время",
      line2: "это твоя",
      line3: "валюта.",
      sub: "Каждая неучтенная минута это деньги, которые остаются на столе. Logr делает видимой каждую секунду, чтобы ты всегда получал оплату за свою работу.",
      start: "Начать бесплатно",
      see: "Посмотреть в деле",
      now: "ТВОЕ ВРЕМЯ ПРЯМО СЕЙЧАС",
      workingOn: "Сейчас в работе",
      project: "Редизайн главной",
      caption1: "В фильме можно было видеть, как время заканчивается.",
      caption2: "С Logr ты видишь, как оно превращается в деньги.",
    },
    ticker: [
      "ВРЕМЯ ЭТО ДЕНЬГИ",
      "КАЖДАЯ МИНУТА ВАЖНА",
      "УЧИТЫВАЙ - ВЫСТАВЛЯЙ - ЗАБИРАЙ",
      "НЕ ТЕРЯЙ НИ СЕКУНДЫ",
      "ТВОЕ ВРЕМЯ - ТВОИ ПРАВИЛА",
      "ФРИЛАНС УМНЕЕ",
    ],
    impact: [
      {
        big: "2.5ч",
        suffix: "/нед",
        desc: "В среднем фрилансеры теряют на рутине - вручную делают инвойсы, ведут таблицы, ",
        strong: "и упускают часы, которые забыли залогировать.",
      },
      {
        desc: "Потери в год при ставке $50/ч из-за этих 2.5 часов. Это ",
        strong: "реальные деньги, которые ты заработал",
        tail: " - и не получил.",
      },
      {
        big: "1",
        suffix: "приложение",
        desc: "Достаточно, чтобы это исправить. Учет времени, клиенты, задачи, инвойсы. ",
        strong: "Все в одном месте.",
      },
    ],
    preview: {
      title1: "Приложение.",
      title2: "Чистый интерфейс.",
      sub: "Без онбординга и туториалов. Добавь клиента, введи задачу, нажми Space. И готово.",
    },
    features: {
      label: "Возможности",
      title1: "Сделано под то, как фрилансеры",
      title2: "работают в реальности.",
      c1t1: "Пробел для",
      c1t2: "старта",
      c1d: "Нажми Space чтобы начать трекинг. Нажми Space чтобы остановить. Самый быстрый трекер тот, который не мешает.",
      c2t1: "Клиенты",
      c2t2: "и проекты",
      c2d: "Организуй работу по клиентам и проектам. Сразу видно, сколько приносит каждое сотрудничество.",
      c3t1: "Заметки",
      c3t2: "к сессиям",
      c3d: "Добавь строку о проделанной работе. Она попадает в инвойс, и клиент платит без лишних вопросов.",
      c4t1: "Инвойс",
      c4t2: "в один клик",
      c4d: "Фильтруй по клиенту и месяцу, жми PDF. Готовый инвойс меньше чем за минуту.",
    },
    pricing: {
      label: "Цены",
      title1: "Просто.",
      title2: "Без сюрпризов.",
      freeForever: "Бесплатно навсегда",
      noCard: "Без карты",
      getStarted: "Начать",
      comingSoon: "СКОРО",
      perMonth: "в месяц",
      notAvailable: "Пока недоступно",
      unlimitedTracking: "Неограниченный трекинг",
      upToClients: "До 3 клиентов",
      unlimitedClients: "Неограниченно клиентов",
      invoicePdf: "PDF инвойсы",
      csvExport: "Экспорт CSV",
      cloudSync: "Облачная синхронизация",
      multiDevice: "Несколько устройств",
    },
    cta: {
      title1: "Хватит терять время.",
      title2: "Начни зарабатывать больше.",
      tryFree: "Попробовать Logr бесплатно",
      seeApp: "Посмотреть приложение",
    },
    footer: {
      copy: "© 2026 Logr. Сделано для фрилансеров.",
      app: "Приложение",
      pricing: "Цены",
      privacy: "Конфиденциальность",
    },
  },
  uk: {
    nav: { preview: "Огляд", features: "Можливості", pricing: "Ціни", tryFree: "Спробувати" },
    hero: {
      eyebrow: "Трекер часу для фрилансерів",
      line1: "Твій час",
      line2: "це твоя",
      line3: "валюта.",
      sub: "Кожна незалогована хвилина це гроші, які ти втрачаєш. Logr робить видимою кожну секунду, щоб ти завжди отримував оплату за роботу.",
      start: "Почати безкоштовно",
      see: "Подивитись у дії",
      now: "ТВІЙ ЧАС ПРЯМО ЗАРАЗ",
      workingOn: "Зараз у роботі",
      project: "Редизайн головної",
      caption1: "У фільмі було видно, як час закінчується.",
      caption2: "З Logr ти бачиш, як він перетворюється на дохід.",
    },
    ticker: [
      "ЧАС ЦЕ ГРОШІ",
      "КОЖНА ХВИЛИНА ВАЖЛИВА",
      "ЗАЛОГУЙ - ВИСТАВЛЯЙ - ОТРИМУЙ",
      "НЕ ВТРАЧАЙ ЖОДНОЇ СЕКУНДИ",
      "ТВІЙ ЧАС - ТВОЇ ПРАВИЛА",
      "ФРИЛАНС РОЗУМНІШЕ",
    ],
    impact: [
      {
        big: "2.5г",
        suffix: "/тиж",
        desc: "У середньому фрилансери втрачають на адмінці - вручну пишуть інвойси, ведуть таблиці, ",
        strong: "і гублять години, які забули залогувати.",
      },
      {
        desc: "Втрати за рік при ставці $50/год через ці 2.5 години. Це ",
        strong: "реальні гроші, які ти заробив",
        tail: " - але не отримав.",
      },
      {
        big: "1",
        suffix: "додаток",
        desc: "І цього достатньо, щоб усе виправити. Трек часу, клієнти, задачі, інвойси. ",
        strong: "Все в одному місці.",
      },
    ],
    preview: {
      title1: "Додаток.",
      title2: "Чистий дизайн.",
      sub: "Без онбордингу та туторіалів. Додай клієнта, введи задачу, натисни Space. І все.",
    },
    features: {
      label: "Можливості",
      title1: "Створено під те, як фрилансери",
      title2: "працюють насправді.",
      c1t1: "Пробіл для",
      c1t2: "старту",
      c1d: "Натисни Space щоб почати трекінг. Натисни Space щоб зупинити. Найшвидший трекер той, який не заважає.",
      c2t1: "Клієнти",
      c2t2: "і проєкти",
      c2d: "Організовуй роботу за клієнтами та проєктами. Одразу видно, скільки приносить кожна співпраця.",
      c3t1: "Нотатки",
      c3t2: "до сесій",
      c3d: "Додай рядок про виконану роботу. Він потрапляє в інвойс, і клієнт платить без зайвих питань.",
      c4t1: "Інвойс",
      c4t2: "в один клік",
      c4d: "Фільтруй за клієнтом і місяцем, натискай PDF. Готовий інвойс менш ніж за хвилину.",
    },
    pricing: {
      label: "Ціни",
      title1: "Просто.",
      title2: "Без сюрпризів.",
      freeForever: "Безкоштовно назавжди",
      noCard: "Без картки",
      getStarted: "Почати",
      comingSoon: "СКОРО",
      perMonth: "на місяць",
      notAvailable: "Ще недоступно",
      unlimitedTracking: "Необмежений трекінг",
      upToClients: "До 3 клієнтів",
      unlimitedClients: "Необмежено клієнтів",
      invoicePdf: "PDF інвойси",
      csvExport: "Експорт CSV",
      cloudSync: "Хмарна синхронізація",
      multiDevice: "Кілька пристроїв",
    },
    cta: {
      title1: "Досить втрачати час.",
      title2: "Почни заробляти більше.",
      tryFree: "Спробувати Logr безкоштовно",
      seeApp: "Подивитись застосунок",
    },
    footer: {
      copy: "© 2026 Logr. Створено для фрилансерів.",
      app: "Застосунок",
      pricing: "Ціни",
      privacy: "Приватність",
    },
  },
};

function formatClock(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function LandingPage() {
  const lang = useSyncExternalStore<SiteLang>(subscribeLanguageChange, detectSiteLanguage, () => "en");
  const [scrolled, setScrolled] = useState(false);
  const [seconds, setSeconds] = useState(BASE_SECONDS);
  const [lostCounter, setLostCounter] = useState(0);
  const c = LANDING_COPY[lang];

  const earned = useMemo(() => `$${((seconds / 3600) * ARM_RATE).toFixed(2)}`, [seconds]);
  const time = useMemo(() => formatClock(seconds), [seconds]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);

    const timer = window.setInterval(() => {
      setSeconds((v) => v + 1);
    }, 1000);

    let lostStarted = false;
    let lostInterval: number | null = null;

    const startLostCounter = () => {
      if (lostStarted) return;
      lostStarted = true;
      const step = LOST_TARGET / 60;
      let current = 0;

      lostInterval = window.setInterval(() => {
        current = Math.min(current + step, LOST_TARGET);
        setLostCounter(Math.floor(current));
        if (current >= LOST_TARGET && lostInterval !== null) {
          window.clearInterval(lostInterval);
          lostInterval = null;
        }
      }, 16);
    };

    const reveals = document.querySelectorAll(".landing .reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            window.setTimeout(() => entry.target.classList.add("on"), index * 70);
            if ((entry.target as HTMLElement).closest(".impact")) startLostCounter();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    reveals.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(timer);
      if (lostInterval !== null) window.clearInterval(lostInterval);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing">
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#" className="nav-logo">
          Logr
        </a>
        <div className="nav-links">
          <a href="#preview">{c.nav.preview}</a>
          <a href="#features">{c.nav.features}</a>
          <a href="#pricing">{c.nav.pricing}</a>
          <Link href="/dashboard" className="nav-cta">
            {c.nav.tryFree}
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">{c.hero.eyebrow}</div>
          <h1 className="hero-title">
            {c.hero.line1}
            <br />
            {c.hero.line2}
            <br />
            <em>{c.hero.line3}</em>
          </h1>
          <p className="hero-sub">{c.hero.sub}</p>
          <div className="hero-btns">
            <Link href="/dashboard" className="btn-solid">
              {c.hero.start}
            </Link>
            <a href="#preview" className="btn-ghost">
              {c.hero.see}
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="arm-label-top">{c.hero.now}</div>
          <div className="arm-device">
            <div className="arm-time-display">
              {time.slice(0, 2)}
              <span className="colon">:</span>
              {time.slice(3, 5)}
              <span className="colon">:</span>
              {time.slice(6, 8)}
            </div>
            <div className="arm-divider" />
            <div className="arm-earned-row">
              <div className="arm-earned-val">{earned}</div>
              <div className="arm-rate-badge">$75 / hr</div>
            </div>
          </div>
          <div className="arm-project">
            {c.hero.workingOn} - <span>{c.hero.project}</span>
          </div>
          <p className="arm-caption">
            {c.hero.caption1}
            <br />
            {c.hero.caption2}
          </p>
        </div>
      </section>

      <div className="ticker">
        <div className="ticker-track">
          {[
            ...c.ticker,
            ...c.ticker,
          ].map((item, index) => (
            <span key={`${item}-${index}`} className={`ticker-item ${index % 2 === 0 ? "hi" : ""}`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="impact">
        <div className="impact-block reveal">
          <div className="impact-big">
            {c.impact[0].big}
            <em>{c.impact[0].suffix}</em>
          </div>
          <p className="impact-desc">
            {c.impact[0].desc}
            <strong>{c.impact[0].strong}</strong>
          </p>
        </div>

        <div className="impact-block reveal">
          <div className="impact-big">${lostCounter.toLocaleString()}</div>
          <p className="impact-desc">
            {c.impact[1].desc}
            <strong>{c.impact[1].strong}</strong>
            {c.impact[1].tail}
          </p>
        </div>

        <div className="impact-block reveal">
          <div className="impact-big">
            <em>{c.impact[2].big}</em> {c.impact[2].suffix}
          </div>
          <p className="impact-desc">
            {c.impact[2].desc}
            <strong>{c.impact[2].strong}</strong>
          </p>
        </div>
      </div>

      <section className="preview-section" id="preview">
        <div className="preview-header reveal">
          <h2 className="preview-title">
            {c.preview.title1}
            <br />
            <em>{c.preview.title2}</em>
          </h2>
          <p className="preview-subtitle">{c.preview.sub}</p>
        </div>

        <div className="app-mock reveal">
          <div className="mock-topbar">
            <div className="mock-dot" style={{ background: "#ff5f57" }} />
            <div className="mock-dot" style={{ background: "#febc2e" }} />
            <div className="mock-dot" style={{ background: "#28c840" }} />
            <div className="mock-url">logr.app/dashboard</div>
          </div>

          <div className="mock-inner">
            <div className="mock-sidebar">
              <div className="mock-sidebar-label">APP</div>
              <div className="mock-app-nav">
                <div className="mock-app-btn active">DASHBOARD</div>
                <div className="mock-app-btn">TRACKER</div>
                <div className="mock-app-btn">FUNNELS</div>
                <div className="mock-app-btn">INVOICES</div>
                <div className="mock-app-btn">PROFILE</div>
              </div>

              <div className="mock-sidebar-label">CLIENTS</div>
              <div className="mock-client active">Acme Corp</div>
              <div className="mock-client">Klarna</div>
              <div className="mock-client">Znaidy</div>
              <div style={{ margin: "12px 20px 0" }}>
                <div style={{ border: "1px dashed #e0e0e0", padding: 7, fontSize: 11, color: "#ccc", textAlign: "center", cursor: "pointer" }}>+ CLIENT</div>
              </div>
              <div style={{ marginTop: "auto", padding: 20, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "#ccc", letterSpacing: "0.1em", textAlign: "center", marginBottom: 6 }}>PROFILE</div>
                <div style={{ fontSize: 10, color: "#ccc", letterSpacing: "0.1em", textAlign: "center" }}>LIGHT</div>
              </div>
            </div>

            <div className="mock-main">
              <div className="mock-timer-label">ACME CORP - HOMEPAGE REDESIGN</div>
              <div className="mock-timer">
                {time} <span className="blink-dot">●</span>
              </div>

              <div className="mock-tabs">
                <div className="mock-tab active">ALL</div>
                <div className="mock-tab">REDESIGN Q1</div>
                <div className="mock-tab">API DOCS</div>
                <div style={{ border: "1px dashed #e0e0e0", padding: "4px 10px", fontSize: 10, color: "#ccc", cursor: "pointer" }}>+ PROJECT</div>
              </div>

              <div className="mock-filters">
                <span className="active">ALL</span>
                <span>7D</span>
                <span>THIS MONTH</span>
                <span>MONTH ▾</span>
              </div>

              <div className="mock-input-row top">
                <div className="mock-input">what are you working on?</div>
                <div className="mock-input small">17:42</div>
                <div className="mock-input small">$75/h</div>
              </div>
              <div className="mock-input-row">
                <div className="mock-input" style={{ fontSize: 11 }}>
                  add a note for the invoice... <span style={{ color: "#e0e0e0" }}>optional</span>
                </div>
              </div>

              <div className="mock-action-row">
                <div className="mock-timebox">
                  <span>TIME</span>
                  <div>0D 1H 24M</div>
                </div>
                <div className="mock-statusbox">ACTIVE</div>
                <div className="mock-btns">
                  <div className="mock-btn start">▶ START</div>
                </div>
              </div>

              <div className="mock-sessions">
                <div className="mock-row">
                  <div className="mock-dot2" style={{ background: "#ff4444" }} />
                  <div className="mock-date">today</div>
                  <div className="mock-task">
                    Homepage redesign<div className="mock-task-note">Rebuilt hero section + mobile nav</div>
                  </div>
                  <div className="mock-status" style={{ color: "#ff4444" }}>
                    ACTIVE
                  </div>
                  <div className="mock-dur">{time}</div>
                  <div className="mock-earn" style={{ color: "#2d7a2d" }}>
                    {earned}
                  </div>
                </div>

                <div className="mock-row">
                  <div className="mock-dot2" style={{ background: "#f5a623" }} />
                  <div className="mock-date">today</div>
                  <div className="mock-task">
                    Fix mobile nav bug<div className="mock-task-note" style={{ color: "#ccc" }}>-</div>
                  </div>
                  <div className="mock-status" style={{ color: "#f5a623" }}>
                    PENDING
                  </div>
                  <div className="mock-dur">-</div>
                  <div className="mock-earn" style={{ color: "#ccc" }}>$0.00</div>
                </div>

                <div className="mock-row">
                  <div className="mock-dot2" style={{ background: "#2d7a2d" }} />
                  <div className="mock-date">23 Feb</div>
                  <div className="mock-task">
                    API integration<div className="mock-task-note">Connected Stripe webhooks</div>
                  </div>
                  <div className="mock-status" style={{ color: "#2d7a2d" }}>
                    DONE
                  </div>
                  <div className="mock-pay paid">PAID</div>
                  <div className="mock-dur">02:10:00</div>
                  <div className="mock-earn" style={{ color: "#2d7a2d" }}>$162.50</div>
                </div>

                <div className="mock-row">
                  <div className="mock-dot2" style={{ background: "#2d7a2d" }} />
                  <div className="mock-date">22 Feb</div>
                  <div className="mock-task">
                    Design system tokens<div className="mock-task-note">Colors, spacing, typography</div>
                  </div>
                  <div className="mock-status" style={{ color: "#2d7a2d" }}>
                    DONE
                  </div>
                  <div className="mock-pay unpaid">UNPAID</div>
                  <div className="mock-dur">03:45:00</div>
                  <div className="mock-earn" style={{ color: "#2d7a2d" }}>$281.25</div>
                </div>
              </div>

              <div className="mock-stats-row">
                <div className="mock-stat-card">
                  <div style={{ fontSize: 9, color: "#bbb", letterSpacing: "0.15em", marginBottom: 2 }}>DONE</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 18 }}>12</div>
                </div>
                <div className="mock-stat-card">
                  <div style={{ fontSize: 9, color: "#bbb", letterSpacing: "0.15em", marginBottom: 2 }}>TOTAL HRS</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 18 }}>42.6</div>
                </div>
                <div className="mock-stat-card">
                  <div style={{ fontSize: 9, color: "#bbb", letterSpacing: "0.15em", marginBottom: 2 }}>UNPAID $</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 18, color: "#c47d00" }}>$1,128.00</div>
                </div>
                <div className="mock-stat-card">
                  <div style={{ fontSize: 9, color: "#bbb", letterSpacing: "0.15em", marginBottom: 2 }}>PAID $</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 18, color: "#2d7a2d" }}>$2,418.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="reveal">
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>{c.features.label}</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(36px,4.5vw,60px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {c.features.title1}
            <br />
            <em>{c.features.title2}</em>
          </h2>
        </div>

        <div className="features-grid">
          <div className="feat-card reveal">
            <div className="feat-num">01</div>
            <div className="feat-title">
              {c.features.c1t1} <em>{c.features.c1t2}</em>
            </div>
            <p className="feat-desc">{c.features.c1d}</p>
          </div>
          <div className="feat-card reveal">
            <div className="feat-num">02</div>
            <div className="feat-title">
              {c.features.c2t1} <em>{c.features.c2t2}</em>
            </div>
            <p className="feat-desc">{c.features.c2d}</p>
          </div>
          <div className="feat-card reveal">
            <div className="feat-num">03</div>
            <div className="feat-title">
              {c.features.c3t1} <em>{c.features.c3t2}</em>
            </div>
            <p className="feat-desc">{c.features.c3d}</p>
          </div>
          <div className="feat-card reveal">
            <div className="feat-num">04</div>
            <div className="feat-title">
              {c.features.c4t1} <em>{c.features.c4t2}</em>
            </div>
            <p className="feat-desc">{c.features.c4d}</p>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="reveal">
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>{c.pricing.label}</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(36px,4.5vw,60px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {c.pricing.title1}
            <br />
            <em>{c.pricing.title2}</em>
          </h2>
        </div>

        <div className="pricing-cards">
          <div className="pricing-card reveal">
            <div className="p-plan">{c.pricing.freeForever}</div>
            <div className="p-price">$0</div>
            <div className="p-period">{c.pricing.noCard}</div>
            <div className="p-feats">
              <div className="p-feat yes">{c.pricing.unlimitedTracking}</div>
              <div className="p-feat yes">{c.pricing.upToClients}</div>
              <div className="p-feat yes">{c.pricing.invoicePdf}</div>
              <div className="p-feat yes">{c.pricing.csvExport}</div>
              <div className="p-feat">{c.pricing.cloudSync}</div>
              <div className="p-feat">{c.pricing.multiDevice}</div>
            </div>
            <Link href="/dashboard" className="p-btn p-btn-outline">
              {c.pricing.getStarted}
            </Link>
          </div>

          <div className="pricing-card dark reveal">
            <div className="p-plan">
              Pro <span style={{ fontSize: 9, border: "1px solid #333", padding: "2px 7px", letterSpacing: "0.1em", verticalAlign: "middle" }}>{c.pricing.comingSoon}</span>
            </div>
            <div className="p-price">$9</div>
            <div className="p-period">{c.pricing.perMonth}</div>
            <div className="p-feats">
              <div className="p-feat yes">{c.pricing.unlimitedTracking}</div>
              <div className="p-feat yes">{c.pricing.unlimitedClients}</div>
              <div className="p-feat yes">{c.pricing.invoicePdf}</div>
              <div className="p-feat yes">{c.pricing.csvExport}</div>
              <div className="p-feat yes">{c.pricing.cloudSync}</div>
              <div className="p-feat yes">{c.pricing.multiDevice}</div>
            </div>
            <div className="p-soon">{c.pricing.notAvailable}</div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2 className="cta-title reveal">
          {c.cta.title1}
          <br />
          <em>{c.cta.title2}</em>
        </h2>
        <div className="reveal" style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center" }}>
          <Link href="/dashboard" className="btn-solid">
            {c.cta.tryFree}
          </Link>
          <a href="#preview" className="btn-ghost">
            {c.cta.seeApp}
          </a>
        </div>
      </section>

      <footer>
        <div className="f-logo">Logr</div>
        <div className="f-copy">{c.footer.copy}</div>
        <div className="f-links">
          <Link href="/dashboard">{c.footer.app}</Link>
          <a href="#pricing">{c.footer.pricing}</a>
          <a href="#">{c.footer.privacy}</a>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        .landing * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing {
          --bg: #fafafa;
          --text: #111;
          --muted: #aaa;
          --border: #e8e8e8;
          --dark: #0f0f0f;
          --green: #2d7a2d;
          background: var(--bg);
          color: var(--text);
          font-family: 'Instrument Sans', sans-serif;
          font-weight: 300;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        .landing a { color: inherit; text-decoration: none; }
        .landing nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 200;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 60px;
          transition: all 0.3s;
        }
        .landing nav.scrolled {
          background: rgba(250, 250, 250, 0.94);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .landing .nav-logo { font-family: 'Instrument Serif', serif; font-size: 22px; }
        .landing .nav-links { display: flex; gap: 36px; align-items: center; }
        .landing .nav-links a { font-size: 13px; color: var(--muted); transition: color 0.2s; }
        .landing .nav-links a:hover { color: var(--text); }
        .landing .nav-cta {
          background: var(--text) !important;
          color: var(--bg) !important;
          padding: 8px 20px;
          font-size: 13px;
        }
        .landing .nav-cta:hover { opacity: 0.75 !important; }

        .landing .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid var(--border);
        }
        .landing .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 140px 60px 80px;
          border-right: 1px solid var(--border);
        }
        .landing .hero-eyebrow {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 36px;
          opacity: 0;
          animation: up 0.8s ease 0.3s forwards;
        }
        .landing .hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(48px, 6.5vw, 96px);
          line-height: 1;
          letter-spacing: -0.025em;
          font-weight: 400;
          opacity: 0;
          animation: up 0.8s ease 0.5s forwards;
        }
        .landing .hero-title em { font-style: italic; color: var(--muted); }
        .landing .hero-sub {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.75;
          margin-top: 32px;
          max-width: 360px;
          opacity: 0;
          animation: up 0.8s ease 0.7s forwards;
        }
        .landing .hero-btns {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-top: 48px;
          opacity: 0;
          animation: up 0.8s ease 0.9s forwards;
        }
        .landing .btn-solid {
          background: var(--text);
          color: var(--bg);
          padding: 13px 28px;
          font-size: 13px;
          font-family: inherit;
          font-weight: 400;
          cursor: pointer;
          border: none;
          letter-spacing: 0.04em;
          transition: opacity 0.2s;
          display: inline-block;
        }
        .landing .btn-solid:hover { opacity: 0.7; }
        .landing .btn-ghost {
          font-size: 13px;
          color: var(--muted);
          border-bottom: 1px solid var(--border);
          padding-bottom: 1px;
          transition: all 0.2s;
        }
        .landing .btn-ghost:hover { color: var(--text); border-color: var(--text); }

        .landing .hero-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 140px 60px 80px;
          background: #f5f5f5;
          opacity: 0;
          animation: fadeIn 1s ease 1s forwards;
        }
        .landing .arm-device { border: 1px solid #d0d0d0; padding: 32px 40px; background: #fff; position: relative; }
        .landing .arm-device::before {
          content: "";
          position: absolute;
          inset: -8px;
          border: 1px solid #e8e8e8;
          pointer-events: none;
        }
        .landing .arm-device::after {
          content: "";
          position: absolute;
          inset: -16px;
          border: 1px solid #f0f0f0;
          pointer-events: none;
        }
        .landing .arm-label-top {
          font-size: 9px;
          letter-spacing: 0.25em;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .landing .arm-time-display {
          font-family: 'DM Mono', monospace;
          font-size: 52px;
          letter-spacing: 0.04em;
          color: var(--text);
          line-height: 1;
        }
        .landing .arm-time-display .colon { animation: blink 1s step-end infinite; }
        .landing .arm-divider { width: 100%; height: 1px; background: #e8e8e8; margin: 16px 0; }
        .landing .arm-earned-row { display: flex; justify-content: space-between; align-items: center; }
        .landing .arm-earned-val { font-family: 'DM Mono', monospace; font-size: 18px; color: var(--green); }
        .landing .arm-rate-badge {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.1em;
          border: 1px solid var(--border);
          padding: 3px 8px;
        }
        .landing .arm-project { font-size: 11px; color: var(--muted); margin-top: 16px; letter-spacing: 0.08em; }
        .landing .arm-project span { color: var(--text); }
        .landing .arm-caption {
          font-size: 11px;
          color: var(--muted);
          margin-top: 32px;
          text-align: center;
          letter-spacing: 0.08em;
          font-style: italic;
        }

        .landing .ticker { background: var(--dark); padding: 13px 0; overflow: hidden; }
        .landing .ticker-track { display: flex; width: max-content; animation: marquee 22s linear infinite; }
        .landing .ticker-item {
          font-size: 12px;
          color: #333;
          letter-spacing: 0.18em;
          padding: 0 52px;
          white-space: nowrap;
          font-family: 'DM Mono', monospace;
          text-transform: uppercase;
        }
        .landing .ticker-item.hi { color: #666; }

        .landing .impact { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid var(--border); }
        .landing .impact-block { padding: 56px 48px; border-right: 1px solid var(--border); }
        .landing .impact-block:last-child { border-right: none; }
        .landing .impact-big {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(48px, 5vw, 72px);
          line-height: 1;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }
        .landing .impact-big em { font-style: italic; color: var(--muted); }
        .landing .impact-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }
        .landing .impact-desc strong { color: var(--text); font-weight: 400; }

        .landing .preview-section { padding: 100px 60px; border-bottom: 1px solid var(--border); }
        .landing .preview-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 64px; }
        .landing .preview-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(32px, 4vw, 56px);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .landing .preview-title em { font-style: italic; color: var(--muted); }
        .landing .preview-subtitle {
          font-size: 13px;
          color: var(--muted);
          max-width: 280px;
          line-height: 1.7;
          text-align: right;
        }

        .landing .app-mock {
          border: 1px solid var(--border);
          background: #fff;
          overflow: hidden;
          box-shadow: 0 2px 40px rgba(0, 0, 0, 0.06);
        }
        .landing .mock-topbar {
          background: #fafafa;
          border-bottom: 1px solid var(--border);
          padding: 14px 20px;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .landing .mock-dot { width: 10px; height: 10px; border-radius: 50%; }
        .landing .mock-url {
          flex: 1;
          text-align: center;
          font-size: 11px;
          color: var(--muted);
          font-family: 'DM Mono', monospace;
        }
        .landing .mock-inner { display: grid; grid-template-columns: 220px 1fr; min-height: 560px; }
        .landing .mock-sidebar {
          border-right: 1px solid var(--border);
          padding: 24px 0;
          background: #fafafa;
          display: flex;
          flex-direction: column;
        }
        .landing .mock-sidebar-label { font-size: 9px; color: var(--muted); letter-spacing: 0.2em; padding: 0 20px; margin-bottom: 12px; }
        .landing .mock-app-nav { display: grid; gap: 4px; padding: 0 20px; margin-bottom: 16px; }
        .landing .mock-app-btn {
          font-size: 10px;
          letter-spacing: 0.12em;
          border: 1px solid var(--border);
          padding: 6px 8px;
          color: #aaa;
        }
        .landing .mock-app-btn.active { background: #f0f0f0; color: #222; border-color: #ddd; }
        .landing .mock-client {
          display: flex;
          align-items: center;
          padding: 8px 20px;
          font-size: 12px;
          cursor: pointer;
          border-left: 2px solid transparent;
        }
        .landing .mock-client.active {
          border-left-color: #111;
          background: #f0f0f0;
          color: #111;
          font-weight: 400;
        }
        .landing .mock-client:not(.active) { color: #bbb; }
        .landing .mock-main { padding: 28px 32px; }
        .landing .mock-timer-label { font-size: 9px; color: var(--muted); letter-spacing: 0.2em; margin-bottom: 6px; }
        .landing .mock-timer {
          font-family: 'DM Mono', monospace;
          font-size: 42px;
          color: #111;
          line-height: 1;
          margin-bottom: 4px;
        }
        .landing .mock-timer .blink-dot { color: #ff4444; font-size: 14px; animation: blink 1s step-end infinite; }
        .landing .mock-tabs { display: flex; gap: 4px; margin: 16px 0; }
        .landing .mock-tab { font-size: 10px; padding: 4px 10px; border: 1px solid var(--border); color: var(--muted); cursor: pointer; }
        .landing .mock-tab.active { border-color: #111; color: #111; background: #f5f5f5; }
        .landing .mock-filters { display: flex; gap: 4px; margin: 12px 0 8px; font-size: 10px; color: #ccc; letter-spacing: 0.12em; }
        .landing .mock-filters span { border: 1px solid #e8e8e8; padding: 3px 8px; }
        .landing .mock-filters span.active { background: #f5f5f5; color: #333; }
        .landing .mock-input-row { display: flex; gap: 8px; margin-bottom: 8px; }
        .landing .mock-input {
          flex: 1;
          border: 1px solid var(--border);
          padding: 10px 12px;
          font-size: 12px;
          color: #bbb;
          font-family: 'DM Mono', monospace;
          background: #fff;
        }
        .landing .mock-input.small { flex: 0 0 72px; }
        .landing .mock-action-row { display: grid; grid-template-columns: 160px 90px 1fr; gap: 8px; margin: 10px 0 20px; }
        .landing .mock-timebox { border: 1px solid var(--border); padding: 8px 10px; font-size: 10px; color: #999; }
        .landing .mock-timebox span { display: block; font-size: 9px; letter-spacing: 0.12em; margin-bottom: 3px; }
        .landing .mock-timebox div { color: #222; font-family: 'DM Mono', monospace; font-size: 12px; }
        .landing .mock-statusbox {
          border: 1px solid var(--border);
          display: grid;
          place-items: center;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #c45757;
        }
        .landing .mock-btns { display: flex; gap: 6px; }
        .landing .mock-btn {
          flex: 1;
          padding: 10px;
          font-size: 11px;
          letter-spacing: 0.08em;
          font-family: 'DM Mono', monospace;
          border: none;
          cursor: pointer;
        }
        .landing .mock-btn.start { background: #111; color: #fff; }
        .landing .mock-btn.pending { background: #fff; border: 1px solid var(--border); color: #999; }
        .landing .mock-sessions { border-top: 1px solid var(--border); padding-top: 16px; }
        .landing .mock-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #f5f5f5; }
        .landing .mock-dot2 { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .landing .mock-date { font-size: 10px; color: var(--muted); min-width: 44px; font-family: 'DM Mono', monospace; }
        .landing .mock-task { flex: 1; font-size: 12px; color: #333; }
        .landing .mock-task-note { font-size: 10px; color: var(--muted); }
        .landing .mock-status { font-size: 9px; letter-spacing: 0.1em; min-width: 46px; font-family: 'DM Mono', monospace; }
        .landing .mock-pay {
          font-size: 8px;
          letter-spacing: 0.08em;
          border: 1px solid;
          padding: 2px 5px;
          font-family: 'DM Mono', monospace;
        }
        .landing .mock-pay.paid { color: #2d7a2d; border-color: #2d7a2d; }
        .landing .mock-pay.unpaid { color: #c47d00; border-color: #c47d00; }
        .landing .mock-dur {
          font-size: 11px;
          color: var(--muted);
          font-family: 'DM Mono', monospace;
          min-width: 52px;
          text-align: right;
        }
        .landing .mock-earn {
          font-size: 12px;
          min-width: 52px;
          text-align: right;
          font-family: 'DM Mono', monospace;
        }
        .landing .mock-stats-row {
          display: flex;
          gap: 1px;
          background: var(--border);
          margin-top: 16px;
        }
        .landing .mock-stat-card {
          flex: 1;
          background: #fafafa;
          padding: 10px 14px;
        }

        .landing .features-section { padding: 100px 60px; border-bottom: 1px solid var(--border); }
        .landing .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); margin-top: 64px; }
        .landing .feat-card { background: var(--bg); padding: 48px 40px; transition: background 0.2s; }
        .landing .feat-card:hover { background: #f5f5f5; }
        .landing .feat-num { font-size: 11px; color: var(--muted); letter-spacing: 0.15em; margin-bottom: 20px; }
        .landing .feat-title {
          font-family: 'Instrument Serif', serif;
          font-size: 26px;
          font-weight: 400;
          letter-spacing: -0.01em;
          margin-bottom: 12px;
        }
        .landing .feat-title em { font-style: italic; color: var(--muted); }
        .landing .feat-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

        .landing .pricing-section { padding: 100px 60px; border-bottom: 1px solid var(--border); }
        .landing .pricing-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          max-width: 760px;
          margin-top: 64px;
        }
        .landing .pricing-card { background: var(--bg); padding: 52px 44px; }
        .landing .pricing-card.dark { background: var(--dark); color: #e8e8e8; }
        .landing .p-plan {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 28px;
        }
        .landing .dark .p-plan { color: #555; }
        .landing .p-price {
          font-family: 'Instrument Serif', serif;
          font-size: 72px;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .landing .p-period { font-size: 13px; color: var(--muted); margin-bottom: 40px; }
        .landing .dark .p-period { color: #555; }
        .landing .p-feats { margin-bottom: 44px; }
        .landing .p-feat { font-size: 14px; color: var(--muted); padding: 11px 0; border-bottom: 1px solid var(--border); }
        .landing .dark .p-feat { color: #444; border-color: #1e1e1e; }
        .landing .p-feat.yes { color: var(--text); }
        .landing .dark .p-feat.yes { color: #e8e8e8; }
        .landing .p-btn {
          display: block;
          text-align: center;
          padding: 14px;
          font-size: 13px;
          letter-spacing: 0.06em;
          font-family: inherit;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
        }
        .landing .p-btn-outline { border: 1px solid var(--border) !important; color: var(--muted); background: transparent; }
        .landing .p-btn-outline:hover { border-color: var(--text) !important; color: var(--text); }
        .landing .p-soon {
          display: block;
          text-align: center;
          padding: 14px;
          font-size: 12px;
          letter-spacing: 0.12em;
          color: #333;
          border: 1px solid #1e1e1e;
          text-transform: uppercase;
        }

        .landing .cta { padding: 160px 60px; text-align: center; border-bottom: 1px solid var(--border); }
        .landing .cta-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(44px, 7vw, 100px);
          font-weight: 400;
          letter-spacing: -0.025em;
          line-height: 1.02;
          margin-bottom: 48px;
        }
        .landing .cta-title em { font-style: italic; color: var(--muted); }

        .landing footer {
          padding: 36px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .landing .f-logo { font-family: 'Instrument Serif', serif; font-size: 18px; }
        .landing .f-copy { font-size: 12px; color: var(--muted); }
        .landing .f-links { display: flex; gap: 24px; }
        .landing .f-links a { font-size: 12px; color: var(--muted); transition: color 0.2s; }
        .landing .f-links a:hover { color: var(--text); }

        .landing .reveal {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .landing .reveal.on { opacity: 1; transform: none; }

        @keyframes up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        @media (max-width: 768px) {
          .landing nav { padding: 18px 20px; }
          .landing .nav-links { display: none; }
          .landing .hero { grid-template-columns: 1fr; }
          .landing .hero-left { padding: 100px 24px 60px; }
          .landing .hero-right {
            display: flex;
            padding: 28px 24px 56px;
            border-top: 1px solid var(--border);
            background: #fafafa;
          }
          .landing .arm-label-top { margin-bottom: 14px; font-size: 8px; }
          .landing .arm-device { padding: 18px 20px; }
          .landing .arm-time-display { font-size: 34px; }
          .landing .arm-earned-val { font-size: 15px; }
          .landing .arm-rate-badge { font-size: 9px; padding: 2px 6px; }
          .landing .arm-project { margin-top: 12px; font-size: 10px; }
          .landing .arm-caption { margin-top: 16px; font-size: 10px; letter-spacing: 0.04em; }
          .landing .impact { grid-template-columns: 1fr; }
          .landing .impact-block { border-right: none; border-bottom: 1px solid var(--border); }
          .landing .preview-section,
          .landing .features-section,
          .landing .pricing-section { padding: 80px 24px; }
          .landing .preview-header { flex-direction: column; gap: 20px; align-items: flex-start; }
          .landing .preview-subtitle { text-align: left; }
          .landing .mock-inner { grid-template-columns: 1fr; }
          .landing .mock-sidebar { display: none; }
          .landing .mock-main { padding: 20px 16px; }
          .landing .mock-topbar { padding: 12px 14px; }
          .landing .mock-url { font-size: 10px; }
          .landing .mock-timer { font-size: 30px; }
          .landing .mock-tabs { flex-wrap: wrap; }
          .landing .mock-filters { flex-wrap: wrap; }
          .landing .mock-input-row { flex-wrap: wrap; }
          .landing .mock-action-row { grid-template-columns: 1fr; }
          .landing .mock-input.small { flex: 1 1 120px; }
          .landing .mock-row { flex-wrap: wrap; gap: 6px; }
          .landing .mock-date { min-width: 40px; }
          .landing .mock-task { min-width: calc(100% - 54px); }
          .landing .mock-status { min-width: 58px; }
          .landing .mock-pay { margin-right: auto; }
          .landing .mock-dur,
          .landing .mock-earn { min-width: auto; text-align: left; }
          .landing .mock-stats-row { flex-wrap: wrap; }
          .landing .mock-stat-card { min-width: calc(50% - 1px); }
          .landing .features-grid,
          .landing .pricing-cards { grid-template-columns: 1fr; }
          .landing .cta { padding: 100px 24px; }
          .landing footer {
            flex-direction: column;
            gap: 16px;
            text-align: center;
            padding: 28px 24px;
          }
        }
      `}</style>
    </div>
  );
}
