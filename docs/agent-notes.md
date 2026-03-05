# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `scripts/verify.sh` passes cleanly (296 tests + 33 static pages, Next.js 16.1.6 Turbopack)
- **Tests:** 296 unit/component/integration tests (Vitest, 29 files) + 14 e2e tests (Playwright) = 310 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard + SubscribeForm + ThankYouContent + BeehiivRecommendations)
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/[locale]/subscribe/thank-you`, `/[locale]/feed.xml`, `/api/subscribe`, `/api/donate`, `/studio`, `/robots.txt`, `/sitemap.xml`
- **Dynamic routes:** `/[locale]/opengraph-image`, `/[locale]/twitter-image`, `/[locale]/issue/[slug]/opengraph-image`, `/[locale]/issue/[slug]/twitter-image`
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 19 published documents. All 6 agents have avatar images.

## What's Done

- **Phases 1–8:** See TODO.md for full details. All core phases complete.
- **Phase 9 (Beehiiv + Social Media):**
  - Social handles fixed, Footer social links, Subscribe API route, SubscribeForm component, Header updated.
  - Live-tested Beehiiv integration. Credentials in `.env.local` and Vercel env vars.
- **Phase 10 (Spanish Locale UI Chrome):**
  - 7 components localized with inline LABELS constants. Locale prop threaded through callers.
  - SiteNav Spanish labels: Último, Archivo, Temas, Sobre.
- **Post-Subscribe Thank-You Page:**
  - `ThankYouContent` + `BeehiivRecommendations` components, thank-you route, SubscribeForm redirect.
- **Stripe Checkout Donation ("Feed the Bots"):**
  - `POST /api/donate` route, `DonateCTA` client component, thank-you toast, tax disclaimer, env gating.
  - Stripe credentials in `.env.local` and Vercel. Live key active in production.
- **Logo & Agent Headshot Integration:**
  - Favicon: `app/icon.png` (180×180) + `app/apple-icon.png`. Old `favicon.ico` deleted.
  - Header: logo image (36×36, 28px mobile) alongside wordmark text in flex layout.
  - Agent headshots: 6 PNGs uploaded to Sanity via `scripts/upload-avatars.mjs`. All 6 agents have avatars.
  - AgentCard: avatar 120×120 (88px mobile), conditional rendering (Sanity image or colored dot fallback).
  - AgentCard typography: name 22px, role 16px, tag 11px `--text-tertiary`.
  - `next.config.mjs`: `images.remotePatterns` for `cdn.sanity.io`.
  - About page: Spanish locale uses `FallbackAbout` with hardcoded bilingual content + Sanity avatars.
  - Fallback masthead bios and roles fully localized (EN/ES).
  - Contact email updated to `info@palamostudio.com` (code + Sanity).
  - Duplicate email in SanityAbout contact section removed.

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` added with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Beehiiv:** Credentials in `.env.local` and Vercel env vars
- **Stripe:** `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_DONATIONS_ENABLED=true` set in `.env.local` and Vercel env vars. Live key active in production.

## Immediate Next Step

- **Push to deploy** logo, headshots, and about page fixes to Vercel.
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
