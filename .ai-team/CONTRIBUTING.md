# Contributing

Thanks for your interest in AI Team! Here's how to contribute.

## Adding a New Agent

1. Create `.agents/YOUR_AGENT.md`
2. Follow this structure:

```markdown
# [Role] Agent — [Title]

[One sentence: what this agent does]

## Input
- What files it reads

## Output  
- What file it writes

## What it does
1. Step 1
2. Step 2
3. ...

## Output Format
[Markdown template]

## Rules
- Rule 1
- Rule 2
```

3. Add the agent to the pipeline table in `AGENTS.md`
4. Submit a PR

## Adding a Skill

1. Create `.skills/YOUR_SKILL.md`
2. Write shared context that agents need
3. Update the skills table in `AGENTS.md`
4. Submit a PR

## Guidelines

- Keep files simple and readable
- One agent = one responsibility
- Agents communicate through `.pipeline/` files only
- Test your agent on a real task before submitting
- English for docs, but agents can work in any language

## What We're Looking For

- New agent roles (DevOps, Security, Copywriter, Data, etc.)
- New skills (API design, testing patterns, accessibility, etc.)
- Pipeline improvements
- Real-world examples in `.examples/`
- Translations of README

## What We Don't Want

- Framework dependencies
- Code that needs to be installed/compiled
- Agents that skip pipeline rules
- AI-generated PRs without testing
