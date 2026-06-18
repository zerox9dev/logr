# GEO Analysis — logr.work

_AI-search / Generative Engine Optimization audit (June 2026)_

## 1. GEO Readiness Score: **20 / 100** 🔴

The score is dominated by one structural fact: **logr.work is a client-rendered SPA, so AI crawlers (which do not execute JavaScript) see an empty `<body>`.** Everything else (good meta tags, sitemap, robots) can't compensate when there is no readable content to cite. Brand presence in AI-cited sources is also effectively zero.

| Dimension (weight) | Score | Note |
|---|---|---|
| Citability (25%) | 10 | No prerendered body text — nothing quotable |
| Structural readability (20%) | 15 | No served headings/lists/tables (client-only) |
| Multi-modal (15%) | 10 | Images not crawler-visible; no `og:image` |
| Authority & brand (20%) | 10 | Absent from Wikipedia/Reddit/AlternativeTo/listicles |
| Technical accessibility (20%) | 45 | Crawlers allowed + sitemap + llms.txt added, but **no SSR** |

## 2. Platform breakdown

| Platform | Est. visibility | Why |
|---|---|---|
| Google AI Overviews | 🔴 very low | 92% of AIO citations come from top-10 pages; an empty SPA body won't rank or yield passages |
| ChatGPT | 🔴 very low | Cites Wikipedia (47.9%) + Reddit (11.3%) — logr has neither |
| Perplexity | 🔴 very low | Cites Reddit (46.7%) + Wikipedia — no presence |

## 3. AI crawler access ✅

`robots.txt` = `User-agent: *  Allow: /  Disallow: /app/`. Wildcard **allows all AI crawlers** (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot). No AI crawler is blocked — access is fine. (`Disallow: /app/` matches no real route — the app lives at `/`; harmless but vestigial.)

## 4. llms.txt ⚠️

`public/llms.txt` exists in the repo (added this session) but **could not be confirmed live** at `logr.work/llms.txt` — verify after the next Vercel deploy (it must return the text file, not the SPA `index.html`). Content is spec-shaped (summary + link sections). Good once deployed.

## 5. Brand mention analysis 🔴 (highest-leverage gap)

Brand mentions correlate ~3× more strongly with AI visibility than backlinks. A search for logr in the "open-source Toggl alternative" space returns **none** of logr — the slots are held by Kimai, Solidtime, ActivityWatch, Super Productivity.

| Source | Present? | Impact |
|---|---|---|
| Wikipedia / Wikidata | ❌ | High (ChatGPT/Perplexity) |
| Reddit (r/selfhosted, r/freelance) | ❌ | High (Perplexity 46.7%) |
| AlternativeTo / opensourcealternative.to | ❌ | High (category queries) |
| awesome-selfhosted | ❌ | High (the canonical list) |
| YouTube | ❌ | Strongest single signal (~0.737) |
| LinkedIn | ❌ | Moderate |

## 6. Passage-level citability 🔴

Optimal AI-citation blocks are 134–167 self-contained words with a definition-style opener. **None exist in served HTML** because the body is client-rendered. There are no served `<h2>` question headings, no comparison tables, no FAQ in the DOM crawlers receive.

## 7. Server-side rendering check 🔴 (root cause)

Confirmed empty prerendered `<body>` (only `<div id="root">` + script). Static `<head>` is good (title, description, OG, Twitter, canonical, hreflang) — but **zero indexable body content**. This is the single change that unblocks every other dimension.

## 8. Top 5 highest-impact changes

1. **Serve real content HTML for the public surface (SSR/SSG/prerender).** Options: migrate to Next.js (also solves the server-layer needs discussed for invoicing/AI), add a prerendered static landing (Astro / vite SSG / a hand-built static `index`), or prerender the marketing + `/share/*` routes. Without this, GEO stays near-zero.
2. **Get into the AI-cited sources.** Submit to AlternativeTo, opensourcealternative.to, awesome-selfhosted (PR), and do an r/selfhosted launch. These pages *are* what ChatGPT/Perplexity quote for "open source toggl alternative."
3. **Add JSON-LD structured data to `index.html`** (static → crawler-visible even in a SPA): `SoftwareApplication` + `Organization` (+ `FAQPage` once a landing FAQ exists).
4. **Deploy + verify `llms.txt`; add `og:image`.** `twitter:card` is `summary_large_image` but no image is declared — add `og:image`/`twitter:image` (1200×630) for social + AI previews.
5. **Build a citable landing** (once SSR/SSG exists): definition opener ("Logr is an open-source, self-hostable time tracker…" in the first 60 words), a comparison table vs Toggl/Harvest/Clockify, and a 4–6 question FAQ in 134–167-word blocks.

## 9. Schema recommendations (JSON-LD in `index.html`)

- **SoftwareApplication** — `name`, `applicationCategory: "BusinessApplication"`, `operatingSystem: "Web"`, `offers` (free), `url`, `description`.
- **Organization** — `name: "Logr"`, `url`, `logo`, `sameAs` (GitHub, X, LinkedIn) for entity linking.
- **SoftwareSourceCode** — point to the GitHub repo + AGPL license.
- **FAQPage** — once the landing has a FAQ section.

## 10. Content reformatting suggestions

Because the served body is empty, the work is **create**, not rewrite. On a prerendered landing add, in this order:
- A one-sentence definition in the first 60 words.
- Question H2s: "What is Logr?", "Is Logr a good open-source Toggl alternative?", "Can I self-host Logr?", "Does Logr do invoicing?".
- The Toggl/Harvest/Clockify comparison table (reuse the README one — it's already data-rich).
- A short FAQ, each answer a self-contained 134–167-word block with a specific fact.

---

### TL;DR
robots/sitemap/meta are fine and `llms.txt` is added — but logr.work is a **client-only SPA with no crawler-visible content** and **no brand presence in AI-cited sources**. The two moves that matter: (1) **prerender/SSR a real content landing**, (2) **get listed where AI search looks** (AlternativeTo, awesome-selfhosted, Reddit). Everything else is secondary.
