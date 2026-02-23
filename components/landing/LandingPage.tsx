"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function formatClock(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);

    const timer = window.setInterval(() => {
      setSeconds((v) => v + 1);
    }, 1000);

    const els = document.querySelectorAll(".landing .reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            window.setTimeout(() => entry.target.classList.add("on"), index * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    els.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(timer);
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
            Try free
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-eyebrow">Time tracking for freelancers</div>
        <h1 className="hero-title">
          Track your hours.
          <br />
          Invoice your clients.
          <br />
          <em>Get paid.</em>
        </h1>
        <div className="hero-bottom">
          <p className="hero-sub">
            Logr is a minimal time tracker built around how freelancers actually work - fast to start, easy to invoice, no bloat.
          </p>
          <div>
            <div className="hero-actions">
              <Link href="/tracker" className="btn-dark">
                Start for free
              </Link>
              <a href="#how" className="btn-link">
                See how it works
              </a>
            </div>
            <div className="hero-timer">{formatClock(seconds)}</div>
          </div>
        </div>
      </section>

      <div className="statbar">
        <div className="stat reveal">
          <div className="stat-num">$0</div>
          <div className="stat-label">to start - free forever</div>
        </div>
        <div className="stat reveal">
          <div className="stat-num">2s</div>
          <div className="stat-label">to log a new task</div>
        </div>
        <div className="stat reveal">
          <div className="stat-num">1x</div>
          <div className="stat-label">click to generate invoice</div>
        </div>
      </div>

      <section className="section" id="features">
        <div className="section-header">
          <span className="section-num reveal">01</span>
          <h2 className="section-title reveal">
            Everything you need.
            <br />
            <em>Nothing you don&apos;t.</em>
          </h2>
        </div>
        <div className="features-list">
          <div className="feature-row reveal">
            <div className="feature-index">01</div>
            <div className="feature-name">One-click timer</div>
            <div className="feature-desc">Press Space to start tracking. Press Space again to stop. Your hours are logged instantly - no forms, no friction.</div>
          </div>
          <div className="feature-row reveal">
            <div className="feature-index">02</div>
            <div className="feature-name">Clients &amp; Projects</div>
            <div className="feature-desc">Organize everything under clients, then break them down into projects. See earnings per client at a glance.</div>
          </div>
          <div className="feature-row reveal">
            <div className="feature-index">03</div>
            <div className="feature-name">Task statuses</div>
            <div className="feature-desc">Mark tasks as Pending before you start. Move to Active. Finish as Done. Nothing falls through the cracks.</div>
          </div>
          <div className="feature-row reveal">
            <div className="feature-index">04</div>
            <div className="feature-name">Session notes</div>
            <div className="feature-desc">Add a one-line note to each session. It appears on your invoice so clients know exactly what they&apos;re paying for.</div>
          </div>
          <div className="feature-row reveal">
            <div className="feature-index">05</div>
            <div className="feature-name">Invoice PDF</div>
            <div className="feature-desc">Filter sessions by client and month, then generate a clean invoice PDF in one click. Ready to send.</div>
          </div>
          <div className="feature-row reveal">
            <div className="feature-index">06</div>
            <div className="feature-name">Date filters</div>
            <div className="feature-desc">View this week, this month, or any specific month. Perfect for invoicing by billing cycle.</div>
          </div>
        </div>
      </section>

      <section className="section" id="how" style={{ paddingBottom: 0 }}>
        <div className="section-header">
          <span className="section-num reveal">02</span>
          <h2 className="section-title reveal">
            Three steps.
            <br />
            <em>That&apos;s it.</em>
          </h2>
        </div>
        <div className="how-steps">
          <div className="how-step reveal">
            <div className="how-step-num">STEP 01</div>
            <div className="how-step-title">Add a client</div>
            <p className="how-step-desc">Create a client in the sidebar. Optionally add projects. Set your hourly rate once - Logr remembers it for every session.</p>
          </div>
          <div className="how-step reveal">
            <div className="how-step-num">STEP 02</div>
            <div className="how-step-title">Track your work</div>
            <p className="how-step-desc">Type what you&apos;re working on. Press Space or Enter to start the timer. Add a note for the invoice. Stop when you&apos;re done.</p>
          </div>
          <div className="how-step reveal">
            <div className="how-step-num">STEP 03</div>
            <div className="how-step-title">Send the invoice</div>
            <p className="how-step-desc">Pick a client, filter by month, click Invoice PDF. A clean professional invoice is ready in under a minute.</p>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="section-header">
          <span className="section-num reveal">03</span>
          <h2 className="section-title reveal">
            Simple pricing.
            <br />
            <em>No surprises.</em>
          </h2>
        </div>
        <div className="pricing-wrap">
          <div className="pricing-card reveal">
            <div className="pricing-plan">Free</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-period">No credit card</div>
            <div className="pricing-feats">
              <div className="pricing-feat">Unlimited time tracking</div>
              <div className="pricing-feat">Up to 3 clients</div>
              <div className="pricing-feat">Invoice PDF</div>
              <div className="pricing-feat">CSV export</div>
              <div className="pricing-feat off">Cloud sync</div>
              <div className="pricing-feat off">Multi-device</div>
            </div>
            <Link href="/tracker" className="btn-dark-outline">
              Get started
            </Link>
          </div>
          <div className="pricing-card hi reveal">
            <div className="pricing-plan">
              Pro <span className="coming-soon">COMING SOON</span>
            </div>
            <div className="pricing-price">$9</div>
            <div className="pricing-period">per month</div>
            <div className="pricing-feats">
              <div className="pricing-feat">Unlimited time tracking</div>
              <div className="pricing-feat">Unlimited clients</div>
              <div className="pricing-feat">Invoice PDF</div>
              <div className="pricing-feat">CSV export</div>
              <div className="pricing-feat">Cloud sync</div>
              <div className="pricing-feat">Multi-device</div>
            </div>
            <span className="btn-disabled">Not available yet</span>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2 className="cta-title reveal">
          Stop guessing.
          <br />
          Start <em>tracking.</em>
        </h2>
        <div className="cta-actions reveal">
          <Link href="/tracker" className="btn-dark">
            Try Logr for free
          </Link>
          <a href="#features" className="btn-link">
            Learn more
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-logo">Logr</div>
        <div className="footer-copy">© 2026 Logr</div>
        <div className="footer-links">
          <Link href="/tracker">App</Link>
          <a href="#pricing">Pricing</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@300;400&display=swap');
        .landing * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing {
          --bg: #fafafa;
          --text: #111;
          --muted: #999;
          --border: #e8e8e8;
          --accent: #111;
          background: var(--bg);
          color: var(--text);
          font-family: 'Instrument Sans', sans-serif;
          font-weight: 300;
          -webkit-font-smoothing: antialiased;
        }
        .landing a { color: inherit; text-decoration: none; }
        .landing nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 64px;
          background: rgba(250, 250, 250, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.4s;
        }
        .landing nav.scrolled { border-color: var(--border); }
        .landing .nav-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          letter-spacing: -0.01em;
        }
        .landing .nav-links { display: flex; gap: 40px; align-items: center; }
        .landing .nav-links a {
          font-size: 13px;
          color: var(--muted);
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .landing .nav-links a:hover { color: var(--text); }
        .landing .nav-cta {
          font-size: 13px;
          color: var(--bg) !important;
          background: var(--text);
          padding: 9px 22px;
          transition: opacity 0.2s !important;
        }
        .landing .nav-cta:hover { opacity: 0.7 !important; }
        .landing .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 64px 80px;
          border-bottom: 1px solid var(--border);
        }
        .landing .hero-eyebrow {
          font-size: 12px;
          color: var(--muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 40px;
          opacity: 0;
          animation: up 0.8s ease 0.2s forwards;
        }
        .landing .hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(52px, 7.5vw, 112px);
          line-height: 1.02;
          letter-spacing: -0.02em;
          font-weight: 400;
          max-width: 860px;
          opacity: 0;
          animation: up 0.8s ease 0.4s forwards;
        }
        .landing .hero-title em { font-style: italic; color: var(--muted); }
        .landing .hero-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 80px;
          opacity: 0;
          animation: up 0.8s ease 0.6s forwards;
        }
        .landing .hero-sub {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 380px;
        }
        .landing .hero-actions { display: flex; gap: 20px; align-items: center; }
        .landing .btn-dark {
          background: var(--text);
          color: var(--bg);
          padding: 14px 32px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 300;
          letter-spacing: 0.04em;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
          display: inline-block;
        }
        .landing .btn-dark:hover { opacity: 0.7; }
        .landing .btn-link {
          font-size: 13px;
          color: var(--muted);
          border-bottom: 1px solid var(--border);
          padding-bottom: 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .landing .btn-link:hover { color: var(--text); border-color: var(--text); }
        .landing .hero-timer {
          margin-top: 20px;
          text-align: right;
          font-family: 'Instrument Serif', serif;
          font-size: 13px;
          color: var(--muted);
          font-style: italic;
        }
        .landing .statbar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid var(--border);
        }
        .landing .stat {
          padding: 48px 64px;
          border-right: 1px solid var(--border);
        }
        .landing .stat:last-child { border-right: none; }
        .landing .stat-num {
          font-family: 'Instrument Serif', serif;
          font-size: 56px;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .landing .stat-label { font-size: 13px; color: var(--muted); margin-top: 8px; }
        .landing .section { padding: 120px 64px; border-bottom: 1px solid var(--border); }
        .landing .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 80px;
        }
        .landing .section-num { font-size: 12px; color: var(--muted); padding-top: 6px; }
        .landing .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .landing .section-title em { font-style: italic; color: var(--muted); }
        .landing .features-list { display: flex; flex-direction: column; }
        .landing .feature-row {
          display: grid;
          grid-template-columns: 48px 1fr 1fr;
          gap: 40px;
          align-items: start;
          padding: 40px 0;
          border-top: 1px solid var(--border);
          transition: background 0.2s;
        }
        .landing .feature-row:hover {
          background: #f5f5f5;
          margin: 0 -64px;
          padding: 40px 64px;
        }
        .landing .feature-index { font-size: 12px; color: var(--muted); padding-top: 3px; }
        .landing .feature-name {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          font-weight: 400;
          letter-spacing: -0.01em;
        }
        .landing .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }
        .landing .how-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
        }
        .landing .how-step { background: var(--bg); padding: 56px 48px; }
        .landing .how-step-num {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 40px;
          letter-spacing: 0.1em;
        }
        .landing .how-step-title {
          font-family: 'Instrument Serif', serif;
          font-size: 26px;
          font-weight: 400;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
        }
        .landing .how-step-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }
        .landing .pricing-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          max-width: 780px;
        }
        .landing .pricing-card { background: var(--bg); padding: 56px 48px; }
        .landing .pricing-card.hi { background: var(--text); color: var(--bg); }
        .landing .pricing-card.hi .pricing-price { color: var(--bg); }
        .landing .pricing-card.hi .pricing-period,
        .landing .pricing-card.hi .pricing-feat,
        .landing .pricing-card.hi .pricing-plan { color: rgba(250, 250, 250, 0.5); }
        .landing .pricing-card.hi .pricing-feat { border-color: rgba(255, 255, 255, 0.1); }
        .landing .pricing-plan {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }
        .landing .coming-soon {
          font-size: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2px 7px;
          letter-spacing: 0.1em;
          vertical-align: middle;
        }
        .landing .pricing-price {
          font-family: 'Instrument Serif', serif;
          font-size: 72px;
          line-height: 1;
          letter-spacing: -0.03em;
          margin-bottom: 4px;
        }
        .landing .pricing-period { font-size: 13px; color: var(--muted); margin-bottom: 40px; }
        .landing .pricing-feats { margin-bottom: 48px; }
        .landing .pricing-feat {
          font-size: 14px;
          color: var(--muted);
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .landing .pricing-feat.off { opacity: 0.3; text-decoration: line-through; }
        .landing .btn-dark-outline {
          display: block;
          text-align: center;
          padding: 14px;
          font-size: 13px;
          letter-spacing: 0.06em;
          border: 1px solid var(--border);
          color: var(--muted);
          transition: all 0.2s;
          font-family: inherit;
          cursor: pointer;
        }
        .landing .btn-dark-outline:hover { border-color: var(--text); color: var(--text); }
        .landing .btn-disabled {
          display: block;
          text-align: center;
          padding: 14px;
          font-size: 13px;
          letter-spacing: 0.06em;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(250, 250, 250, 0.3);
          cursor: default;
        }
        .landing .cta {
          padding: 160px 64px;
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .landing .cta-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(44px, 6.5vw, 96px);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.05;
          max-width: 700px;
          margin-bottom: 48px;
        }
        .landing .cta-title em { font-style: italic; color: var(--muted); }
        .landing .cta-actions { display: flex; gap: 20px; align-items: center; }
        .landing footer {
          padding: 36px 64px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .landing .footer-logo { font-family: 'Instrument Serif', serif; font-size: 18px; }
        .landing .footer-copy { font-size: 12px; color: var(--muted); }
        .landing .footer-links { display: flex; gap: 28px; }
        .landing .footer-links a { font-size: 12px; color: var(--muted); transition: color 0.2s; }
        .landing .footer-links a:hover { color: var(--text); }
        .landing .reveal {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .landing .reveal.on { opacity: 1; transform: none; }
        @keyframes up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 768px) {
          .landing nav { padding: 20px 24px; }
          .landing .nav-links { display: none; }
          .landing .hero { padding: 100px 24px 60px; }
          .landing .hero-bottom { flex-direction: column; gap: 40px; align-items: flex-start; }
          .landing .statbar,
          .landing .how-steps,
          .landing .pricing-wrap { grid-template-columns: 1fr; }
          .landing .stat {
            padding: 36px 24px;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .landing .section { padding: 80px 24px; }
          .landing .section-header { flex-direction: column; gap: 16px; }
          .landing .feature-row { grid-template-columns: 32px 1fr; }
          .landing .feature-desc { display: none; }
          .landing .how-step,
          .landing .pricing-card { padding: 40px 24px; }
          .landing .cta { padding: 100px 24px; }
          .landing footer {
            flex-direction: column;
            gap: 16px;
            text-align: center;
            padding: 32px 24px;
          }
          .landing .footer-links { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
