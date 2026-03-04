# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `scripts/verify.sh` passes cleanly (195 tests + 29 static pages, Next.js 16.1.6 Turbopack)
- **Tests:** 195 unit/component/integration tests (Vitest, 23 files) + 14 e2e tests (Playwright) = 209 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 16 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard)
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/[locale]/feed.xml`, `/studio`, `/robots.txt`, `/sitemap.xml`
- **Dynamic routes:** `/[locale]/opengraph-image`, `/[locale]/twitter-image`, `/[locale]/issue/[slug]/opengraph-image`, `/[locale]/issue/[slug]/twitter-image`
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 19 published documents.

## What's Done

- **Phases 1–7:** See TODO.md for full details. All core phases complete.
- **Phase 8 (Developer Tooling + Features):**
  - **ESLint 9 + Prettier:** Flat config with `eslint-config-next/core-web-vitals` + `eslint-config-prettier`. Prettier matches existing code style (double quotes, semis, 2-space, es5 trailing commas). `npm run lint` / `npm run format:check` added. Entire codebase formatted.
  - **CI pipeline:** GitHub Actions at `.github/workflows/ci.yml`. Triggers on push/PR to main. Runs tests + build with Node 20.
  - **RSS feeds:** Locale-specific feeds at `/en/feed.xml` and `/es/feed.xml`. Route handler with localized titles, XML escaping, atom self-link. GROQ query `getIssuesForFeed()` in `lib/queries.js`. 8 integration tests.
  - **OG images:** Dynamic Open Graph + Twitter card images using `next/og` ImageResponse. Site-level (brand card) + per-issue (title, number, date). Dark theme with red accent bar, Inter font loaded from Google CDN. Twitter images re-export from OG files.
  - **Social profile URLs:** Added `sameAs` array to JSON-LD WebSite schema with Twitter URL. RSS feed discovery `<link>` added to site metadata alternates.
  - **verify.sh updated:** Now runs lint + format check before tests + build.

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` added with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`

## Immediate Next Step

- **Beehiiv integration:** Hector deciding on embed vs API approach. Needs publication URL or API key.
- **Twitter handle verification:** External action for Hector (@thecrashlog).
- **Run Prettier autofix on docs/reference JSX files** if needed (currently in ESLint ignore).

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Beehiiv integration deferred pending Hector's decision.
- Twitter handle (@thecrashlog) not yet verified on X.
- `metadataBase` URL set to `https://crashlog.ai` — update if domain changes.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, only appears in test output.
- OG images use Inter font (fetched from Google CDN) instead of Space Grotesk (project display font) — ImageResponse edge runtime limits font loading options.
