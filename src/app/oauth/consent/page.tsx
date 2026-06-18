import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";

export const metadata: Metadata = { robots: { index: false } };

interface PageProps {
  searchParams: Promise<{ authorization_id?: string }>;
}

export default async function OAuthConsentPage({ searchParams }: PageProps) {
  const { authorization_id } = await searchParams;

  // ── 1. Validate the authorization_id query param ────────────────────────
  if (!authorization_id) {
    redirect("/");
  }

  // ── 2. Ensure the user is logged in ─────────────────────────────────────
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = encodeURIComponent(`/oauth/consent?authorization_id=${authorization_id}`);
    redirect(`/login?next=${next}`);
  }

  // ── 3. Fetch pending authorization details ───────────────────────────────
  // supabase.auth.oauth.getAuthorizationDetails uses the user's session token
  // and calls GET /auth/v1/oauth/authorizations/{id}
  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorization_id);

  if (error || !data) {
    // Invalid / expired authorization_id
    redirect("/");
  }

  // If user already consented previously, Supabase returns {redirect_url} directly
  if ("redirect_url" in data) {
    redirect(data.redirect_url);
  }

  // ── 4. Render consent card ───────────────────────────────────────────────
  const { client, scope } = data;
  const scopes = scope
    .split(" ")
    .filter(Boolean)
    .map((s) => s.trim());

  const scopeLabels: Record<string, string> = {
    openid: "Verify your identity",
    profile: "Read your profile (name, avatar)",
    email: "Read your email address",
    "time:read": "Read your time entries",
    "time:write": "Create and edit time entries",
    "invoices:read": "Read your invoices",
    "invoices:write": "Create and edit invoices",
    "clients:read": "Read your clients and projects",
    "clients:write": "Create and edit clients and projects",
    offline_access: "Stay connected (refresh tokens)",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative size-12 bg-black">
            <span className="absolute left-[19px] top-[14px] h-5 w-[3px] bg-card" />
            <span className="absolute left-[26px] top-[14px] h-5 w-[3px] bg-card" />
          </div>
          <h1 className="text-lg font-semibold tracking-[-0.16px] text-ink">logr.work</h1>
        </div>

        {/* Consent card */}
        <div className="border border-line bg-card p-6 flex flex-col gap-5">
          {/* Client identity */}
          <div className="flex flex-col gap-1.5">
            <p className="text-md text-tertiary text-center">
              <span className="font-semibold text-ink">{client.name}</span> wants access to your
              Logr account
            </p>
            <p className="text-sm text-tertiary text-center">{user.email}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-line" />

          {/* Scopes */}
          {scopes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-ink">This will allow {client.name} to:</p>
              <ul className="flex flex-col gap-1.5">
                {scopes.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-secondary">
                    <span className="mt-[3px] size-[6px] shrink-0 rounded-full bg-ink" />
                    {scopeLabels[s] ?? s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-line" />

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5">
            {/* Authorize — POST action */}
            <form action="/oauth/consent/action" method="POST">
              <input type="hidden" name="authorization_id" value={authorization_id} />
              <input type="hidden" name="action" value="approve" />
              <button
                type="submit"
                className="w-full bg-ink text-white px-4 py-3 text-md font-medium hover:opacity-90 transition-opacity"
              >
                Authorize
              </button>
            </form>

            {/* Deny — POST action */}
            <form action="/oauth/consent/action" method="POST">
              <input type="hidden" name="authorization_id" value={authorization_id} />
              <input type="hidden" name="action" value="deny" />
              <button
                type="submit"
                className="w-full border border-line bg-card text-ink px-4 py-3 text-md font-medium hover:bg-wash transition-colors"
              >
                Deny
              </button>
            </form>
          </div>

          <p className="text-sm text-tertiary text-center">
            You can revoke access at any time from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
