# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (507 tests + 39 static pages)
- **Tests:** 507 unit/component/integration tests (Vitest, 43 files) + 20 e2e tests (Playwright, 5 files) = 527 total
- **Components:** 22 total (19 original + ColumnContent, ColumnCard, NicosNotesWidget) + branded 404 page
- **Routes:** All previous routes + `/[locale]/nico` (archive) + `/[locale]/nico/[slug]` (detail) + `/[locale]/nico/feed.xml` (RSS) + `/api/send-column-newsletter`
- **Sanity:** Project `msr24cg4`, dataset `production`. All schemas deployed. 20 published documents, 0 drafts.

## Recently Completed

**Nico's Notes — Weekly Column** (all 6 phases, commit `8529f2e`):
Schema, Studio action, email template, API route, 3 components, archive/detail/RSS routes, two-column home layout, nav update, sitemap entries, 6 Playwright e2e tests. ExecPlan: `docs/plans/active/nicos-notes-column.md` (ready to move to `completed/`).

**Sanity Content Localization** (commits `0898a1b` + prior session):

- Spanish bios pushed to all 6 agent documents and published
- Spanish Portable Text pushed to aboutPage (introParagraph, workflowSection, contactCTA) and published
- Spanish About page now renders via `SanityAbout` path (Sanity content + avatars), no longer uses `FallbackAbout`
- About page CSS: removed `max-width: 640px` from intro/workflow/contact sections — text now fills full content width
- Column email subject localized for Spanish ("Notas de Nico" instead of hardcoded English)

**Masthead Model/Platform Labels** (this session):

- Agent `model` field changed from `string` to `localizedString` in schema
- AgentCard resolves localized model via `t()` with backward compat for plain strings
- All 6 agents populated in Sanity: Nico (Sonnet 4.6), Scoop/Root/Gabo/Lupe (GPT-5.3-Codex), Hector (Coffee 20 oz / Cafecito 20 oz)
- About page section headings centered, "The Masthead" → "Masthead"
- Schema deployed, all documents published, 3 new tests

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars on Vercel:** `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` — set (same value for both)
- **Beehiiv:** `locale` custom field created, EN/ES audience segments created
- **Sanity schema:** All schemas deployed (including column)

## Pending

- [ ] Push latest commits to remote / deploy to Vercel
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
