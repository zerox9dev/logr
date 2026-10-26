import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Logr",
  description: "How Logr handles your data.",
};

const LAST_UPDATED = "18 June 2026";

export default function PrivacyPage() {
  return (
    <LegalPage current="privacy" title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      {/* 1 */}
      <section>
        <h2>1. Overview</h2>
        <p>
          Logr is an open-source, self-hostable time-tracking and invoicing application
          licensed under <strong>AGPL-3.0</strong>. This policy applies to the hosted
          instance at <strong>logr.work</strong>. If you self-host Logr, your data never
          touches our servers — you are solely responsible for your own deployment.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2>2. Data we store</h2>
        <p>
          On the hosted instance, your data — time entries, clients, projects, and invoices —
          is stored in a PocketBase database under your account. Every collection is
          protected by <strong>API Rules</strong> so that only your authenticated user can
          read or write your records. We do not have access to the contents of your time
          entries or invoices in the normal course of operations.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2>3. Authentication</h2>
        <p>
          Logr authenticates you with your <strong>email and password</strong>, handled by
          PocketBase. We store your email address and a salted password hash — never the
          password itself. Your session is kept in an HTTP-only cookie that the browser
          cannot read.
        </p>
      </section>

      {/* 4 */}
      <section>
        <h2>4. Data sharing &amp; selling</h2>
        <p>
          We do not sell, rent, or share your personal data with third parties for
          advertising or marketing purposes. Data may be disclosed only where required by
          law or to protect the rights and safety of users.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2>5. Self-hosting</h2>
        <p>
          The Logr source code is publicly available on GitHub under AGPL-3.0. When you
          self-host Logr, you control the database, the infrastructure, and the data.
          This policy does not apply to self-hosted deployments — you are the data
          controller for your own instance.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2>6. Contact</h2>
        <p>
          Logr is an open-source project. For privacy-related questions, please open an
          issue or start a discussion on{" "}
          <a
            href="https://github.com/zerox9dev/logr"
            target="_blank"
            rel="noopener noreferrer"
           
          >
            GitHub
          </a>
          . We will respond within a reasonable timeframe.
        </p>
      </section>
    </LegalPage>
  );
}
