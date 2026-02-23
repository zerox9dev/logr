"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function formatClock(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [heroSeconds, setHeroSeconds] = useState(0);
  const [termSeconds, setTermSeconds] = useState(3600 + 23 * 60 + 47);

  const termEarned = useMemo(() => `$${((termSeconds / 3600) * 75).toFixed(2)}`, [termSeconds]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const heroInterval = window.setInterval(() => setHeroSeconds((v) => v + 1), 1000);
    const termInterval = window.setInterval(() => setTermSeconds((v) => v + 1), 1000);

    const reveals = document.querySelectorAll(".landing .reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            window.setTimeout(() => entry.target.classList.add("visible"), index * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    reveals.forEach((el) => observer.observe(el));

    return () => {
      window.clearInterval(heroInterval);
      window.clearInterval(termInterval);
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
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link href="/tracker" className="nav-cta">
            Try Free
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg-timer">{formatClock(heroSeconds)}</div>
        <div className="hero-label">Freelance Time Tracker</div>
        <h1 className="hero-headline">
          Stop Losing
          <br />
          Money to <em>Lost Hours</em>
        </h1>
        <p className="hero-sub">
          Logr tracks your time, organizes clients and projects, and generates invoices so you get paid for every minute you work.
        </p>
        <div className="hero-actions">
          <Link href="/tracker" className="btn-primary">
            Start Tracking Free
          </Link>
          <a href="#how" className="btn-ghost">
            See how it works
          </a>
        </div>
        <div className="hero-scroll">Scroll ↓</div>
      </section>

      <div className="marquee-wrap">
        <div className="marquee-track">
          {[
            "Track Time",
            "Log Clients",
            "Add Projects",
            "Export Invoice",
            "Get Paid",
            "Track Time",
            "Log Clients",
            "Add Projects",
            "Export Invoice",
            "Get Paid",
          ].map((item, i) => (
            <div className="marquee-item" key={`${item}-${i}`}>
              <span>{String((i % 10) + 1).padStart(2, "0")}</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <section className="problem">
        <div className="section-label reveal">The Problem</div>
        <h2 className="section-title reveal">
          Freelancers Leave <em>Thousands</em>
          <br />
          on the Table Every Year
        </h2>
        <div className="problem-grid">
          <div className="problem-card reveal">
            <div className="problem-num">73%</div>
            <p className="problem-text">
              of freelancers admit to <strong>undercharging clients</strong> because they cannot prove exactly how much time a project took.
            </p>
          </div>
          <div className="problem-card reveal">
            <div className="problem-num">2.5h</div>
            <p className="problem-text">
              average time lost per week on <strong>admin work</strong> like invoices, spreadsheets, and follow-ups.
            </p>
          </div>
          <div className="problem-card reveal">
            <div className="problem-num">$0</div>
            <p className="problem-text">
              earned for <strong>unbilled work</strong> done quickly, short calls and fixes that still consume real time.
            </p>
          </div>
          <div className="problem-card reveal">
            <div className="problem-num">1 app</div>
            <p className="problem-text">
              Logr replaces spreadsheets, sticky notes, and guessed hours with <strong>one clean workflow</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-label reveal">Features</div>
        <h2 className="section-title reveal">
          Everything a Freelancer
          <br />
          Actually <em>Needs</em>
        </h2>
        <div className="features-grid">
          {[
            ["⏱", "One-Click Timer", "Hit Space to start and stop. Name task, set rate, track instantly."],
            ["🗂", "Clients & Projects", "Organize work by client and project with clear breakdowns."],
            ["📋", "Task Statuses", "PENDING to ACTIVE to DONE without losing task context."],
            ["📅", "Manual Entry", "Add past sessions by date when you forgot to start timer."],
            ["📄", "Invoice Export", "Generate clean printable invoice PDF in one click."],
            ["📊", "CSV Export", "Export sessions for accounting, taxes, or analysis."],
          ].map(([icon, name, desc]) => (
            <div className="feature-card reveal" key={name}>
              <div className="feature-icon">{icon}</div>
              <div className="feature-name">{name}</div>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-label reveal">How It Works</div>
        <h2 className="section-title reveal">
          Three Steps to
          <br />
          <em>Getting Paid</em>
        </h2>
        <div className="how-steps">
          {["Add Your Client", "Track Your Work", "Send the Invoice"].map((title, idx) => (
            <div className="reveal" key={title}>
              <div className="step-num">{String(idx + 1).padStart(2, "0")}</div>
              <div className="step-name">{title}</div>
              <p className="step-desc">
                {idx === 0 && "Create client/project structure and set your rate."}
                {idx === 1 && "Start timer in seconds and keep notes for billing clarity."}
                {idx === 2 && "Filter sessions and export a professional invoice instantly."}
              </p>
              <span className="step-tag">{idx === 0 ? "30 seconds" : idx === 1 ? "2 keystrokes" : "1 click"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="terminal-section">
        <div className="reveal">
          <div className="section-label">Built for Speed</div>
          <h2 className="section-title">
            Keyboard-First.
            <br />
            <em>No Friction.</em>
          </h2>
          <p className="terminal-copy">Logr is made for focused work. Time tracking should be instant, not another admin burden.</p>
        </div>
        <div className="terminal reveal">
          <div className="terminal-bar">
            <div className="t-dot red" />
            <div className="t-dot yellow" />
            <div className="t-dot green" />
            <span className="terminal-title">LOGR — ACME Corp / Redesign</span>
          </div>
          <div className="terminal-body">
            <div className="t-muted">{"// Mon 23 Feb — 09:14"}</div>
            <div className="t-white">
              ▶ <span className="t-yellow">Homepage redesign</span>
            </div>
            <div className="t-muted">rate: $75/hr · status: ACTIVE</div>
            <div className="t-muted">──────────────────────────────</div>
            <div className="t-white">
              elapsed: <span className="t-green">{formatClock(termSeconds)}</span>
            </div>
            <div className="t-white">
              earned: <span className="t-green">{termEarned}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="section-label reveal">Pricing</div>
        <h2 className="section-title reveal">
          Simple.
          <br />
          <em>No Surprises.</em>
        </h2>
        <div className="pricing-grid">
          <div className="pricing-card reveal">
            <div className="pricing-plan">Full Free Access</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-period">All features included for now</div>
            <ul className="pricing-features">
              <li>Unlimited time tracking</li>
              <li>Unlimited clients</li>
              <li>CSV export</li>
              <li>Invoice PDF</li>
              <li>Cloud sync</li>
              <li>Multi-device</li>
              <li>Priority support</li>
            </ul>
            <Link href="/tracker" className="btn-plan btn-plan-outline">
              Start Free
            </Link>
          </div>
          <div className="pricing-card featured reveal">
            <div className="pricing-plan">Pro</div>
            <div className="pricing-price">
              <span style={{ fontSize: 32 }}>Unavailable</span>
            </div>
            <div className="pricing-period">Temporarily not available</div>
            <ul className="pricing-features">
              <li>Unlimited time tracking</li>
              <li>Unlimited clients</li>
              <li>CSV export</li>
              <li>Invoice PDF</li>
              <li>Cloud sync</li>
              <li>Multi-device</li>
              <li>Priority support</li>
            </ul>
            <span className="btn-plan btn-plan-disabled">Temporarily Unavailable</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-bg">LOGR</div>
        <div className="section-label reveal">Get Started</div>
        <h2 className="section-title reveal">
          Start Tracking.
          <br />
          <em>Start Earning More.</em>
        </h2>
        <div className="hero-actions reveal">
          <Link href="/tracker" className="btn-primary">
            Try Logr Free
          </Link>
          <a href="#features" className="btn-ghost">
            See all features
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-logo">Logr</div>
        <div className="footer-copy">© 2026 Logr. Built for freelancers.</div>
        <div className="footer-links">
          <Link href="/tracker">App</Link>
          <a href="#pricing">Pricing</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&display=swap');
        .landing { --bg: #f7f4ef; --text: #1a1a1a; --muted: #888; --border: #ddd8d0; --accent: #b8860b; --accent2: #2d7a2d; background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; overflow-x: hidden; }
        .landing * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 20px 60px; border-bottom: 1px solid transparent; transition: border-color 0.3s, background 0.3s; }
        .landing nav.scrolled { border-color: var(--border); background: rgba(247,244,239,0.95); backdrop-filter: blur(10px); }
        .landing .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.05em; color: var(--text); text-decoration: none; }
        .landing .nav-links { display: flex; gap: 32px; align-items: center; }
        .landing .nav-links a { font-size: 11px; color: var(--muted); text-decoration: none; letter-spacing: 0.15em; text-transform: uppercase; }
        .landing .nav-cta { font-size: 11px; color: var(--bg) !important; background: var(--text); padding: 8px 20px; letter-spacing: 0.15em; text-transform: uppercase; }
        .landing section { padding: 120px 60px; }
        .landing .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 60px 80px; position: relative; overflow: hidden; }
        .landing .hero-bg-timer { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: 'Bebas Neue', sans-serif; font-size: clamp(120px, 22vw, 340px); color: transparent; -webkit-text-stroke: 1px #ddd8d0; letter-spacing: 0.02em; white-space: nowrap; pointer-events: none; }
        .landing .hero-label { font-size: 10px; color: var(--muted); letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 24px; }
        .landing .hero-headline { font-family: 'Bebas Neue', sans-serif; font-size: clamp(56px, 9vw, 130px); line-height: 0.92; letter-spacing: 0.02em; max-width: 900px; }
        .landing em { font-family: 'Playfair Display', serif; font-style: italic; color: var(--accent); }
        .landing .hero-sub { margin-top: 32px; font-size: 14px; color: var(--muted); line-height: 1.7; max-width: 440px; }
        .landing .hero-actions { display: flex; gap: 16px; align-items: center; margin-top: 48px; }
        .landing .btn-primary { background: var(--text); color: var(--bg); padding: 16px 40px; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.1em; text-decoration: none; }
        .landing .btn-ghost { color: var(--muted); font-size: 11px; letter-spacing: 0.15em; text-decoration: none; text-transform: uppercase; border-bottom: 1px solid var(--border); padding-bottom: 2px; }
        .landing .hero-scroll { position: absolute; bottom: 40px; right: 60px; font-size: 10px; color: var(--muted); letter-spacing: 0.2em; writing-mode: vertical-rl; text-transform: uppercase; }
        .landing .marquee-wrap { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 14px 0; overflow: hidden; background: #0f0f0f; }
        .landing .marquee-track { display: flex; width: max-content; animation: marquee 30s linear infinite; }
        .landing .marquee-item { font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 0.2em; color: #555; padding: 0 40px; white-space: nowrap; }
        .landing .marquee-item span { color: var(--accent); margin-right: 40px; }
        .landing .section-label { font-size: 10px; color: var(--muted); letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 20px; }
        .landing .section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 6vw, 80px); line-height: 0.95; letter-spacing: 0.02em; }
        .landing .problem, .landing .features, .landing .pricing, .landing .cta-section { border-top: 1px solid var(--border); }
        .landing .problem-grid, .landing .features-grid, .landing .pricing-grid { display: grid; gap: 1px; margin-top: 80px; background: var(--border); }
        .landing .problem-grid { grid-template-columns: 1fr 1fr; }
        .landing .features-grid { grid-template-columns: repeat(3, 1fr); }
        .landing .pricing-grid { grid-template-columns: 1fr 1fr; max-width: 800px; }
        .landing .problem-card, .landing .feature-card, .landing .pricing-card { background: var(--bg); padding: 40px; }
        .landing .problem-num { font-family: 'Bebas Neue', sans-serif; font-size: 72px; color: #e8e3dc; line-height: 1; margin-bottom: 16px; }
        .landing .problem-text, .landing .feature-desc, .landing .step-desc { font-size: 13px; color: var(--muted); line-height: 1.7; }
        .landing .feature-name, .landing .step-name { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; }
        .landing .feature-name { font-size: 22px; margin-bottom: 12px; }
        .landing .how { border-top: 1px solid var(--border); background: #f0ece5; }
        .landing .how-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 80px; margin-top: 80px; }
        .landing .step-num { font-family: 'Bebas Neue', sans-serif; font-size: 96px; color: #e8e3dc; line-height: 1; margin-bottom: -16px; }
        .landing .step-name { font-size: 28px; margin-bottom: 12px; }
        .landing .step-tag { display: inline-block; margin-top: 16px; font-size: 10px; color: var(--accent2); letter-spacing: 0.15em; border: 1px solid var(--accent2); padding: 3px 10px; text-transform: uppercase; }
        .landing .terminal-section { border-top: 1px solid var(--border); display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .landing .terminal-copy { color: var(--muted); font-size: 13px; line-height: 1.8; margin-top: 24px; max-width: 380px; }
        .landing .terminal { background: #1a1a1a; border: 1px solid #333; font-size: 13px; overflow: hidden; }
        .landing .terminal-bar { background: #111; padding: 10px 16px; border-bottom: 1px solid #333; display: flex; gap: 8px; align-items: center; }
        .landing .terminal-title { font-size: 10px; color: #666; margin-left: 8px; letter-spacing: 0.1em; }
        .landing .t-dot { width: 10px; height: 10px; border-radius: 50%; }
        .landing .t-dot.red { background: #ff5f57; }
        .landing .t-dot.yellow { background: #febc2e; }
        .landing .t-dot.green { background: #28c840; }
        .landing .terminal-body { padding: 24px 20px; line-height: 1.9; }
        .landing .t-muted { color: #666; }
        .landing .t-green { color: var(--accent2); }
        .landing .t-yellow { color: var(--accent); }
        .landing .t-white { color: #e8e8e8; }
        .landing .pricing-plan { font-size: 10px; color: var(--muted); letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 16px; }
        .landing .pricing-price { font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: 1; margin-bottom: 8px; }
        .landing .pricing-price sub { font-size: 20px; vertical-align: bottom; color: var(--muted); }
        .landing .pricing-period { font-size: 11px; color: var(--muted); margin-bottom: 32px; }
        .landing .pricing-features { list-style: none; margin-bottom: 40px; }
        .landing .pricing-features li { font-size: 13px; color: var(--muted); padding: 8px 0; border-bottom: 1px solid var(--border); display: flex; gap: 10px; align-items: center; }
        .landing .pricing-features li::before { content: "—"; color: var(--accent2); }
        .landing .pricing-features li.inactive { opacity: 0.3; }
        .landing .pricing-features li.inactive::before { color: var(--muted); }
        .landing .pricing-card.featured { background: #ede9e2; }
        .landing .btn-plan { display: block; text-align: center; padding: 14px; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.1em; text-decoration: none; }
        .landing .btn-plan-outline { border: 1px solid var(--border); color: var(--muted); }
        .landing .btn-plan-solid { background: var(--text); color: var(--bg); }
        .landing .btn-plan-disabled { border: 1px dashed var(--border); color: var(--muted); opacity: 0.6; cursor: not-allowed; pointer-events: none; }
        .landing .cta-section { text-align: center; padding: 160px 60px; position: relative; overflow: hidden; }
        .landing .cta-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: 'Bebas Neue', sans-serif; font-size: clamp(80px, 18vw, 280px); color: transparent; -webkit-text-stroke: 1px #ddd8d0; white-space: nowrap; pointer-events: none; }
        .landing footer { border-top: 1px solid var(--border); padding: 40px 60px; display: flex; justify-content: space-between; align-items: center; }
        .landing .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: var(--muted); letter-spacing: 0.05em; }
        .landing .footer-copy, .landing .footer-links a { font-size: 11px; color: var(--muted); letter-spacing: 0.1em; text-decoration: none; }
        .landing .footer-links { display: flex; gap: 24px; }
        .landing .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .landing .reveal.visible { opacity: 1; transform: none; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (max-width: 768px) {
          .landing nav { padding: 16px 20px; }
          .landing .nav-links { display: none; }
          .landing section { padding: 80px 20px; }
          .landing .hero { padding: 0 20px 60px; }
          .landing .problem-grid, .landing .features-grid, .landing .how-steps, .landing .terminal-section, .landing .pricing-grid { grid-template-columns: 1fr; }
          .landing .cta-section { padding: 100px 20px; }
          .landing footer { flex-direction: column; gap: 20px; text-align: center; }
          .landing .footer-links { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
