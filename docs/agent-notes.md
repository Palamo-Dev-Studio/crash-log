# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (549 tests + 41 static pages)
- **Tests:** 549 unit/component/integration tests (Vitest, 45 files) + 20 e2e tests (Playwright, 5 files) = 569 total
- **Components:** 24 total (22 previous + SupportContent) + branded 404 page
- **Routes:** All previous routes + `/[locale]/support` (dedicated donation page)
- **Sanity:** Project `msr24cg4`, dataset `production`. All schemas deployed. 21 published documents, 0 drafts.

## Recently Completed

**Support Page + Recurring Donations** (this session):

- `/api/donate` now accepts `frequency` param: `"once"` (default) or `"monthly"`
- Monthly creates Stripe Checkout `subscription` session with `recurring: { interval: "month" }`
- Backward-compatible — existing calls without frequency still work
- `DonateCTA` component: added one-time/monthly toggle with `aria-pressed` accessibility
- `SupportContent` component: full-page "Feed the Bots" landing with preset amounts ($5/$10/$25), custom input, frequency toggle, mission copy, bilingual
- `app/(site)/[locale]/support/page.js` — dedicated support page route with full SEO metadata
- Header: green "Fund"/"Apoya" button (`#30d158`) linking to `/[locale]/support`
- Sitemap updated with `/support` entries
- Accessibility: focus-visible styles on FUND button and custom amount input (CodeRabbit review)
- `.prettierignore` updated to exclude `.claude/` directory
- 38 new tests (511 → 549)

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars on Vercel:** `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` — set (same value for both)
- **Beehiiv:** `locale` custom field created, EN/ES audience segments created
- **Sanity schema:** All schemas deployed (including column + updated stackTraceHit)

## Immediate Next Step

- Push to remote / deploy to Vercel
- Verify support page renders correctly on live site
- Test Stripe monthly subscription flow end-to-end

## Pending

- [ ] Push latest commits to remote / deploy to Vercel
- [ ] Manual end-to-end test: Stripe monthly subscription (support page)
- [ ] Manual end-to-end test: Issue Studio action → Beehiiv draft creation
- [ ] Manual end-to-end test: Column Studio action → Beehiiv draft creation
- [ ] Activate Beehiiv Recommendations widget when available
- [ ] Move Nico's Notes ExecPlan to `docs/plans/completed/`
- [ ] Seed first column content in Sanity
- [ ] Push Spanish role translations to agent documents in Sanity (bio.es done, model.es set for Hector, role.es still missing)

## Known Issues / Deferred Items

- `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` exposes newsletter auth secret to client bundle — both issue and column actions use this pattern. Consider server-side session validation in a future security pass.
- `FallbackAbout` component + `FALLBACK_MASTHEAD` array still exist in code — now redundant since Sanity has full ES content. Can be removed in a cleanup pass.
- Agent `role.es` fields not yet populated in Sanity — Spanish roles still come from `FallbackAbout` or are empty in `SanityAbout`.
- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- OG images use Inter font instead of Space Grotesk — ImageResponse edge runtime limits font loading.
- No rate limiting on API routes — Vercel baseline DDoS protection covers it.
- 5-item nav on mobile — verify nav wrapping doesn't break at small widths after deploy.
- Server-side idempotency for newsletter sending not implemented — Studio action warns but doesn't prevent duplicate sends.
- OpenClaw uploader sets `status: "draft"` on issue documents — must manually set to `"published"` after publishing in Sanity. Consider automating or documenting this for OpenClaw.
