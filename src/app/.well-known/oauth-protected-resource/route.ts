import {
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

/**
 * RFC 9728 — OAuth 2.0 Protected Resource Metadata
 *
 * Advertises which Authorization Server MCP clients should use when they
 * receive a 401 from /mcp.  We point at Supabase Auth (acting as the AS).
 *
 * Supabase AS endpoints derived from NEXT_PUBLIC_SUPABASE_URL:
 *   issuer:   https://<ref>.supabase.co/auth/v1
 *   metadata: https://<ref>.supabase.co/.well-known/oauth-authorization-server/auth/v1
 *
 * resourceUrl is set explicitly so it works correctly behind Vercel's proxy.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// issuer must match the "issuer" field in the AS's own metadata document
const supabaseIssuer = `${supabaseUrl}/auth/v1`;

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://logr.work";

const GET = protectedResourceHandler({
  authServerUrls: [supabaseIssuer],
  resourceUrl: `${appUrl}/mcp`,
});

const OPTIONS = metadataCorsOptionsRequestHandler();

export { GET, OPTIONS };
