# Template: Landing Page

Use this template when building a marketing landing page, Product Hunt launch page, or waitlist page.

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Astro 5+ | Zero JS by default, 40-70% faster than Next.js for static content |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration |
| Components | Astro components + React islands | Static by default, interactive only where needed |
| Animations | Motion (framer-motion) or CSS | Scroll animations, hover effects |
| Forms | Resend or Formspree | Contact forms, waitlist signups |
| CMS (optional) | Astro Content Collections or Keystatic | Blog posts, changelog |
| Analytics | Plausible or Fathom | Lightweight, GDPR-friendly |
| Deploy | Cloudflare Pages or Vercel | Edge CDN, instant deploys |
| Fonts | Google Fonts or Fontshare | Variable fonts for performance |

## Alternative: Next.js landing

If the landing page is part of a larger Next.js app (e.g., SaaS marketing site):
- Use Next.js 16 with static generation
- `(marketing)/` route group in App Router
- Same Tailwind + shadcn/ui as the app

## Project Structure

```
src/
├── pages/
│   ├── index.astro        # Home page
│   └── blog/              # Blog (optional)
├── components/
│   ├── Hero.astro
│   ├── Features.astro
│   ├── Pricing.astro
│   ├── Testimonials.astro
│   ├── FAQ.astro
│   ├── CTA.astro
│   └── Footer.astro
├── layouts/
│   └── Base.astro         # HTML shell, meta, fonts
├── content/               # Markdown content
└── styles/
    └── global.css         # Tailwind imports
```

## Sections (standard SaaS landing)

1. **Hero** — headline, subheadline, CTA button, hero image/video
2. **Social proof** — logos, user count, ratings
3. **Features** — 3-6 features with icons
4. **How it works** — 3-step process
5. **Testimonials** — quotes from users
6. **Pricing** — 2-3 tiers
7. **FAQ** — 5-8 questions
8. **Final CTA** — repeat main CTA

## Key Patterns

- **Mobile-first** — design for 375px, then scale up
- **Above the fold** — hero + CTA visible without scroll
- **One CTA per section** — don't overwhelm
- **Lighthouse 95+** — no layout shift, optimized images, lazy loading
- **OG meta tags** — for social sharing (1200x630 image)

## Agents should know:

- PM: Landing page goal = conversions (signup, waitlist, purchase)
- Designer: Mobile-first, above-the-fold hierarchy, whitespace
- Engineer: Use Astro for static, React islands only for interactive parts
- QA: Test on mobile (375px), check Lighthouse, validate OG tags
