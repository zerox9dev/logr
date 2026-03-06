# Task 001: Natural Language Time Entry

## Context
Logr — time tracking SaaS for freelancers.
Stack: Next.js 16, React 19, Supabase, Vercel AI SDK, shadcn/ui.

## Task
User types a natural language phrase like "2 hours design for Acme" and the system automatically creates a time entry with the correct client, project, duration, and description.

## Requirements
- Input field that accepts natural language
- AI parses: duration, client, project, task description
- Auto-suggest client/project from existing data
- Create time entry on submit
- Show confirmation with parsed data before saving

## Result
Working feature: UI component + API route + AI parsing logic.
