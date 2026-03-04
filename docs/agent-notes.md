# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `scripts/verify.sh` passes cleanly (29 static pages, Next.js 16.1.6 Turbopack)
- **Tests:** None yet (no test framework configured)
- **Verification script:** `scripts/verify.sh` — runs `npm run build`, exits non-zero on failure
- **Components:** 16 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard)
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/studio`, `/robots.txt`, `/sitemap.xml`
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 19 published documents: 7 categories, 6 agents, 3 stories, 1 issue, 1 aboutPage, 1 siteSettings.

## What's Done

- **Phase 1 (Project Foundation):** Next.js app with App Router, Sanity client, Studio at `/studio`, global CSS with design tokens, Google Fonts, locale middleware, root redirect.
- **Phase 2 (Sanity Schemas):** All schemas — 6 object types, 6 document types. Field groups for EN/ES/Meta editing.
- **Phase 3 (React Components):** All 12 components complete with CSS Modules. UI design review applied.
- **Phase 4 (Issue Pages + Locale Infrastructure):** Route group restructure splits app into `(site)` and `(studio)` groups. Dynamic `lang` attribute per locale. Locale utilities, GROQ queries, Portable Text config. `IssueContent` component. Latest issue page and individual issue page with dynamic `generateMetadata`. Sanity client null-safe.
- **Phase 4.5 (SEO Foundation):** JSON-LD schemas. `robots.js` with crawl-delay for AI bots. `sitemap.js` with hreflang alternates. Studio layout with noindex. Shared site chrome in root layout.
- **Phase 5 (Archive, About, Beat Pages):** Archive, about, beats index, beat detail pages. 4 GROQ queries. Sitemap updated. CodeRabbit review addressed.
- **Phase 6 (Verification + Content Seeding):** `scripts/verify.sh` created. Issue #014 seeded with 3 stories (ERROR/OVERRIDE/TERMINATE), Nico's Transmission, 3 stack trace hits. 7 categories, 6 agents, siteSettings, aboutPage all seeded and published. All pages render correctly with real data. ES fallback banner works. Build passes.

## Immediate Next Step

**Phase 7 or beyond.** All core phases complete. Possible next priorities:
1. Test framework setup (unit, integration, e2e)
2. Vercel deployment config
3. Beehiiv integration
4. OG image generation
5. Linter/formatter setup
6. CI pipeline

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- No test framework, linter, or CI pipeline configured yet.
- Beehiiv integration, RSS feeds deferred.
- OG image assets not yet created. Twitter handle (@thecrashlog) not verified.
- `metadataBase` URL set to `https://crashlog.ai` — update if domain changes.
- Sanity MCP `patch_document_from_markdown` uses AI to expand content — use `patch_document_from_json` with manual Portable Text blocks for exact content control.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
