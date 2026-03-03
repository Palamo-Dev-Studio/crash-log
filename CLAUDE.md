# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Crash Log is a bilingual (EN/ES) newsletter website about AI and tech failures. An AI newsroom team produces the content; a human editor (Hector Luis Alamo) curates and publishes it. Built with Next.js 16 (App Router) and Sanity 5 as the headless CMS.

## Commands

- `npm run dev` — Start development server (Next.js + embedded Sanity Studio at `/studio`)
- `npm run build` — Production build
- `npm run start` — Start production server

No linter, formatter, or test framework is configured yet. No `scripts/verify.sh` exists yet.

## Architecture

**Stack:** Next.js 16.1.6 (React 19, App Router) · Sanity 5.13.0 · Plain CSS (design tokens + CSS modules)

**Routing:** App Router with locale prefix. Root `/` redirects to `/en`. All pages live under `app/[locale]/`. Sanity Studio is embedded at `app/studio/[[...index]]/`.

**Locale detection** (`middleware.js`): Cookie (`CRASH_LOG_LOCALE`) → Accept-Language header → defaults to `en`. Supported locales: `en`, `es`.

**Sanity client** (`lib/sanity.js`): Exports `client` (configured with CDN) and `urlFor()` image URL builder. API version: `2024-03-01`.

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

## Current State

Early development. Sanity schemas and Studio are fully configured. Frontend pages are skeleton/loading state. No tests, no linter, no CI pipeline.
