# Agent Notes — The Crash Log

## Current State

- **Branch:** `main` (uncommitted changes from this session)
- **Build:** `npm test` passes (295 tests), `npm run build` passes
- **Tests:** 295 unit/component/integration tests (Vitest, 29 files) + 14 e2e tests (Playwright) = 309 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard + SubscribeForm + ThankYouContent + BeehiivRecommendations)
- **Layout:** `--max-width: 960px` (widened from 720px), `--content-padding: 28px`
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/[locale]/subscribe/thank-you`, `/[locale]/feed.xml`, `/api/subscribe`, `/api/donate`, `/studio`, `/robots.txt`, `/sitemap.xml`
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 19 published documents + 4 drafts (Issue #015 + 3 stories).

## This Session's Changes (uncommitted)

- **Header 50% bigger:** Logo 36→54px, wordmark 28→42px
- **Agent headshots 50% bigger:** Avatars 120→180px (mobile 88→132px)
- **Layout widened:** `--max-width` 720→960px (was too narrow, felt like a thin stream)
- **SiteNav active state fix:** Converted to client component using `useSelectedLayoutSegment()` — previously always highlighted "Latest" because `activeSegment` prop was never passed
- **Email link fix (English About):** Added `.contact a` styles so Portable Text links are visible; patched Sanity `contactCTA.en` to wrap email in `mailto:` link
- **Spanish formality fix:** "Suscribirse" → "Suscríbete" (informal imperative) in SubscribeForm
- **Severity system refactored:** Removed fixed enum (ERROR, OVERRIDE, etc.), severity is now free-text. Colors cycle by story position through palette: error→breach→override→warning→critical. New `lib/storyColors.js` utility. SeverityBadge/StoryBlock accept `colorKey` prop.
- **Beats page filter:** Categories with 0 stories hidden from beats index
- **Issue #015 seeded in Sanity (drafts):** "Trust Is the Product Now" — 3 stories (OVERRIDE, PATCH_FAILED, DEPRECATED) + Nico's Transmission + 3 Stack Trace hits, full EN/ES bilingual content

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` added with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Beehiiv:** Credentials in `.env.local` and Vercel env vars
- **Stripe:** `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_DONATIONS_ENABLED=true` set in `.env.local` and Vercel env vars. Live key active in production.

## Immediate Next Steps

1. **Hector reviews Issue #015 in Studio** — edit stories, Nico's Transmission, Stack Trace, then publish (stories first, then issue)
2. **Commit + deploy** this session's code changes to Vercel
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
