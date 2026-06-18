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

| Tool | Description |
|------|-------------|
| `list_clients` | List all your clients (name, company, id) |
| `list_projects` | List all projects with client, billing type, and rate |
| `recent_sessions` | Recent time entries (default 20, max 100) |
| `log_time` | Log a new time entry |
| `dashboard_summary` | Dashboard metrics for Day / Week / Month / All |
| `list_unbilled` | Unbilled sessions for a specific client |
| `create_invoice` | Create a draft invoice from unbilled sessions |

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
