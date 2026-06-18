import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Logr",
  description: "How Logr handles your data.",
};

const LAST_UPDATED = "18 June 2026";

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-line flex items-center justify-between px-5 sm:px-8 lg:px-16 h-14">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex items-end gap-[2px]">
          <span className="w-[3px] bg-ink h-[7px]" />
          <span className="w-[3px] bg-ink h-[11px]" />
          <span className="w-[3px] bg-ink h-[8px]" />
          <span className="w-[3px] bg-ink h-[15px]" />
        </div>
        <span className="text-[16px] font-bold tracking-[-0.3px] text-ink">logr.work</span>
      </Link>
      <Link href="/login" className="bg-ink text-white px-4 py-2 text-md font-medium">
        Get started
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-card border-t border-line-2 px-5 sm:px-8 lg:px-16 py-5 flex flex-col sm:flex-row gap-3 items-center justify-between text-md-minus text-tertiary">
      <span>© 2026 logr.work. All rights reserved.</span>
      <div className="flex gap-6">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-5 sm:px-8 py-16 flex justify-center">
        <div className="bg-card border border-line w-full max-w-[720px] p-8 sm:p-12 flex flex-col gap-10">
          {/* Title block */}
          <div className="flex flex-col gap-2 border-b border-line pb-8">
            <h1 className="text-4xl font-bold text-heading">Privacy Policy</h1>
            <p className="text-md text-tertiary">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="flex flex-col gap-8 text-base text-ink leading-relaxed">

            {/* 1 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">1. Overview</h2>
              <p>
                Logr is an open-source, self-hostable time-tracking and invoicing application
                licensed under <strong>AGPL-3.0</strong>. This policy applies to the hosted
                instance at <strong>logr.work</strong>. If you self-host Logr, your data never
                touches our servers — you are solely responsible for your own deployment.
              </p>
            </section>

            {/* 2 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">2. Data we store</h2>
              <p>
                On the hosted instance, your data — time entries, clients, projects, and invoices —
                is stored in a Supabase Postgres database under your account. Every table is
                protected by <strong>Row-Level Security (RLS)</strong> policies so that only your
                authenticated user can read or write your records. We do not have access to the
                contents of your time entries or invoices in the normal course of operations.
              </p>
            </section>

            {/* 3 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">3. Authentication</h2>
              <p>
                Logr supports authentication via <strong>Google OAuth</strong> and
                <strong> email magic links</strong>, both handled by Supabase Auth. We store your
                email address and a hashed session token. We do not store passwords. OAuth tokens
                from Google are used only to confirm your identity and are not persisted beyond
                the session.
              </p>
            </section>

            {/* 4 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">4. Data sharing &amp; selling</h2>
              <p>
                We do not sell, rent, or share your personal data with third parties for
                advertising or marketing purposes. Data may be disclosed only where required by
                law or to protect the rights and safety of users.
              </p>
            </section>

            {/* 5 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">5. Self-hosting</h2>
              <p>
                The Logr source code is publicly available on GitHub under AGPL-3.0. When you
                self-host Logr, you control the database, the infrastructure, and the data.
                This policy does not apply to self-hosted deployments — you are the data
                controller for your own instance.
              </p>
            </section>

            {/* 6 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">6. Contact</h2>
              <p>
                Logr is an open-source project. For privacy-related questions, please open an
                issue or start a discussion on{" "}
                <a
                  href="https://github.com/zerox9dev/logr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-money underline underline-offset-2"
                >
                  GitHub
                </a>
                . We will respond within a reasonable timeframe.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
