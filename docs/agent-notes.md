# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (511 tests + 39 static pages)
- **Tests:** 511 unit/component/integration tests (Vitest, 43 files) + 20 e2e tests (Playwright, 5 files) = 531 total
- **Components:** 22 total (19 original + ColumnContent, ColumnCard, NicosNotesWidget) + branded 404 page
- **Routes:** All previous routes + `/[locale]/nico` (archive) + `/[locale]/nico/[slug]` (detail) + `/[locale]/nico/feed.xml` (RSS) + `/api/send-column-newsletter`
- **Sanity:** Project `msr24cg4`, dataset `production`. All schemas deployed. 21 published documents (added issue #002), 0 drafts.

## Recently Completed

**Stack Trace Schema Upgrade** (this session):

- `stackTraceHit.text`: `localizedText` → `localizedBlockContent` (rich text with hyperlinks in Studio)
- `sourceUrl` + `sourceOutlet` → `sources[]` array of `sourceLink` (multiple sources per hit)
- StackTrace component redesigned: body text first, sources underneath as "Source: Outlet1 · Outlet2"
- Email template updated: Portable Text to HTML for stack trace, sources array, localized "Source:"/"Fuente:" labels
- GROQ projection updated, IssueContent transform updated
- Schema deployed to Sanity cloud, both issues' stack trace data migrated
- 4 new tests (507 → 511)

**Issue #002 Published** (this session):

- "Deployed. Unaccountable. Everywhere." — 4 stories, 3 stack trace hits (all bilingual)
- Fixed weak `drafts.*` story refs → direct published refs before publishing
- Set `status: "published"` field (was still "draft" from OpenClaw uploader)
- Beehiiv draft creation test pending (next step)

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars on Vercel:** `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` — set (same value for both)
- **Beehiiv:** `locale` custom field created, EN/ES audience segments created
- **Sanity schema:** All schemas deployed (including column + updated stackTraceHit)

## Immediate Next Step

- Deploy latest code to Vercel (push to remote)
- Test Beehiiv draft creation for issue #002 (via Studio action or API call)
- Verify stack trace rendering on live site for both issues

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
- OpenClaw uploader sets `status: "draft"` on issue documents — must manually set to `"published"` after publishing in Sanity. Consider automating or documenting this for OpenClaw.
