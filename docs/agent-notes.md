# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (549 tests + 41 static pages)
- **Tests:** 549 unit/component/integration tests (Vitest, 45 files) + 20 e2e tests (Playwright, 5 files) = 569 total
- **Components:** 24 total (22 previous + SupportContent) + branded 404 page
- **Routes:** All previous routes + `/[locale]/support` (dedicated donation page)
- **Sanity:** Project `msr24cg4`, dataset `production`. All schemas deployed. 4 issues, 15 stories, 6 agents, 7 categories published. 1 draft (Nico's Notes column `nicos-notes-2026-03-15`).

## Recently Completed

**Sanity Data Recovery** (2026-03-17):

- A bad upsert (likely off-by-one ID mapping bug) wrote Issue #3's content into the `crash-log-004` document ID and deleted `crash-log-003` entirely
- Recovered Issue #3: recreated `crash-log-003` + 3 stories (`crash-log-003-story-01/02/03`) using content preserved in the stale published `crash-log-004`
- Published Issue #4: resolved circular draft-reference dependency (draft issue → draft stories) by temporarily removing story refs, publishing stories, re-adding refs with published IDs, then publishing the issue
- All 4 issues now correctly published with proper IDs and content

**Agent Model Updates** (prior session):

- Nico von Bot: Sonnet 4.6 → Opus 4.6 (model field, bio EN/ES)
- Sub-agents (Scoop, Root, Gabo, Lupe): GPT-5.3-Codex → GPT-5.4-Codex
- Updated in: Sanity agent docs (5), aboutPage Portable Text (intro + workflow, EN/ES), fallback masthead code, schema description
- All 6 Sanity documents published
- 549 tests still passing

**Support Page + Recurring Donations** (prior session):

- `/api/donate` now accepts `frequency` param: `"once"` (default) or `"monthly"`
- Monthly creates Stripe Checkout `subscription` session with `recurring: { interval: "month" }`
- `SupportContent` component: full-page "Feed the Bots" landing with preset amounts, frequency toggle, bilingual
- Header: green "Fund"/"Apoya" button linking to `/[locale]/support`
- 38 new tests (511 → 549)

**Stack Trace Rich Text + Issue #002** (prior session):

- `stackTraceHit.text`: `localizedText` → `localizedBlockContent` (rich text with hyperlinks in Studio)
- `sourceUrl` + `sourceOutlet` → `sources[]` array of `sourceLink` (multiple sources per hit)
- StackTrace component redesigned: body text first, sources underneath as "Source: Outlet1 · Outlet2"
- Email template updated: Portable Text to HTML for stack trace, sources array
- Issue #002 "Deployed. Unaccountable. Everywhere." published — 4 stories, 3 stack trace hits
- Beehiiv draft creation tested — blocked by Enterprise plan requirement

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars on Vercel:** `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` — set (same value for both)
- **Beehiiv:** `locale` custom field created, EN/ES audience segments created
- **Sanity schema:** All schemas deployed (including column + updated stackTraceHit)

## Immediate Next Step

- Review Issue #4 content on site (now published)
- Publish Nico's Notes column draft (`nicos-notes-2026-03-15`) when ready
- Deploy latest to Vercel

## Pending

- [ ] Push latest commits to remote / deploy to Vercel
- [ ] Manual end-to-end test: Stripe monthly subscription (support page)
- [x] ~~Manual end-to-end test: Issue Studio action → Beehiiv draft creation~~ (blocked: Beehiiv requires Enterprise plan for Post API)
- [x] ~~Manual end-to-end test: Column Studio action → Beehiiv draft creation~~ (same blocker)
- [ ] Activate Beehiiv Recommendations widget when available
- [ ] Move Nico's Notes ExecPlan to `docs/plans/completed/`
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
- OpenClaw uploader sets `status: "draft"` on issue documents — must manually set to `"published"` after publishing in Sanity. Story refs use `drafts.*` prefix — must fix to direct refs before publishing. Consider automating or documenting this for OpenClaw.
- OpenClaw upsert had an ID mapping bug (off-by-one) that wrote Issue #3 content to `crash-log-004` and deleted `crash-log-003`. Root cause: likely deriving `_id` from a computed value rather than preserving existing IDs, combined with `createOrReplace`. Recommendations shared with Hector to pass to the agent.
- Beehiiv Post API requires Enterprise plan (`SEND_API_NOT_ENTERPRISE_PLAN`). Code is ready, manual copy-paste for newsletters until plan is upgraded.
