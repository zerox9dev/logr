# Contributing to Logr

Thanks for your interest in improving Logr! Contributions of all sizes are welcome.

## Ways to help

- 🐛 **Report bugs** — open an issue with steps to reproduce, expected vs actual behavior, and your environment.
- 💡 **Suggest features** — open an issue describing the problem you're trying to solve (not just the solution).
- 🔧 **Send a PR** — fixes, features, docs, translations.
- ⭐ **Star the repo** — it genuinely helps others discover the project.

## Development setup

```bash
git clone https://github.com/zerox9dev/logr.git
cd logr
npm install
cp .env.local.example .env.local   # then point POCKETBASE_URL at your PocketBase instance
npm run dev
```

See the [README](README.md#pocketbase-setup) for the PocketBase setup (collections, API rules, password-reset link). `docker compose up -d` starts a PocketBase instance that applies `pb_migrations/` on boot, so a fresh checkout has the full schema without any manual clicking.

## Before opening a PR

Run the full check — it must pass:

```bash
npm run check   # typecheck → lint → test → build
```

Guidelines:

- **TypeScript everywhere**; no `any` unless unavoidable.
- **Tailwind only** for styling — no CSS files or CSS Modules.
- **Add/keep tests** for pure logic in `src/domain/` (Vitest).
- Keep the layered structure: `api/ · contexts/ · hooks/ · domain/ · i18n/ · lib/ (infra) · components/{ui,shared,…}`. New files go in the matching layer.
- Use the `@/` import alias, not deep relative paths.
- **Update the README** (Features / routes / structure) when your change affects them.
- New user-facing strings need keys in all three languages (`en` / `uk` / `ru`) under `src/i18n/`.

## Commits & PRs

- Small, focused commits with clear messages (Conventional Commits style: `feat:`, `fix:`, `refactor:`, `docs:` …).
- Describe **what** changed and **why** in the PR. Link related issues.
- Screenshots/GIFs for UI changes are appreciated.

## Code of conduct

Be respectful and constructive. We're here to build something useful together.
