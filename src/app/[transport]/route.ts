import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { getUserClient, verifyAccessToken } from "@/lib/supabase-mcp";
import { agentTools } from "@/api/agent-tools";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Auth verification — validates Supabase OAuth token via JWKS (ES256)
// ---------------------------------------------------------------------------
async function verifyToken(
  _req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;
  const result = await verifyAccessToken(bearerToken);
  if (!result) return undefined;
  return {
    token: bearerToken,
    clientId: result.userId,
    scopes: [],
    extra: { userId: result.userId, accessToken: bearerToken },
  };
}

// ---------------------------------------------------------------------------
// MCP handler — registers the shared tool registry (src/api/agent-tools.ts),
// which the in-app chat at /api/chat consumes from the same source.
// ---------------------------------------------------------------------------
function initServer(server: McpServer) {
  for (const tool of agentTools) {
    server.tool(
      tool.name,
      tool.description,
      tool.schema,
      async (args: Record<string, unknown>, extra) => {
        const authInfo = extra.authInfo as AuthInfo;
        const supabase = getUserClient(authInfo);
        const userId = authInfo.extra?.userId as string;
        const text = await tool.handler(args, { supabase, userId });
        return { content: [{ type: "text" as const, text }] };
      }
    );
  }
}

const mcpHandler = createMcpHandler(
  initServer,
  { serverInfo: { name: "logr-mcp", version: "1.0.0" } },
  { basePath: "/", sessionIdGenerator: undefined }
);

/**
 * Wrap with Bearer token auth.
 *
 * - required: true        → unauthenticated requests get a 401
 * - resourceMetadataPath  → the WWW-Authenticate challenge on 401 includes
 *     resource_metadata="<origin>/.well-known/oauth-protected-resource"
 *     so MCP clients supporting RFC 9728 can auto-discover the AS.
 *     mcp-handler derives the origin from the incoming request's host, which
 *     is correct on Vercel (the host header is logr.work in production).
 */
const handler = withMcpAuth(mcpHandler, verifyToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { handler as GET, handler as POST };
