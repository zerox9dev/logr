# Start Here

Copy one of these prompts into your AI. That's it.

---

## 🚀 New task (full pipeline)

```
Read AGENTS.md. Then read all .md files in .agents/, .contracts/, .skills/, and .context/.
My task: .pipeline/001-task.md
Start with PM agent.
```

## 🚀 New task with template

```
Read AGENTS.md. Then read all .md files in .agents/, .contracts/, .skills/, .context/, and .templates/saas.md.
My task: .pipeline/001-task.md
Start with PM agent.
```

Replace `saas.md` with: `landing.md`, `api.md`, `mobile.md`, or `chrome-ext.md`.

## ⚡ Quick fix (skip PM + Designer)

```
Read AGENTS.md. Then read all .md files in .agents/, .contracts/, .skills/, and .context/.
My task: .pipeline/001-task.md
This is a bug fix / small change. Skip PM and Designer. Start with Engineer agent.
```

## 🎨 Design only (no code)

```
Read AGENTS.md. Then read all .md files in .agents/, .contracts/, .skills/, and .context/.
My task: .pipeline/001-task.md
I only need PRD and design spec. Run PM → Designer, then stop.
```

## 🔄 Continue from a specific stage

```
Read AGENTS.md. Then read all .md files in .agents/, .contracts/, .skills/, .context/, and .pipeline/.
Previous results are already in .pipeline/. Continue from Engineer agent.
```

---

## Tips

- **Write your task** in `.pipeline/001-task.md` before starting
- **Say "next"** after each step to continue the pipeline
- **Give feedback** at any step to re-run that agent
- **Use templates** to give agents your exact tech stack
- **Fill in .context/** as your project grows — agents will learn from past decisions
