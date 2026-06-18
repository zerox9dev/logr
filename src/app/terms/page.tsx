import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Logr",
  description: "Terms governing your use of Logr.",
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

export default function TermsPage() {
  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-5 sm:px-8 py-16 flex justify-center">
        <div className="bg-card border border-line w-full max-w-[720px] p-8 sm:p-12 flex flex-col gap-10">
          {/* Title block */}
          <div className="flex flex-col gap-2 border-b border-line pb-8">
            <h1 className="text-4xl font-bold text-heading">Terms of Service</h1>
            <p className="text-md text-tertiary">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="flex flex-col gap-8 text-base text-ink leading-relaxed">

            {/* 1 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">1. Software license</h2>
              <p>
                Logr is free, open-source software released under the{" "}
                <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong>. The source
                code is available at{" "}
                <a
                  href="https://github.com/zerox9dev/logr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-money underline underline-offset-2"
                >
                  github.com/zerox9dev/logr
                </a>
                . You may use, modify, and distribute the software under the terms of that
                license.
              </p>
            </section>

            {/* 2 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">2. The hosted service</h2>
              <p>
                logr.work is a hosted convenience layer built on top of the open-source codebase.
                It is provided free of charge on a best-effort basis. We reserve the right to
                modify, suspend, or discontinue the hosted service at any time, with or without
                notice. Users who require a guaranteed SLA are encouraged to self-host.
              </p>
            </section>

            {/* 3 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">3. Acceptable use</h2>
              <p>
                You agree to use Logr only for lawful purposes and in a way that does not
                infringe the rights of others. You must not attempt to circumvent authentication,
                access another user&apos;s data, abuse shared infrastructure, or use the service
                for any illegal activity.
              </p>
            </section>

            {/* 4 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">4. Account responsibility</h2>
              <p>
                You are responsible for all activity that occurs under your account. Keep your
                credentials secure. If you believe your account has been compromised, contact us
                immediately via GitHub. We reserve the right to suspend or terminate accounts
                that violate these terms.
              </p>
            </section>

            {/* 5 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">5. No warranty</h2>
              <p>
                The software and the hosted service are provided <strong>&quot;as is&quot;</strong>,
                without warranty of any kind — express or implied — including but not limited to
                merchantability, fitness for a particular purpose, or non-infringement. We do not
                guarantee uptime, data durability, or suitability for billing or legal purposes.
                Always keep your own backups.
              </p>
            </section>

            {/* 6 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-heading">6. Changes to these terms</h2>
              <p>
                We may update these terms at any time. Continued use of the hosted service after
                a change constitutes acceptance of the new terms. Material changes will be
                announced via a GitHub release note. Self-hosters are not affected by changes to
                these hosted-service terms.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
