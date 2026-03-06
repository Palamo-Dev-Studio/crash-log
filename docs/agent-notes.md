# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Last commit:** `08bdb07` — feat: UI polish, severity refactor, and Issue #015 prep
- **Build:** `verify.sh` passes (295 tests + 34 static pages)
- **Tests:** 295 unit/component/integration tests (Vitest, 29 files) + 14 e2e tests (Playwright) = 309 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard + SubscribeForm + ThankYouContent + BeehiivRecommendations)
- **Layout:** `--max-width: 960px`, `--content-padding: 28px`
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/[locale]/subscribe/thank-you`, `/[locale]/feed.xml`, `/api/subscribe`, `/api/donate`, `/studio`, `/robots.txt`, `/sitemap.xml`
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 19 published documents + 4 drafts (Issue #015 + 3 stories).

## Recent Completed Work

- UI polish: Header/headshots enlarged 50%, layout widened to 960px
- SiteNav active state fix (client component with `useSelectedLayoutSegment`)
- Email link fix in English About page (CSS + Sanity content)
- Spanish formality fix ("Suscríbete")
- Beats page hides empty categories
- Severity system refactored to free-text with position-based color cycling
- Issue #015 seeded as drafts in Sanity (3 stories + issue, full EN/ES)
- Sanity Studio: added `basePath: "/studio"` to sanity.config.js (fixes "Tool not found: studio" error)
- Sanity CORS: added `http://localhost:3001` for local Studio development
- Removed unused `getStoryColorKey` import from BeatStoryCard (CodeRabbit review)

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Beehiiv:** Credentials in `.env.local` and Vercel env vars
- **Stripe:** `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_DONATIONS_ENABLED=true` set in `.env.local` and Vercel env vars. Live key active in production.

## Immediate Next Steps

1. **Push to deploy** latest commits to Vercel
2. **Hector reviews Issue #015 in Studio** — edit stories, Nico's Transmission, Stack Trace, then publish (stories first, then issue)
3. **Populate Spanish content** in Sanity for Issue #014 (editorial task for Gabo)
4. **Activate Beehiiv Recommendations:** When available, set `NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL`

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- OG images use Inter font instead of Space Grotesk — ImageResponse edge runtime limits font loading.
- No rate limiting on `/api/subscribe` or `/api/donate` — Vercel baseline DDoS protection covers it.
- No bot protection (honeypot/CAPTCHA) on forms — add if spam becomes an issue.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, test output only.
