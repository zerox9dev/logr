import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — Logr",
  description: "Terms governing your use of Logr.",
};

const LAST_UPDATED = "18 June 2026";

export default function TermsPage() {
  return (
    <LegalPage current="terms" title="Terms of Service" lastUpdated={LAST_UPDATED}>
      {/* 1 */}
      <section>
        <h2>1. Software license</h2>
        <p>
          Logr is free, open-source software released under the{" "}
          <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong>. The source
          code is available at{" "}
          <a
            href="https://github.com/zerox9dev/logr"
            target="_blank"
            rel="noopener noreferrer"
           
          >
            github.com/zerox9dev/logr
          </a>
          . You may use, modify, and distribute the software under the terms of that
          license.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2>2. The hosted service</h2>
        <p>
          logr.work is a hosted convenience layer built on top of the open-source codebase.
          It is provided free of charge on a best-effort basis. We reserve the right to
          modify, suspend, or discontinue the hosted service at any time, with or without
          notice. Users who require a guaranteed SLA are encouraged to self-host.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2>3. Acceptable use</h2>
        <p>
          You agree to use Logr only for lawful purposes and in a way that does not
          infringe the rights of others. You must not attempt to circumvent authentication,
          access another user&apos;s data, abuse shared infrastructure, or use the service
          for any illegal activity.
        </p>
      </section>

      {/* 4 */}
      <section>
        <h2>4. Account responsibility</h2>
        <p>
          You are responsible for all activity that occurs under your account. Keep your
          credentials secure. If you believe your account has been compromised, contact us
          immediately via GitHub. We reserve the right to suspend or terminate accounts
          that violate these terms.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2>5. No warranty</h2>
        <p>
          The software and the hosted service are provided <strong>&quot;as is&quot;</strong>,
          without warranty of any kind — express or implied — including but not limited to
          merchantability, fitness for a particular purpose, or non-infringement. We do not
          guarantee uptime, data durability, or suitability for billing or legal purposes.
          Always keep your own backups.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2>6. Changes to these terms</h2>
        <p>
          We may update these terms at any time. Continued use of the hosted service after
          a change constitutes acceptance of the new terms. Material changes will be
          announced via a GitHub release note. Self-hosters are not affected by changes to
          these hosted-service terms.
        </p>
      </section>
    </LegalPage>
  );
}
