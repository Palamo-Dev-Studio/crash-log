# The Crash Log

A bilingual (EN/ES) publication about AI and tech failures. An AI newsroom drafts the reporting; a human editor ([Hector Luis Alamo](https://github.com/hectorluisalamo)) curates and publishes it.

🌐 **Live:** [crashlog.ai](https://crashlog.ai)

---

## Overview

The Crash Log covers where AI and technology break — the crashes, the bugs, the failures — as a fully bilingual publication with field-level English/Spanish content. It's a Next.js 16 site backed by Sanity as a headless CMS, with an embedded Sanity Studio for editing. English is the required baseline for every piece; Spanish translations are layered in per field.

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19)
- **CMS:** Sanity 5 (headless, with embedded Studio at `/studio`)
- **Content rendering:** Portable Text (`@portabletext/react`)
- **Styling:** Plain CSS — design tokens + CSS modules, dark theme by default (no CSS framework)
- **Testing:** Vitest (unit/component/integration) + Playwright (e2e)
- **Tooling:** ESLint + Prettier
- **Integrations:** Beehiiv (newsletter delivery), Stripe (payments)

## Getting started

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone https://github.com/Palamo-Dev-Studio/crash-log.git
cd crash-log
npm install
```

Create a `.env.local` in the project root (see [Environment variables](#environment-variables)), then start the dev server:

```bash
npm run dev
```

The site runs at `http://localhost:3000` (root `/` redirects to `/en`), with the Sanity Studio embedded at `http://localhost:3000/studio`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Sanity project ID (the site renders in a degraded/empty state without a valid ID) |
| `NEXT_PUBLIC_SANITY_DATASET` | No | Sanity dataset (defaults to `production`) |
| `SANITY_REVALIDATE_SECRET` | For webhooks | HMAC secret validating the Sanity → Next.js revalidation webhook |
| `SEND_NEWSLETTER_SECRET` | For newsletter send | Guards the newsletter-send endpoint |
| `BEEHIIV_API_KEY` | For newsletter | Beehiiv API key |
| `BEEHIIV_PUBLICATION_ID` | For newsletter | Beehiiv publication ID |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Next.js + embedded Studio) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm test` | Run Vitest unit/component/integration tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Tests with a coverage report |
| `npm run test:e2e` | Playwright e2e tests (auto-starts the dev server) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `scripts/verify.sh` | Build gate — lint, format check, tests, then build (non-zero exit on any failure) |

## Project structure

```
app/(site)/[locale]/          # Localized site pages (en, es)
app/(studio)/studio/          # Embedded Sanity Studio
app/api/revalidate/           # Sanity webhook → on-publish revalidation
lib/                          # sanity client, GROQ queries, locale + portable-text helpers
sanity/schemas/               # Content model (documents + object types)
components/                   # UI components (CSS modules)
middleware.js                 # Locale detection + / → /en redirect
docs/                         # Reference docs, plans, SEO audit
__tests__/ · e2e/             # Vitest + Playwright suites
```

## Content model

Sanity documents: **`issue`** (an edition; references stories) → **`story`** (a reporting block with a severity level) → **`category`** (coverage beat) and **`agent`** (AI or human masthead member). `aboutPage` and `siteSettings` are singletons.

**Localization** is field-level via reusable object types (`localizedString`, `localizedText`, `localizedBlockContent`): English required, Spanish optional. See `docs/reference/` for the i18n guide.

## Deployment

Deployed at [crashlog.ai](https://crashlog.ai). Content updates flow through a Sanity webhook to the `/api/revalidate` endpoint (HMAC-validated), with time-based revalidation (~1h) as a safety net.

## Editorial model

An AI newsroom system drafts the reporting — discovery, drafting, and bilingual translation — and a human editor reviews, curates, and publishes every piece. The tooling produces; the editor decides.

---

© 2026 Palamo Studio. All rights reserved.
