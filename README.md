# Logr

Freelance time tracker for client/project work with CSV and invoice export.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- localStorage persistence (`logr_clients`, `logr_sessions`)

## Quick Start

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Features

- Clients -> Projects -> Tasks hierarchy
- Start/stop timer with `Space`
- Task statuses: `PENDING`, `ACTIVE`, `DONE`
- Manual session entry (date/hours/minutes/rate/status)
- Date filters: all, 7 days, current month, custom month
- Inline edit for completed sessions
- CSV export
- Printable invoice (PDF via browser print dialog)
- Light/Dark theme toggle
- Mobile-friendly sidebar behavior

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / Stop timer (outside inputs) |
| `Enter` | Confirm add client/project in inline input |
| `Escape` | Close add client/project inline input |

## Project Structure

```txt
app/
  layout.tsx
  page.tsx
  globals.css

components/
  logr/
    LogrApp.jsx
    lib/
      constants.js
      utils.js
    ui/
      GlobalStyles.jsx
      ManualEntry.jsx
      MobileTopBar.jsx
      ProjectAndDateFilters.jsx
      SessionsList.jsx
      Sidebar.jsx
      StatsAndExports.jsx
      TaskComposer.jsx
      TimerHeader.jsx
      WelcomeState.jsx
```

## Data Shape

```js
// localStorage key: logr_clients
[{ id, name, projects: [{ id, name }] }]

// localStorage key: logr_sessions
[{ id, clientId, projectId, name, notes, duration, earned, rate, ts, status }]
```

## Notes

- Data is stored locally in the browser.
- For production, replace localStorage with a backend (e.g. Supabase/Postgres + auth).

## License

This project is licensed under the Apache License 2.0.

- License text: `/Users/zerox9dev/logr/LICENSE`
- Attribution notices: `/Users/zerox9dev/logr/NOTICE`

If you copy, fork, or redistribute this project (including modified versions),
you must keep copyright and attribution notices.
