# Agent Notes — The Crash Log

## Current State

- **Branch:** `main` (initial commit pending)
- **Build:** `npm run build` passes cleanly (Next.js 16.1.6 Turbopack)
- **Tests:** None yet (no test framework configured)
- **Verification script:** Not yet created

## What's Done

- **Phase 1 (Project Foundation):** Next.js 14+ app initialized with App Router. Sanity client configured (`lib/sanity.js`). Studio embedded at `/studio`. Global CSS with full design token system. Google Fonts wired (Space Grotesk, Source Serif 4, IBM Plex Mono). Middleware for locale detection (EN/ES). Root redirect to `/en`.
- **Phase 2 (Sanity Schemas):** All schemas created — 6 object types (`blockContent`, `localizedString`, `localizedText`, `localizedBlockContent`, `stackTraceHit`, `sourceLink`) and 6 document types (`issue`, `story`, `category`, `agent`, `aboutPage`, `siteSettings`). Field groups for tabbed EN/ES/Meta editing. Registered in `sanity.config.js`.
- **Phase 3 (React Components):** `SeverityBadge` component + CSS module created. Remaining components not yet built.

## Immediate Next Step

Continue Phase 3: Build all remaining React components (Header, SiteNav, StoryBlock, NicosTransmission, StackTrace, LanguageToggle, DonateCTA, Footer, IssueHeader, CoverImage, FallbackBanner). Each uses CSS Modules referencing global design tokens. Refer to `docs/reference/crash-log-site-design.jsx` and `docs/reference/crash-log-014.html` for exact styling specs.

## Known Issues / Deferred Items

- Sanity project not yet provisioned — `.env.local` has placeholder values. Need to run `npx sanity@latest init --env` to create actual project + dataset.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional for now, may need migration.
- No test framework, linter, or CI pipeline configured yet.
- Beehiiv integration, RSS feeds, and content seeding are deferred to later phases.
