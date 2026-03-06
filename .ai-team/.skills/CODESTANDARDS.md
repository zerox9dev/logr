# Logr Code Standards

## TypeScript
- Strict mode enabled
- No `any` — use proper types or `unknown`
- Interfaces for component props (suffix: `Props`)
- Types in `src/types/` for shared interfaces

## React
- Functional components only
- `forwardRef` for UI primitives (button, input, card)
- Regular functions for app components (no forwardRef needed)
- Hooks: custom hooks in `src/lib/hooks/`
- State: `useState` for local, Zustand for global (when needed)

## File Structure
- One component per file
- Component file = PascalCase in kebab-case file: `TimerDisplay` in `timer-display.tsx`
- Index files only for re-exports, not logic
- Co-locate related files: `timer/timer-display.tsx` + `timer/time-entries.tsx`

## Imports
- Use path alias: `@/components/ui/button` not `../../components/ui/button`
- Group: React → external libs → internal → types → styles

## Styling
- Tailwind classes only — no CSS modules, no styled-components
- Use `cn()` from `@/lib/utils` for conditional classes
- CVA for component variants (button, badge, etc.)
- No inline styles

## Naming
- Components: PascalCase (`TimerDisplay`)
- Files: kebab-case (`timer-display.tsx`)
- Hooks: camelCase with `use` prefix (`useTimer`)
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase (`TimeEntry`)

## No-go
- No `console.log` in commits
- No hardcoded colors — use theme tokens
- No `!important`
- No `index.tsx` with logic
- No default exports (except App.tsx and pages)
