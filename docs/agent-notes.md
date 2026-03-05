# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `scripts/verify.sh` passes cleanly (253 tests + 32 static pages, Next.js 16.1.6 Turbopack)
- **Tests:** 253 unit/component/integration tests (Vitest, 28 files) + 14 e2e tests (Playwright) = 267 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard + SubscribeForm + ThankYouContent + BeehiivRecommendations)
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/[locale]/subscribe/thank-you`, `/[locale]/feed.xml`, `/api/subscribe`, `/studio`, `/robots.txt`, `/sitemap.xml`
- **Dynamic routes:** `/[locale]/opengraph-image`, `/[locale]/twitter-image`, `/[locale]/issue/[slug]/opengraph-image`, `/[locale]/issue/[slug]/twitter-image`
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 19 published documents.

## What's Done

- **Phases 1–8:** See TODO.md for full details. All core phases complete.
- **Phase 9 (Beehiiv + Social Media):**
  - Social handles fixed, Footer social links, Subscribe API route, SubscribeForm component, Header updated.
  - Live-tested Beehiiv integration. Credentials in `.env.local` and Vercel env vars.
- **Phase 10 (Spanish Locale UI Chrome):**
  - 7 components localized with inline LABELS constants. Locale prop threaded through callers.
- **Post-Subscribe Thank-You Page:**
  - `ThankYouContent` component: bilingual confirmation page (badge, heading, description, CTA link to home).
  - `BeehiivRecommendations` component: env-gated widget slot (renders nothing until `NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL` is set).
  - `app/(site)/[locale]/subscribe/thank-you/page.js`: noindex transactional page.
  - `SubscribeForm` modified: redirects to thank-you page after 1.5s on new-subscriber success. Already-subscribed users see inline message only (no redirect).
  - 23 new tests: ThankYouContent (12), BeehiivRecommendations (6), SubscribeForm redirect (3), thank-you-page metadata (2).

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` added with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Beehiiv:** Credentials in `.env.local` and Vercel env vars

## Immediate Next Step

- **Push to deploy** the thank-you page to Vercel.
- **Spanish Sanity content:** Gabo needs to populate `.es` fields for Issue #014 stories, titles, and Nico's Transmission in Sanity Studio.
- **Activate Beehiiv Recommendations:** When Beehiiv makes the widget available, set `NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL` and add the embed `<Script>` to `BeehiivRecommendations.js`.

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Twitter handle (@crashLogNews) verified on X.
- `metadataBase` URL set to `https://crashlog.ai` — update if domain changes.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, only appears in test output.
- OG images use Inter font (fetched from Google CDN) instead of Space Grotesk (project display font) — ImageResponse edge runtime limits font loading options.
- Beehiiv returns 200 (not 409) for duplicate subscriptions — users see "You're in!" instead of "Already subscribed!" for re-subs. Acceptable UX.
- No rate limiting on `/api/subscribe` — Vercel baseline DDoS protection covers it. Add IP-based throttling if abuse occurs.
- No bot protection (honeypot/CAPTCHA) on subscribe form — add if spam becomes an issue.
