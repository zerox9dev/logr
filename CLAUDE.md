# logr — notes for agents

## The running timer ticks every second
`TrackerProvider` (`src/contexts/tracker-context.tsx`) changes `seconds` once a
second while the timer runs, and everything that reads `useTracker()` renders
on that tick. Repeated review finding:

- Keep context values memoised (`useMemo`), and read callbacks like `toggle`
  through a ref when a listener only needs to call them.
- In anything that renders per tick (the calendar, the projects panel), do
  per-item work once per render — never inside a per-day or per-row loop —
  and keep only the live block depending on `tracker.seconds`.
