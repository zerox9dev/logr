![AI Team Cover](cover.png)

# AI Team 🤖

Open-source AI product team. Five agents work sequentially — from idea to production-ready code.

No frameworks. No infrastructure. Just `.md` files and any AI.

## How it works

```
You (operator)
  │
  ▼ task
[PM Agent] → analyzes problem → writes PRD
  │
  ▼
[Designer Agent] → reads PRD → writes UI/UX spec
  │
  ▼
[Engineer Agent] → reads PRD + design → writes code
  │
  ▼
[QA Agent] → tests everything → PASS or FAIL
  │
  ▼
[Reviewer Agent] → final check → SHIP, REWORK, or REJECT
```

You review after each step. You're the boss — agents do the work.

## Quick Start

```bash
# 1. Add to your project
npx degit zerox9dev/ai-team .ai-team

# 2. Describe your task
echo "# Task: Add dark mode toggle" > .ai-team/.pipeline/001-task.md

# 3. Open any AI and paste:
```

```
Read .ai-team/AGENTS.md
Task: .ai-team/.pipeline/001-task.md
Start with PM.
```

**That's it.** The AI reads AGENTS.md → auto-loads all agents, contracts, skills, context → runs the pipeline. Say "next" after each step.

> 📋 More prompts (quick fix, design only, continue from stage): see [START.md](START.md)

## Structure

```
├── AGENTS.md                # Entry point — pipeline, roles, orchestration
├── .agents/
│   ├── PM.md                # Product Manager agent
│   ├── DESIGNER.md          # Product Designer agent
│   ├── ENGINEER.md          # Developer agent
│   ├── QA.md                # QA Engineer agent
│   └── REVIEWER.md          # Senior Reviewer agent
├── .contracts/
│   ├── prd.md               # PM output quality gate
│   ├── design.md            # Designer output quality gate
│   ├── code.md              # Engineer output quality gate
│   ├── qa.md                # QA output quality gate
│   └── review.md            # Final review quality gate
├── .templates/
│   ├── saas.md              # Next.js + Supabase + Stripe + Vercel
│   ├── landing.md           # Astro + Tailwind + Cloudflare
│   ├── api.md               # Hono/FastAPI + PostgreSQL + Docker
│   ├── mobile.md            # React Native + Expo + Supabase
│   └── chrome-ext.md        # WXT + Manifest V3 + React
├── .context/
│   ├── decisions.md         # Architecture decisions log
│   ├── lessons.md           # Past mistakes (don't repeat)
│   └── glossary.md          # Domain-specific terms
├── .skills/
│   ├── STACK.md             # Project tech stack context
│   ├── STYLEGUIDE.md        # Design system & UI rules
│   └── CODESTANDARDS.md     # Coding conventions
├── .examples/
│   ├── 001-task.md          # Example task
│   ├── 001-prd.md           # Example PRD output
│   └── 001-design.md        # Example design output
└── .pipeline/
    └── 001-task.md          # Task template
```

## Agents

| Agent | Input | Output | Contract |
|-------|-------|--------|----------|
| **PM** | Task | PRD | `.contracts/prd.md` |
| **Designer** | PRD | UI/UX spec | `.contracts/design.md` |
| **Engineer** | PRD + Design | Working code | `.contracts/code.md` |
| **QA** | All above | Bug report | `.contracts/qa.md` |
| **Reviewer** | All above | Final verdict | `.contracts/review.md` |

## Agent Contracts

The killer feature. Every agent validates their output against a contract before passing to the next stage.

**What contracts prevent:**
- 🔄 **Infinite loops** — clear "done" criteria at each stage
- 🤥 **Hallucination cascading** — bad PM output caught before it reaches code
- 📈 **Scope creep** — contracts enforce PRD boundaries
- 💀 **Silent failures** — every acceptance criterion must be explicitly tested

**How it works:**
1. PM writes PRD → checks against `.contracts/prd.md`
2. If contract fails → PM re-runs (not Designer)
3. If contract passes → Designer proceeds
4. Same pattern for every stage

Think of it as **TypeScript for your AI pipeline** — type-checking outputs between agents.

## Templates

Pre-configured stacks with real 2026 tooling. Tell your AI which template to use:

```
Read .ai-team/AGENTS.md
Use template: .templates/saas.md
Task: .ai-team/.pipeline/001-task.md
```

| Template | Stack | Best for |
|----------|-------|----------|
| `saas.md` | Next.js 16 + Supabase + Stripe + Vercel + shadcn/ui | SaaS apps, dashboards |
| `landing.md` | Astro 5 + Tailwind v4 + Cloudflare Pages | Marketing pages, Product Hunt |
| `api.md` | Hono or FastAPI + PostgreSQL + Docker | REST APIs, microservices |
| `mobile.md` | React Native + Expo 52 + Expo Router | iOS + Android apps |
| `chrome-ext.md` | WXT + Manifest V3 + React + Tailwind | Browser extensions |

## Skills

Skills are shared context files that any agent can read:

| Skill | What it provides |
|-------|-----------------|
| `.skills/STACK.md` | Tech stack, dependencies, project structure |
| `.skills/STYLEGUIDE.md` | Design tokens, components, UI patterns |
| `.skills/CODESTANDARDS.md` | Code style, naming, file structure rules |

Add your own — any `.md` file in `.skills/` is available to all agents.

## Pipeline Rules

- Agents work **sequentially**, never in parallel
- Each agent reads **all previous results**
- Each agent validates output against their **contract**
- Operator reviews **after every step**
- Max **3 rework cycles** per task, then escalate
- QA FAIL → back to Engineer → QA re-checks
- Reviewer REWORK → back to specific stage

## How is this different?

| | AI Team | AGENTS.md standard | CrewAI | Symphony |
|---|---|---|---|---|
| Full product cycle | ✅ PM→Design→Code→QA | ❌ Code only | ✅ Custom roles | ❌ Code only |
| Quality gates | ✅ Contracts | ❌ None | ❌ None | ❌ None |
| Setup required | None | None | Python + API keys | Elixir + Linear |
| Works with | Any AI | Any AI | Python only | Codex only |
| Roles included | 5 ready to use | DIY | DIY | Code agent |

## Works With

- [Cursor](https://cursor.sh)
- [Claude](https://claude.ai)
- [ChatGPT](https://chat.openai.com)
- [OpenAI Codex](https://openai.com/codex)
- [Windsurf](https://codeium.com/windsurf)
- Any AI that can read markdown

## Add to existing project

```bash
npx degit zerox9dev/ai-team .ai-team
```

## Examples

Check `.examples/` for a real task run through the pipeline (task → PRD → design).

## Why .md?

- **Zero setup** — no Docker, no servers, no API keys
- **Works everywhere** — any AI, any IDE, any OS
- **Version controlled** — every step is a git commit
- **Human readable** — anyone can review the pipeline
- **Forkable** — customize agents for your team

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Keep it simple — the whole point is `.md` files.

## License

[MIT](LICENSE)

---

Built by [@zerox9dev](https://zerox9dev.com)
