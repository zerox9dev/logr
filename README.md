# Logr

Time tracking & invoicing for freelancers — a single-screen dashboard built with Vite, React 19, and Supabase.

![Logr](https://img.shields.io/badge/status-beta-orange) ![License](https://img.shields.io/badge/license-AGPL--3.0-blue)

![Logr dashboard](docs/dashboard.png)

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
git clone https://github.com/zerox9dev/logr-new.git
cd logr-new
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

## License

[AGPL-3.0](LICENSE)

---

Built by [@zerox9dev](https://zerox9dev.com)
