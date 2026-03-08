# Logr

Time tracking & invoicing for freelancers. Built with Vite, React, and Supabase.

![Logr](https://img.shields.io/badge/status-beta-orange) ![License](https://img.shields.io/badge/license-AGPL--3.0-blue)

## Features

- ⏱️ **Timer** — Start/stop with one click or keyboard shortcut. Manual entries supported.
- 📁 **Projects** — Organize work by client. Hourly or fixed billing.
- 👥 **Clients** — Contact details, notes, project history.
- 🧾 **Invoices** — Create, preview, send. Track draft → sent → paid → overdue.
- 🎯 **Funnels** — Custom kanban pipelines for sales, job hunting, onboarding.
- 📊 **Reports** — Time by project, client, week, month. Billable vs total.
- 📈 **Activity Graph** — GitHub-style heatmap of your work history.
- 🔐 **Auth** — Google sign-in via Supabase.

## Stack

- [Vite 7](https://vite.dev) + [React 19](https://react.dev) + TypeScript 5.9
- **CSS Modules** — scoped component styles, CSS variables for theming
- [Supabase](https://supabase.com) — Auth, Database, RLS
- [React Router 7](https://reactrouter.com)

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

Run:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run check` | Typecheck → Lint → Test → Build |

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login page (Google OAuth)
│   ├── dashboard/     # Dashboard with stats & activity graph
│   ├── timer/         # Timer & time entries
│   ├── projects/      # Project management
│   ├── clients/       # Client management
│   ├── invoices/      # Invoice creation & list
│   ├── funnels/       # Kanban pipelines
│   ├── reports/       # Time & earnings reports
│   ├── settings/      # User profile & billing defaults
│   ├── landing/       # Public landing page
│   ├── layout/        # App layout, sidebar
│   └── ui/            # Shared UI components (CSS Modules)
├── lib/
│   ├── api.ts         # Supabase CRUD for all tables
│   ├── supabase.ts    # Supabase client
│   ├── auth-context.tsx
│   ├── data-context.tsx
│   └── use-data.ts    # Data hook (loads & manages all entities)
└── types/
    └── database.ts    # 1:1 types with Supabase schema
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migrations to create tables (11 tables, 6 enums)
3. Enable Google Auth: Authentication → Providers → Google
4. Add your Google OAuth Client ID & Secret
5. Set redirect URI in Google Console: `https://xxx.supabase.co/auth/v1/callback`

All tables use RLS with `user_id = auth.uid()`.

## Pricing Model

- **Free** — Timer, projects, clients, basic reports. Forever.
- **Pro** ($9/mo) — Funnels, invoices, AI features, integrations. Coming soon.

## License

[AGPL-3.0](LICENSE)

---

Built by [@zerox9dev](https://zerox9dev.com)
