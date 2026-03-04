# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Crash Log is a bilingual (EN/ES) newsletter website about AI and tech failures. An AI newsroom team produces the content; a human editor (Hector Luis Alamo) curates and publishes it. Built with Next.js 16 (App Router) and Sanity 5 as the headless CMS.

## Commands

- `npm run dev` — Start development server (Next.js + embedded Sanity Studio at `/studio`)
- `npm run build` — Production build
- `npm run start` — Start production server

- `npm test` — Run Vitest unit/component/integration tests
- `npm run test:watch` — Run Vitest in watch mode
- `npm run test:coverage` — Run tests with coverage report
- `npm run test:e2e` — Run Playwright e2e tests (auto-starts dev server)

- `scripts/verify.sh` — Build-gate verification (runs `npm test` then `npm run build`, exits non-zero on failure)

No linter or CI pipeline configured yet.

## Architecture

**Stack:** Next.js 16.1.6 (React 19, App Router) · Sanity 5.13.0 · Plain CSS (design tokens + CSS modules)

**Routing:** App Router with route groups. Site pages live in `app/(site)/[locale]/`. Sanity Studio lives in `app/(studio)/studio/[[...index]]/`. Each group has its own root layout with `<html>` tag — enabling dynamic `lang` attribute per locale. Root `/` redirects to `/en` via middleware.

**Locale detection** (`middleware.js`): Cookie (`CRASH_LOG_LOCALE`) → Accept-Language header → defaults to `en`. Supported locales: `en`, `es`.

**Locale utilities** (`lib/locale.js`): `t(field, locale)` resolves localized fields with EN fallback. `hasFullTranslation()` checks if an issue has complete Spanish content. Exports `LOCALES`, `DEFAULT_LOCALE`, `LOCALE_LABELS`, `LOCALE_OG`.

**Sanity client** (`lib/sanity.js`): Exports `client` (null-safe — returns `null` when `projectId` is invalid/placeholder) and `urlFor()` chainable image URL builder. API version: `2024-03-01`.

**Data fetching** (`lib/queries.js`): GROQ queries with try/catch fetch wrappers. `getLatestIssue()`, `getIssueBySlug()`, `getAllIssueSlugs()`, `getAllIssuesSummary()`. All return `null`/`[]` on failure.

**Portable Text** (`lib/portableText.js`): Component config for `@portabletext/react` — blocks, marks (with safe external links), and image types.

**Sanity Studio config** (`sanity.config.js`): Registers all schemas, uses `structureTool` + `visionTool` plugins.

**Styling:** Global design tokens in `app/globals.css` (colors, typography, severity levels, agent accents). Components use CSS modules. Dark theme by default. No CSS framework.

## Content Model (Sanity Schemas)

Schemas live in `sanity/schemas/`. Object types in `sanity/schemas/objects/`.

**Documents:** `issue` (newsletter edition container) → references `story` docs and inline `stackTraceHit` objects. `story` (individual reporting block with severity level). `category` (coverage beat). `agent` (AI or human masthead member). `aboutPage` and `siteSettings` are singletons.

**Severity levels** (on stories): `ERROR`, `OVERRIDE`, `TERMINATE`, `WARNING`, `CRITICAL`, `BREACH`.

**Localization strategy:** Field-level bilingual via reusable object types — `localizedString`, `localizedText`, `localizedBlockContent`. English is required; Spanish is optional. See `docs/reference/crash-log-i18n-guide-revised.md` for details.

## Key Conventions

- Path alias: `@/*` maps to project root (configured in `jsconfig.json`)
- All new code files must start with a two-line `ABOUTME:` comment explaining the file's purpose
- Components live in `components/` (flat, not nested by feature yet)
- Rich text uses Sanity Portable Text, rendered with `@portabletext/react`

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` — Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` — Sanity dataset name (defaults to `production`)

## Reference Documentation

Detailed design and content specs live in `docs/reference/`:

- `crash-log-content-model-revised.md` — Full schema field definitions
- `crash-log-i18n-guide-revised.md` — Localization strategy and patterns
- `crash-log-design-system.jsx` — Color palette, typography, severity tokens
- `crash-log-site-design.jsx` — UI component specifications
- `crash-log-about-page-draft.md` — About page copy

Execution plans: `docs/plans/active/` (in progress) and `docs/plans/completed/` (done).

## SEO

- Dynamic `generateMetadata` on all pages with locale-aware OG, Twitter cards, and hreflang alternates
- JSON-LD schemas: `WebSite` (site layout), `NewsArticle` + `BreadcrumbList` (issue pages)
- `robots.js` disallows `/studio/`, adds crawl-delay for AI bots
- `sitemap.js` generates entries for all pages × locales with hreflang alternates and `x-default`
- Studio layout has `noindex`/`nofollow` robots meta

## Current State

Phases 1–8 complete. Sanity schemas, Studio, 16 React components, issue pages, locale infrastructure, SEO foundation, content seeding, test framework, ESLint + Prettier, CI pipeline, RSS feeds, and dynamic OG images are all in place. `scripts/verify.sh` passes (195 tests + 29 static pages). Deployed to Vercel at `crashlog.ai`.

## Testing

**Vitest** for unit, component, and integration tests. **Playwright** for e2e.

- Config: `vitest.config.mjs` — jsdom environment, `@` path alias, CSS module proxy, custom JSX-in-`.js` plugin
- Config: `playwright.config.mjs` — Chromium, auto-starts dev server on port 3000
- Setup: `__tests__/setup.js` — jest-dom matchers, DOM cleanup
- Mocks: `__tests__/mocks/` — next/image, next/link, next/navigation stubs
- Unit tests: `__tests__/unit/lib/` — locale, sanity, queries, portableText
- Component tests: `__tests__/unit/components/` — all 16 components
- Integration tests: `__tests__/integration/` — middleware, robots, rss-feed
- E2E tests: `e2e/` — home, navigation, locale-switching, empty-state

**JSX in .js files:** The project uses JSX in `.js` files (Next.js convention). A custom Vite plugin in `vitest.config.mjs` (`jsxInJsPlugin`) transforms these via esbuild before Vite's import analysis.
