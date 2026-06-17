# Logr

**Open-source, self-hostable Toggl alternative — with built-in invoicing.** Track time, bill clients, and get paid from one fast single-screen dashboard. Built with Vite, React 19, and Supabase.

[![Live demo](https://img.shields.io/badge/live-demo-000?style=flat)](https://logr.work) ![Status](https://img.shields.io/badge/status-beta-orange) [![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE) ![Stars](https://img.shields.io/github/stars/zerox9dev/logr?style=flat)

**[▶ Try the live demo](https://logr.work)** &nbsp;·&nbsp; [Deploy your own](#getting-started) &nbsp;·&nbsp; [Self-host](#supabase-setup)

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

- [Vite 7](https://vite.dev) + [React 19](https://react.dev) + TypeScript 5.9
- [Tailwind CSS 4](https://tailwindcss.com) — utility-first styling (no CSS Modules)
- [Radix UI](https://www.radix-ui.com) primitives + [lucide-react](https://lucide.dev) icons
- [Supabase](https://supabase.com) — Auth, Postgres, Row-Level Security
- [React Router 7](https://reactrouter.com) — minimal routing (`/` dashboard + `/share/report` + `/share/invoice`)
- [Vitest](https://vitest.dev) + Testing Library — unit tests
- Deployed on [Vercel](https://vercel.com)

## Getting Started

```bash
git clone https://github.com/zerox9dev/logr.git
cd logr
npm install
```

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and produce a production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the test suite (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check without emitting |
| `npm run check` | `typecheck` → `lint` → `test` → `build` (run before pushing) |

## Project Structure

```
src/
├── api/            # Supabase CRUD for all tables + auth helpers
├── components/
│   ├── auth/       # login-gate (Google OAuth + magic link)
│   ├── dashboard/  # single-screen dashboard + dialogs (sessions, import,
│   │   │           # new-menu, create-invoice, invoices, rates, manual-entry)
│   │   └── widgets/# daily-summary, billable-hours, tracking-card, goals,
│   │               # projects-tasks, timeline, activity-heatmap
│   ├── layout/     # top-bar, context-header, command-palette
│   ├── reports/    # shared-report-page, shared-invoice-page (public links)
│   ├── shared/     # cross-feature: sessions-dialog, client/project pickers
│   └── ui/         # button, input, card, dialog, badge, toast, confirm…
├── contexts/       # auth, data, and dashboard providers
├── hooks/          # use-data (loads & manages all entities), use-timer
├── domain/         # pure logic + tests: dashboard-metrics, report-share,
│                   # invoicing, invoice-share
├── i18n/           # provider + en/uk/ru dictionaries (app, dashboard)
├── lib/            # infra & utils: supabase, format, date, base64, clipboard, utils
└── types/
    └── database.ts # types mirroring the Supabase schema
```

The app renders a single route `/`: an auth gate, then one dashboard screen.
`/share/report` and `/share/invoice` are public, read-only pages that decode their data from the URL.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migrations to create the tables (clients, projects, sessions, invoices, invoice_items, activities, user_settings) and enums.
3. **Enable auth providers** under *Authentication → Providers*:
   - **Email** — turn on email sign-ups to allow magic links (no SMTP setup needed for development; configure a custom SMTP for production).
   - **Google** — add your Google OAuth Client ID & Secret, and set the redirect URI in the Google Console to `https://<project>.supabase.co/auth/v1/callback`.
4. Under *Authentication → URL Configuration*, add your site URL and the local dev URL (`http://localhost:5173`) to the **Redirect URLs** allow-list — magic links and OAuth both redirect back to `/`.

All tables use Row-Level Security with `user_id = auth.uid()`.

## Contributing

Issues, feature ideas, and PRs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). If Logr is useful to you, a ⭐ helps others find it.

## License

[AGPL-3.0](LICENSE)

---

Built by [@zerox9dev](https://zerox9dev.com)
