# Template: SaaS Application

Use this template when building a SaaS web app (dashboard, admin panel, B2B/B2C product).

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Full-stack React, SSR/SSG, API routes |
| Language | TypeScript 5.x | Type safety, better AI code generation |
| UI | shadcn/ui + Tailwind CSS v4 + Radix UI | Accessible, customizable, copy-paste components |
| Database | Supabase (PostgreSQL) | Auth, realtime, storage, edge functions, row-level security |
| ORM | Drizzle ORM | Type-safe queries, lightweight, great DX |
| Auth | Supabase Auth or Clerk | Social login, MFA, session management |
| Payments | Stripe | Subscriptions, invoices, usage-based billing |
| Email | Resend + React Email | Transactional emails with React components |
| AI | Vercel AI SDK + OpenAI / Anthropic | Streaming, tool calling, structured output |
| Deploy | Vercel | Zero-config, preview deploys, edge functions |
| Analytics | PostHog or Plausible | Privacy-friendly, self-hostable |
| Monitoring | Sentry | Error tracking, performance monitoring |

## Project Structure

```
app/
├── (auth)/           # Login, signup, forgot password
├── (dashboard)/      # Protected app routes
├── (marketing)/      # Landing page, pricing, blog
├── api/              # API routes
lib/
├── db/               # Drizzle schema, migrations
├── auth/             # Auth helpers
├── stripe/           # Payment logic
├── ai/               # AI integrations
components/
├── ui/               # shadcn/ui components
├── forms/            # Form components
├── layouts/          # Shell, sidebar, header
```

## Key Patterns

- **Server Components by default** — client only when needed (forms, interactivity)
- **Server Actions** for mutations — no REST endpoints for CRUD
- **Row Level Security** in Supabase — never trust the client
- **Optimistic updates** for perceived speed
- **Middleware** for auth checks and redirects
- **Feature flags** for gradual rollout

## Agents should know:

- PM: SaaS means subscriptions, onboarding, billing, multi-tenancy
- Designer: Dashboard UI patterns, data tables, forms, settings pages
- Engineer: Use Server Components, Server Actions, Supabase RLS
- QA: Test auth flows, payment webhooks, edge cases with empty data
