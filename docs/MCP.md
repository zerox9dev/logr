# logr MCP Server

logr exposes a hosted Model Context Protocol (MCP) server at:

```
https://logr.work/mcp
```

AI clients (Claude Desktop, Cursor, etc.) can connect to this endpoint to read and write your time-tracking and invoicing data. All queries are scoped to your user via Row-Level Security — other users' data is never accessible.

## Authentication

The server implements **standard MCP OAuth 2.1** (RFC 9728 / RFC 8414) with Supabase as the Authorization Server. Modern MCP clients (Claude Desktop ≥ 0.10, Cursor, etc.) auto-discover the OAuth flow — no manual token setup needed.

### How the OAuth flow works

1. Your MCP client hits `https://logr.work/mcp` without a token.
2. The server returns `401 Unauthorized` with a `WWW-Authenticate` header that points to the resource metadata at `/.well-known/oauth-protected-resource`.
3. The client fetches that document, which advertises Supabase (`https://<ref>.supabase.co/auth/v1`) as the Authorization Server.
4. The client fetches the AS metadata from Supabase (`/.well-known/oauth-authorization-server/auth/v1`), discovers the authorization and token endpoints, and starts the OAuth 2.1 PKCE flow.
5. You log in via Supabase (email/password, magic link, or social provider) in the browser popup.
6. The client receives an access token and sends it as `Authorization: Bearer <token>` on every subsequent MCP request.

Tokens are short-lived Supabase JWTs. The client is responsible for refreshing them before expiry.

### Required Supabase dashboard setup

Before the OAuth flow will work end-to-end, configure the following in the [Supabase dashboard](https://supabase.com/dashboard) for your project:

1. **Enable the OAuth 2.1 Server**
   - Navigate to **Authentication → OAuth Server**
   - Toggle **Enable OAuth 2.1 Server** on

2. **Enable Dynamic Client Registration**
   - On the same screen, enable **Dynamic Client Registration (RFC 7591)**
   - This allows MCP clients to register themselves automatically without pre-configuring each one

3. **Add allowed redirect URIs**
   - Still in **Authentication → OAuth Server → Redirect URIs**, add the callback URLs for your MCP clients, for example:
     - `https://logr.work/` (logr's own callback, if needed)
     - Any client-specific callback the MCP client documentation specifies

4. **Add `logr.work` to allowed Origins** (if not already present)
   - Navigate to **Authentication → URL Configuration**
   - Add `https://logr.work` to **Allowed Origins**

> **RFC 8707 audience-binding note:** Supabase JWTs carry the project ref as the audience (`aud`). If your MCP client performs audience validation, the expected value is your Supabase project ref (e.g. `abcdefghij`), not `https://logr.work/mcp`. This is a Supabase platform limitation — the server does not enforce audience-binding beyond what Supabase's own token validation provides.

### Manual bearer token (for testing / legacy clients)

If your client does not support OAuth auto-discovery, you can still connect by pasting a token manually. Get your current Supabase access token from the browser console while logged in at `logr.work`:

```js
const { data } = await window.__supabase.auth.getSession()
console.log(data.session.access_token)
```

Or via the Supabase JS SDK:

```ts
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

Then configure your client to send:

```
Authorization: Bearer <your-supabase-access-token>
```

Tokens expire (typically 1 hour) — refresh via `supabase.auth.getSession()` (auto-refreshes) or `supabase.auth.refreshSession()`.

## Available Tools

### Clients

| Tool | Description | Params |
|------|-------------|--------|
| `list_clients` | List all clients (name, company, id) | — |
| `create_client` | Create a new client | `name` (req), `email?`, `phone?`, `company?`, `notes?`, `tags?: string[]` |
| `update_client` | Update a client by id | `id` (req), then any of: `name?`, `email?`, `phone?`, `company?`, `notes?`, `tags?` |
| `delete_client` | Delete a client by id | `id` |

### Projects

| Tool | Description | Params |
|------|-------------|--------|
| `list_projects` | List all projects with client name, billing type, and rate | — |
| `create_project` | Create a new project linked to a client | `name`, `clientId`, `billingType?: "hourly"\|"fixed"` (default `"hourly"`), `rate?`, `status?` (default `"active"`) |
| `update_project` | Update a project by id | `id` (req), then any of: `name?`, `billingType?`, `rate?`, `fixedBudget?`, `status?` |
| `delete_project` | Delete a project by id | `id` |

### Time Entries

| Tool | Description | Params |
|------|-------------|--------|
| `recent_sessions` | List recent time entries (default 20, max 100) | `limit?: number` |
| `log_time` | Log a new time entry | `name`, `durationMinutes`, `projectId?`, `clientId?`, `startedAt?` (ISO) |
| `update_session` | Update an existing time entry by id | `id` (req), then any of: `name?`, `startedAt?` (ISO), `durationMinutes?`, `paymentStatus?: "paid"\|"unpaid"`, `projectId?`, `rate?` |
| `delete_session` | Delete a time entry by id | `id` |

### Invoices

| Tool | Description | Params |
|------|-------------|--------|
| `list_invoices` | List invoices with client name and totals, optionally filtered by status | `status?: "draft"\|"sent"\|"paid"\|"overdue"` |
| `create_invoice` | Create a draft invoice from a client's unbilled sessions | `clientId`, `sessionIds?: string[]`, `taxRate?: number` |
| `update_invoice` | Update invoice status, due date, or notes (setting `sent` records `sent_at`; `paid` records `paid_at`) | `id` (req), then any of: `status?: "draft"\|"sent"\|"paid"`, `dueDate?: string\|null`, `notes?` |
| `delete_invoice` | Delete an invoice and all its line items | `id` |

### Insights

| Tool | Description | Params |
|------|-------------|--------|
| `dashboard_summary` | Dashboard metrics for a period | `period?: "Day"\|"Week"\|"Month"\|"All"` (default `"Week"`) |
| `list_unbilled` | Unbilled sessions for a specific client | `clientId` |

## Client Configuration

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

For clients that support OAuth auto-discovery — just provide the URL, no token needed:

```json
{
  "mcpServers": {
    "logr": {
      "url": "https://logr.work/mcp"
    }
  }
}
```

The client will handle the OAuth flow automatically on first connect.

For legacy clients or manual-token testing:

```json
{
  "mcpServers": {
    "logr": {
      "url": "https://logr.work/mcp",
      "headers": {
        "Authorization": "Bearer <your-supabase-access-token>"
      }
    }
  }
}
```

### Cursor / other MCP clients

```json
{
  "mcp": {
    "servers": {
      "logr": {
        "url": "https://logr.work/mcp"
      }
    }
  }
}
```

## OAuth Metadata Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /.well-known/oauth-protected-resource` | RFC 9728 resource metadata — lists the Authorization Server URL |

The Authorization Server metadata (endpoints, grant types, etc.) is served directly by Supabase at:
`https://<ref>.supabase.co/.well-known/oauth-authorization-server/auth/v1`

## Transport

The endpoint supports **Streamable HTTP** (MCP spec 2025-03-26). SSE is available at `/sse` for legacy clients.

## Example prompts (once connected)

- "Show me my dashboard for this week"
- "Log 2 hours for 'Client call' on project X"
- "List all unbilled sessions for Acme Corp and create an invoice"
- "What are my top projects this month?"
- "Create a new client 'Acme Corp' with email contact@acme.com"
- "Update project X to paused status"
- "Mark invoice INV-0042 as sent"
- "Delete session abc-123"
