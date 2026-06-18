# Logr

**Open-source, self-hostable Toggl alternative — with built-in invoicing.** Track time, bill clients, and get paid from one fast single-screen dashboard. Built with Next.js, React 19, and Supabase.

[![Live demo](https://img.shields.io/badge/live-demo-000?style=flat)](https://logr.work) ![Status](https://img.shields.io/badge/status-beta-orange) [![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE) ![Stars](https://img.shields.io/github/stars/zerox9dev/logr?style=flat)

**[▶ Try the live demo](https://logr.work)** &nbsp;·&nbsp; [Deploy your own](#getting-started) &nbsp;·&nbsp; [Self-host](#self-hosting-docker)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zerox9dev/logr)

![Logr dashboard](docs/dashboard.png)

> 💡 A short demo GIF (start timer → log work → create & share an invoice) converts far better than a static screenshot here — worth recording and dropping in.

## Features

- ⏱️ **Timer** — Start/stop tracking with one click. Manual entries supported, with pause/resume.
- 📁 **Projects & Clients** — Organize work by client; hourly or fixed-budget billing.
- 💸 **Billing** — Per-session and per-project rates, paid/unpaid status, billable vs total time.
- 🧾 **Invoicing** — Build an invoice from a client's unbilled sessions (optional tax & due date), track draft/sent/paid status, and share a public invoice link.
- 📊 **Dashboard widgets** — Daily summary, billable hours, tracking card, goals, projects & tasks, timeline.
- 📈 **Activity heatmap** — GitHub-style graph of your work history.
- 🔗 **Shareable links** — Self-contained report and invoice links (encoded in the URL); reports also export to CSV.
- 🔌 **MCP server** — manage Logr from any MCP-compatible AI assistant (Claude, etc.): list/create/update/delete clients, projects, time entries, and invoices, plus dashboard summaries — all over a remote MCP endpoint, scoped to your account.
- 🔐 **Auth** — Google OAuth **and** passwordless email magic links, via Supabase.
- 🌍 **i18n** — App UI in English, Ukrainian, and Russian (auto-detected).

## Why Logr?

Most time trackers stop at "track" and make you bolt on a separate invoicing tool. Logr closes the loop — **track → bill → get paid** — and you own the data.

| | Logr | Toggl | Harvest | Clockify |
|---|:---:|:---:|:---:|:---:|
| Open source | ✅ | ❌ | ❌ | ❌ |
| Self-hostable | ✅ | ❌ | ❌ | ❌ |
| Time tracking | ✅ | ✅ | ✅ | ✅ |
| Invoicing built-in | ✅ | ❌ (add-on) | ✅ | ➖ |
| Shareable report/invoice links | ✅ | ➖ | ✅ | ➖ |
| Single-screen, no page reloads | ✅ | ❌ | ❌ | ❌ |
| Free forever (self-host) | ✅ | ❌ | ❌ | ➖ |

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix primitives, CVA) + [lucide-react](https://lucide.dev) icons
- [Supabase](https://supabase.com) — Postgres, Auth, Row-Level Security — via `@supabase/ssr` (cookie-based SSR sessions)
- [Vitest](https://vitest.dev) + Testing Library — unit tests
- `mcp-handler` (MCP server adapter) — hosted MCP endpoint at `/mcp`
- `@vercel/analytics` + `@vercel/speed-insights` — Vercel Analytics & Speed Insights (mounted in root layout)
- Deployed on [Vercel](https://vercel.com)

## Getting Started

```bash
git clone https://github.com/zerox9dev/logr.git && cd logr && npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> `SUPABASE_SERVICE_ROLE_KEY` is server-only and never exposed to the browser.

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Self-hosting (Docker)

Run the full logr stack locally (or on your own server) with a single command. The compose file includes a minimal Supabase backend (Postgres, GoTrue auth, PostgREST, Kong API gateway) — no Supabase Cloud account needed.

> For the production-grade full stack (Storage, Realtime, Studio, Analytics) follow the [official Supabase self-host guide](https://supabase.com/docs/guides/self-hosting/docker).

### Prerequisites

- Docker + Docker Compose v2
- Node.js (only to run the one-shot key generator below)

### 1 — Clone and generate secrets

```bash
git clone https://github.com/zerox9dev/logr.git && cd logr
cp .env.example .env
node scripts/gen-env-keys.mjs >> .env   # appends a matched POSTGRES_PASSWORD + JWT_SECRET + ANON/SERVICE keys
```

The keys must be a matched set — `ANON_KEY` and `SERVICE_ROLE_KEY` are JWTs signed with `JWT_SECRET`. The script generates all of them together so they line up. (Appended values override the placeholders since the last definition wins.)

### 2 — Start the stack

```bash
docker compose up -d --build
```

First boot takes ~1–2 minutes as Docker pulls images and Postgres initialises. The logr schema (`supabase/migrations/0001_init.sql`) is applied automatically on first boot.

| Service | URL |
|---------|-----|
| logr app | http://localhost:3000 |
| Supabase API (Kong) | http://localhost:8000 |
| Postgres | localhost:5432 |

### Browser vs. internal origin

`NEXT_PUBLIC_SUPABASE_URL` is the URL your **browser** uses (e.g. `http://localhost:8000`) and is baked into the client bundle. Server-side code inside the app container can't use `localhost` (that's the container itself), so it talks to Supabase over the internal Docker network via `SUPABASE_INTERNAL_URL=http://kong:8000` — already wired in `docker-compose.yml`, no action needed.

On a remote server, set `NEXT_PUBLIC_SUPABASE_URL` to your server's IP or domain (port `8000`) in `.env` before building — it's a build-time value, so rebuild (`docker compose up -d --build`) after changing it.

### Auth providers

- **Email / magic links** — work out of the box with `MAILER_AUTOCONFIRM=true`. For real email delivery, configure SMTP in `.env` and set `MAILER_AUTOCONFIRM=false`.
- **Google OAuth** — create an OAuth 2.0 client at [console.cloud.google.com](https://console.cloud.google.com), then set `GOTRUE_EXTERNAL_GOOGLE_ENABLED=true`, `GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID`, and `GOTRUE_EXTERNAL_GOOGLE_SECRET` in `.env` (and add the env vars to the `auth` service in `docker-compose.yml`). Redirect URI: `http://<your-domain>:8000/auth/v1/callback`.

### Stop / clean up

```bash
docker compose down          # stop containers, keep db volume
docker compose down -v       # stop + remove the db volume (destroys data)
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next dev server |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |
| `npm run check` | `typecheck` → `lint` → `test` → `build` (run before pushing) |

## Project Structure

```
src/
├── app/                    # Next App Router
│   ├── layout.tsx / page.tsx / providers.tsx / globals.css
│   ├── login/              # Auth page
│   ├── app/                # Dashboard (auth-gated)
│   ├── share/              # Public shared report & invoice links
│   ├── auth/callback/      # OAuth / magic-link code exchange
│   ├── [transport]/        # MCP server endpoint (Streamable HTTP + SSE)
│   ├── oauth/consent/      # OAuth consent screen for MCP authorization
│   ├── alternatives/toggl/ # Public SEO landing — open-source Toggl alternative
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   └── .well-known/oauth-protected-resource/  # OAuth 2.1 auto-discovery
├── api/            # Supabase CRUD + auth helpers
├── components/     # ui/ (shadcn primitives), shared/, dashboard/ (+ widgets/), layout/, auth/
├── contexts/       # auth, data, dashboard providers
├── hooks/          # use-data, use-timer
├── domain/         # pure logic + tests: dashboard-metrics, report-share, invoicing, invoice-share
├── i18n/           # provider + en/uk/ru dictionaries
├── lib/            # supabase (browser) + supabase-server + supabase-mcp (server client +
│                   # token verification for MCP), format, date, base64, clipboard, utils
├── proxy.ts        # Next middleware: session refresh + /app auth gate
└── types/          # database types
```

**Routes:**

| Route | Description |
|-------|-------------|
| `/` | Public SSR marketing landing |
| `/login` | Auth — Google OAuth + email magic link |
| `/app` | Dashboard (auth-gated via middleware + server session check) |
| `/share/report`, `/share/invoice` | Public read-only shared links (data encoded in URL) |
| `/auth/callback` | OAuth / magic-link code exchange |
| `/mcp` (+ `/sse`) | Hosted MCP server endpoint (OAuth-protected) |
| `/oauth/consent` | OAuth consent screen for the MCP authorization flow |
| `/alternatives/toggl` | Public SEO comparison/landing page — open-source Toggl alternative |
| `/privacy`, `/terms` | Legal pages |

`/` and `/share/*` are server-rendered; `/app` is a client dashboard behind the auth gate.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migrations to create the tables (clients, projects, sessions, invoices, invoice_items, activities, user_settings) and enums.
3. **Enable auth providers** under *Authentication → Providers*:
   - **Email** — turn on email sign-ups to allow magic links (no SMTP setup needed for development; configure a custom SMTP for production).
   - **Google** — add your Google OAuth Client ID & Secret, and set the redirect URI in the Google Console to `https://<project>.supabase.co/auth/v1/callback`.
4. Under *Authentication → URL Configuration*, add the following to the **Redirect URLs** allow-list:
   - `http://localhost:3000/auth/callback` (local dev)
   - `https://<your-domain>/auth/callback` (production)

All tables use Row-Level Security with `user_id = auth.uid()`.

**MCP server:** to use the MCP endpoint, enable the Supabase **OAuth 2.1 Server** with **Dynamic Client Registration** under *Authentication → OAuth Server*, and set the Authorization Path to `/oauth/consent`.

## MCP (AI assistant access)

Logr exposes a hosted [Model Context Protocol](https://modelcontextprotocol.io) server at `https://logr.work/mcp` (Streamable HTTP; SSE variant at `/sse`).

**Auth:** standard MCP OAuth 2.1 via Supabase — modern clients auto-discover the flow and prompt you to log in; no token copy-pasting needed. All tools run scoped to your account via Row-Level Security.

**What you can do:** full CRUD over clients, projects, time entries (sessions), and invoices, plus `dashboard_summary` and `list_unbilled` insight tools — 18 tools total. See [docs/MCP.md](docs/MCP.md) for the complete list.

**Claude Desktop config example (OAuth auto-discovery):**

```json
{
  "mcpServers": {
    "logr": {
      "url": "https://logr.work/mcp"
    }
  }
}
```

See [docs/MCP.md](docs/MCP.md) for OAuth setup steps and manual bearer token instructions (useful for testing).

## Contributing

Issues, feature ideas, and PRs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). If Logr is useful to you, a ⭐ helps others find it.

## License

[AGPL-3.0](LICENSE)

---

Built by [@zerox9dev](https://zerox9dev.com)
