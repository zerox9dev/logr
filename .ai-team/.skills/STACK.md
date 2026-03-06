# Logr Tech Stack

## Core
- **Runtime:** Vite 7 + React 19 + TypeScript 5.9
- **Styling:** Tailwind CSS v4 (via @tailwindcss/vite plugin)
- **UI Components:** shadcn/ui (Radix UI + Tailwind + CVA)
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)

## Backend (planned)
- **Database:** Supabase (PostgreSQL + Row Level Security)
- **Auth:** Supabase Auth
- **Realtime:** Supabase Realtime (for timer sync)
- **Storage:** Supabase Storage (for invoices/attachments)

## Structure
```
src/
├── components/
│   ├── layout/         # Sidebar, header, shell
│   ├── timer/          # Timer display, time entries
│   ├── projects/       # Project CRUD
│   ├── clients/        # Client CRUD
│   ├── invoices/       # Invoice builder
│   ├── reports/        # Charts, analytics
│   └── ui/             # shadcn/ui base components
├── lib/
│   ├── utils.ts        # cn() helper
│   ├── supabase.ts     # Supabase client
│   └── hooks/          # Custom React hooks
├── types/              # TypeScript interfaces
├── App.tsx             # Root component + routing
├── main.tsx            # Entry point
└── index.css           # Tailwind + theme tokens
```

## Theme
- Dark mode by default (zinc palette)
- CSS variables for all colors (--color-background, --color-foreground, etc.)
- Border radius: 0.5rem (lg)

## Conventions
- Path alias: `@/` maps to `src/`
- Components: PascalCase files, named exports
- Hooks: `use` prefix, in `lib/hooks/`
- No `default export` for components (except App.tsx)
