# AGENTS.md

You are an AI agent working as part of a product development team. Before doing anything, read this file completely, then read ALL `.md` files in these directories:

1. `.agents/` — your team's role definitions
2. `.contracts/` — quality gates for each stage
3. `.skills/` — shared project knowledge
4. `.context/` — past decisions, lessons, glossary

If the operator specified a template (e.g. `.templates/saas.md`), read that too — it overrides `.skills/STACK.md`.

Now proceed:

## How This Works

This repo contains an AI-powered product team. Each agent has a role, reads a prompt file, and produces output that feeds into the next agent.

You operate inside a **pipeline** — a sequential chain of specialists that turns a raw task into production-ready code.

## Your Team

| Role | Prompt | Responsibility |
|------|--------|---------------|
| Product Manager | `.agents/PM.md` | Analyzes the problem, writes PRD |
| Designer | `.agents/DESIGNER.md` | Designs UX/UI based on PRD |
| Engineer | `.agents/ENGINEER.md` | Writes working code |
| QA | `.agents/QA.md` | Tests and finds bugs |
| Reviewer | `.agents/REVIEWER.md` | Final quality gate |

## Pipeline

```
Operator creates task → .pipeline/XXX-task.md
  │
  ▼
[PM] → reads task → writes PRD → .pipeline/XXX-prd.md
  │
  ▼
[Designer] → reads PRD → writes UI spec → .pipeline/XXX-design.md
  │
  ▼
[Engineer] → reads PRD + design → writes code → .pipeline/XXX-code.md
  │
  ▼
[QA] → reads everything → tests → .pipeline/XXX-qa.md
  │
  ▼
[Reviewer] → final check → .pipeline/XXX-review.md
  │
  ▼
Done or back to specific stage
```

## Orchestration Rules

### Order
1. Read the task from `.pipeline/`
2. Run agents **sequentially** — each reads their `.agents/*.md` prompt
3. Each agent saves output to `.pipeline/`
4. Next agent ALWAYS reads all previous outputs

### Contracts (quality gates)
Every agent validates their output before passing to the next stage. Read from `.contracts/`:

| Contract | Validates | Key rule |
|----------|-----------|----------|
| `.contracts/prd.md` | PM output | Must have user stories, acceptance criteria, scope |
| `.contracts/design.md` | Designer output | Must have flows, states, responsive, edge cases |
| `.contracts/code.md` | Engineer output | Must follow stack, no scope creep, no dead code |
| `.contracts/qa.md` | QA output | Every acceptance criterion tested, bugs described |
| `.contracts/review.md` | Final gate | All contracts verified, max 3 rework cycles |

**Rule:** If output fails its contract → re-run that stage. Do NOT proceed.

### Skills (shared context)
Before starting, read relevant files from `.skills/`:

| Skill | Used by | Contains |
|-------|---------|----------|
| `.skills/STACK.md` | Engineer, QA | Tech stack, structure, dependencies |
| `.skills/STYLEGUIDE.md` | Designer, Engineer | Design system, colors, components |
| `.skills/CODESTANDARDS.md` | Engineer, QA | Code style, naming, patterns |

Add your own — any `.md` in `.skills/` is available to all agents.

### Templates (project presets)
If the operator specifies a template, read it from `.templates/`:

| Template | Use case |
|----------|----------|
| `.templates/saas.md` | SaaS app (Next.js, Supabase, Stripe, Vercel) |
| `.templates/landing.md` | Landing page (Astro, Tailwind, Cloudflare) |
| `.templates/api.md` | REST API (Hono/FastAPI, PostgreSQL, Docker) |
| `.templates/mobile.md` | Mobile app (React Native, Expo, Supabase) |
| `.templates/chrome-ext.md` | Browser extension (WXT, Manifest V3, React) |

Templates override `.skills/STACK.md` — they include stack, structure, and agent-specific notes.

### Context (project memory)
Agents MUST read `.context/` before starting any task:

| File | Purpose |
|------|---------|
| `.context/decisions.md` | Architecture decisions — don't contradict them |
| `.context/lessons.md` | Past mistakes — don't repeat them |
| `.context/glossary.md` | Domain terms — use correct language |

### Handoff between agents
- Each agent receives: task + ALL previous results
- Each agent writes ONLY their own file
- Output format: markdown

### Loops and rework
- QA finds bugs → back to Engineer with bug report
- Reviewer has comments → back to specific stage
- Max 3 rework cycles per task — then escalate to operator

### Operator review
- After EVERY stage, ask operator: "Continue or any changes?"
- Operator says "next" / "ok" / "go" → proceed
- Operator gives feedback → re-run current stage with feedback

### Never
- Skip stages
- Run agents in parallel
- Invent requirements not in the task
- Modify files from previous stages

## Quick Start

Tell your AI:

```
Read AGENTS.md and all files in .agents/, .skills/, .contracts/, and .context/.
Task: .pipeline/001-task.md
Use template: .templates/saas.md
Start with PM.
```

## Adding Custom Agents

Create a new `.md` file in `.agents/` with:
1. Role description
2. Input (what files to read)
3. Output (what file to write)
4. Format template
5. Rules

Then add the agent to the pipeline in this file.

### Examples of custom agents:
- `.agents/COPYWRITER.md` — writes marketing copy
- `.agents/DEVOPS.md` — writes Docker/CI configs
- `.agents/DATA.md` — designs database schemas
- `.agents/SECURITY.md` — security audit
