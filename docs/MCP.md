# logr MCP Server

logr exposes a hosted Model Context Protocol (MCP) server at:

```
https://logr.work/mcp
```

AI clients (Claude Desktop, Cursor, etc.) can connect to this endpoint to read and write your time-tracking and invoicing data. All queries are scoped to your user via Row-Level Security — other users' data is never accessible.

## Authentication

The server uses **Bearer token authentication**. Pass your Supabase access token as the `Authorization` header:

```
Authorization: Bearer <your-supabase-access-token>
```

### Getting your token

Your access token is available from the Supabase session inside the logr app. In the browser console (while logged in at `logr.work`):

```js
const { data } = await window.__supabase.auth.getSession()
console.log(data.session.access_token)
```

Or use the Supabase JS client in your own code:

```ts
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

Tokens expire — refresh as needed via `supabase.auth.getSession()` (auto-refreshes) or `supabase.auth.refreshSession()`.

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
        "url": "https://logr.work/mcp",
        "headers": {
          "Authorization": "Bearer <your-supabase-access-token>"
        }
      }
    }
  }
}
```

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
