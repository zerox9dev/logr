# Logr

Time tracking & invoicing for freelancers — a single-screen dashboard built with Vite, React 19, and Supabase.

![Logr](https://img.shields.io/badge/status-beta-orange) ![License](https://img.shields.io/badge/license-AGPL--3.0-blue)

## Features

- ⏱️ **Timer** — Start/stop tracking with one click. Manual entries supported, with pause/resume.
- 📁 **Projects & Clients** — Organize work by client; hourly or fixed-budget billing.
- 💸 **Billing** — Per-session and per-project rates, paid/unpaid status, billable vs total time.
- 📊 **Dashboard widgets** — Daily summary, billable hours, tracking card, goals, projects & tasks, timeline.
- 📈 **Activity heatmap** — GitHub-style graph of your work history.
- 🔗 **Shareable reports** — Generate a self-contained report link (encoded in the URL) and export to CSV.
- 🔐 **Auth** — Google OAuth **and** passwordless email magic links, via Supabase.
- 🌍 **i18n** — App UI in English, Ukrainian, and Russian (auto-detected).

## Stack

- [Vite 7](https://vite.dev) + [React 19](https://react.dev) + TypeScript 5.9
- [Tailwind CSS 4](https://tailwindcss.com) — utility-first styling (no CSS Modules)
- [Radix UI](https://www.radix-ui.com) primitives + [lucide-react](https://lucide.dev) icons
- [Supabase](https://supabase.com) — Auth, Postgres, Row-Level Security
- [React Router 7](https://reactrouter.com) — minimal routing (`/` dashboard + `/share/report`)
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
| `npm run format` | Format the codebase with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run check` | `typecheck` → `lint` → `test` → `build` (run before pushing) |

## Project Structure

```
src/
├── components/
│   ├── auth/          # login-gate (Google OAuth + magic link)
│   ├── dashboard/     # single-screen dashboard, context, dialogs
│   │   └── widgets/   # daily-summary, billable-hours, tracking-card,
│   │                  # goals, projects-tasks, timeline, activity-heatmap
│   ├── layout/        # top-bar, context-header
│   ├── reports/       # shared-report-page (public report link)
│   └── ui/            # button, input, card, dialog, badge, toast, confirm…
├── lib/
│   ├── api.ts             # Supabase CRUD for all tables + auth helpers
│   ├── supabase.ts        # typed Supabase client
│   ├── auth-context.tsx   # auth provider + useAuth
│   ├── data-context.tsx   # app data provider + useAppData
│   ├── use-data.ts        # loads & manages all entities
│   ├── dashboard-metrics.ts  # pure metric calculations (tested)
│   ├── report-share.ts       # report summary, encode/decode, CSV (tested)
│   ├── i18n.ts / i18n-app.ts # translations (en / uk / ru)
│   └── utils.ts
└── types/
    └── database.ts    # types generated from the Supabase schema
```

The app renders a single route `/`: an auth gate, then one dashboard screen.
`/share/report` is a public, read-only report page that decodes its data from the URL.

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
