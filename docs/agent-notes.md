# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `scripts/verify.sh` passes cleanly (220 tests + 29 static pages, Next.js 16.1.6 Turbopack)
- **Tests:** 220 unit/component/integration tests (Vitest, 26 files) + 14 e2e tests (Playwright) = 234 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 17 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard + SubscribeForm)
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/[locale]/feed.xml`, `/api/subscribe`, `/studio`, `/robots.txt`, `/sitemap.xml`
- **Dynamic routes:** `/[locale]/opengraph-image`, `/[locale]/twitter-image`, `/[locale]/issue/[slug]/opengraph-image`, `/[locale]/issue/[slug]/twitter-image`
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 19 published documents.

## What's Done

- **Phases 1–8:** See TODO.md for full details. All core phases complete.
- **Phase 9 (Beehiiv + Social Media):**
  - **Social handles fixed:** Twitter `@thecrashlog` → `@crashLogNews` in metadata and JSON-LD. Instagram added to `sameAs`.
  - **Footer social links:** X and Instagram text links (middot-separated) in Footer component. 2 new tests.
  - **Subscribe API route:** `POST /api/subscribe` proxies to Beehiiv Subscriptions API. Email validation, 409 dedup handling, error normalization. 9 integration tests.
  - **SubscribeForm component:** Client component with inline expansion UX (idle → expanded → loading → success/error). Bilingual labels (EN/ES). 16 unit tests.
  - **Header updated:** Placeholder `<button>Subscribe</button>` replaced with `<SubscribeForm>`. Subscribe styles moved to SubscribeForm.module.css.
  - **Review fixes:** Server-side email `trim()` before validation. Email input `aria-label` localized for Spanish.
  - **Live tested:** Beehiiv integration confirmed working with real credentials. Two test subscribers created.

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` added with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Beehiiv:** Credentials in `.env.local` (must be added to Vercel env vars for production)

## Immediate Next Step

- **Deploy to Vercel:** Add `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` to Vercel environment variables, then push to deploy.
- **Run Prettier autofix on docs/reference JSX files** if needed (currently in ESLint ignore).

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Twitter handle (@crashLogNews) not yet verified on X — external action for Hector.
- `metadataBase` URL set to `https://crashlog.ai` — update if domain changes.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, only appears in test output.
- OG images use Inter font (fetched from Google CDN) instead of Space Grotesk (project display font) — ImageResponse edge runtime limits font loading options.
- Beehiiv returns 200 (not 409) for duplicate subscriptions — users see "You're in!" instead of "Already subscribed!" for re-subs. Acceptable UX.
- No rate limiting on `/api/subscribe` — Vercel baseline DDoS protection covers it. Add IP-based throttling if abuse occurs.
- No bot protection (honeypot/CAPTCHA) on subscribe form — add if spam becomes an issue.
- Beehiiv recommendation modal redirect (post-subscribe "thank you" page) deferred for future iteration.
