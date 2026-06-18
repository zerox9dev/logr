import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

/**
 * POST /oauth/consent
 *
 * Handles the user's consent decision (approve or deny) for an OAuth 2.1
 * authorization request initiated by a third-party MCP client.
 *
 * Called from the consent card at GET /oauth/consent via plain HTML form.
 * Supabase's approveAuthorization / denyAuthorization both return a redirect_url
 * pointing back to the OAuth client (with the auth code on approve, or
 * error=access_denied on deny).
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const authorization_id = formData.get("authorization_id");
  const action = formData.get("action");

  const origin = new URL(request.url).origin;

  if (
    typeof authorization_id !== "string" ||
    !authorization_id ||
    (action !== "approve" && action !== "deny")
  ) {
    return NextResponse.redirect(`${origin}/`, { status: 302 });
  }

  const supabase = await createServerSupabase();

  // Verify user is still logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = encodeURIComponent(`/oauth/consent?authorization_id=${authorization_id}`);
    return NextResponse.redirect(`${origin}/login?next=${next}`, { status: 302 });
  }

  // Call approve or deny — both POST to /auth/v1/oauth/authorizations/{id}/consent
  // with body { action: "approve" } or { action: "deny" }
  const result =
    action === "approve"
      ? await supabase.auth.oauth.approveAuthorization(authorization_id, {
          skipBrowserRedirect: true,
        })
      : await supabase.auth.oauth.denyAuthorization(authorization_id, {
          skipBrowserRedirect: true,
        });

  if (result.error || !result.data?.redirect_url) {
    // Graceful fallback: redirect home on unexpected errors
    return NextResponse.redirect(`${origin}/`, { status: 302 });
  }

  return NextResponse.redirect(result.data.redirect_url, { status: 302 });
}
