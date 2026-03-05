# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `scripts/verify.sh` passes cleanly (296 tests + 33 static pages, Next.js 16.1.6 Turbopack)
- **Tests:** 296 unit/component/integration tests (Vitest, 29 files) + 14 e2e tests (Playwright) = 310 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard + SubscribeForm + ThankYouContent + BeehiivRecommendations)
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/[locale]/subscribe/thank-you`, `/[locale]/feed.xml`, `/api/subscribe`, `/api/donate`, `/studio`, `/robots.txt`, `/sitemap.xml`
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
  - `ThankYouContent` + `BeehiivRecommendations` components, thank-you route, SubscribeForm redirect.
- **Stripe Checkout Donation ("Feed the Bots"):**
  - `POST /api/donate` route: creates Stripe Checkout Sessions with inline `price_data`, validates amount (min $3 / max $999). Base URL derived from `request.url` (works in dev and production).
  - `DonateCTA` converted to client component: amount input ($5 default), loading/error states, `Suspense` boundary for `useSearchParams()`.
  - Thank-you toast: fixed-position overlay that slides in from top, covers the featured image area, auto-dismisses after 10 seconds (or manual close). Cleans `?donated=true` from URL via `router.replace`.
  - Tax disclaimer (EN/ES): "Contributions are not tax-deductible."
  - Env gating: `NEXT_PUBLIC_DONATIONS_ENABLED` (replaces old `NEXT_PUBLIC_STRIPE_DONATE_URL`).
  - 41 new tests: 16 donate API integration + 25 DonateCTA component.
  - `next/navigation` mock updated with `useSearchParams` + `setMockSearchParams`.
  - Stripe credentials set in `.env.local` and Vercel. Live-tested end-to-end with Stripe test key.

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` added with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Beehiiv:** Credentials in `.env.local` and Vercel env vars
- **Stripe:** `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_DONATIONS_ENABLED=true` set in `.env.local` and Vercel env vars. Live key active in production.

## What's Done (continued)

- **Logo & Agent Headshot Integration:**
  - Favicon: `app/icon.png` (180×180) + `app/apple-icon.png` from circle logo. Old `favicon.ico` deleted.
  - Header: logo image alongside wordmark text in flex layout (responsive 36→28px on mobile).
  - Agent headshots: 6 PNG files in `assets/headshots/`, upload script at `scripts/upload-avatars.mjs`.
  - AgentCard: conditional avatar rendering (Sanity image → `next/image`, fallback to colored dot).
  - `next.config.mjs`: `images.remotePatterns` for `cdn.sanity.io` (required for Sanity-hosted images).
  - About page passes `image={agent.avatar}` to AgentCard in SanityAbout section.
  - **Headshots NOT YET uploaded to Sanity** — requires `SANITY_API_TOKEN` in `.env.local`. Run `node scripts/upload-avatars.mjs` once token is available.

## Immediate Next Step

- **Upload agent headshots:** Generate a Sanity write token from manage.sanity.io, add as `SANITY_API_TOKEN` to `.env.local`, run `node scripts/upload-avatars.mjs`.
- **Spanish Sanity content:** Gabo needs to populate `.es` fields for Issue #014 in Sanity Studio.
- **Activate Beehiiv Recommendations:** When available, set `NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL`.

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Twitter handle (@crashLogNews) verified on X.
- `metadataBase` URL set to `https://crashlog.ai` — update if domain changes.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, only appears in test output.
- OG images use Inter font instead of Space Grotesk — ImageResponse edge runtime limits font loading.
- No rate limiting on `/api/subscribe` or `/api/donate` — Vercel baseline DDoS protection covers it. Add throttling if abuse occurs.
- No bot protection (honeypot/CAPTCHA) on forms — add if spam becomes an issue.
