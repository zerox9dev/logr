# Logr Design System

## Colors (Dark Theme — Zinc)

| Token | Value | Use |
|-------|-------|-----|
| background | #09090b | Page background |
| foreground | #fafafa | Primary text |
| card | #09090b | Card backgrounds |
| muted | #27272a | Disabled, secondary bg |
| muted-foreground | #a1a1aa | Secondary text |
| border | #27272a | All borders |
| primary | #fafafa | Primary buttons, active states |
| secondary | #27272a | Secondary buttons |
| destructive | #7f1d1d | Delete, danger |
| accent | #27272a | Hover states |
| emerald-600 | #059669 | Timer start, success |

## Typography

- Font: Inter (400, 500, 600, 700, 800)
- Page title: text-2xl font-bold
- Section title: text-lg font-semibold
- Body: text-sm
- Caption: text-xs text-muted-foreground
- Mono (timer, numbers): font-mono tabular-nums

## Spacing

- Page padding: p-6
- Card padding: p-6
- Gap between sections: space-y-6
- Gap between items: space-y-3

## Components

- Buttons: rounded-md, h-9
- Cards: rounded-xl, border, shadow
- Inputs: bg-transparent, placeholder:text-muted-foreground
- Sidebar: w-16 (collapsed) / w-56 (expanded at lg:)

## Patterns

- Empty states: centered text, text-muted-foreground
- Lists: border items with hover:bg-accent/50
- Navigation: icon + label, active = bg-sidebar-accent
- Timer: prominent, full-width card with inline inputs
