# Agent Notes — The Crash Log

## Current State

- **Branch:** `main` (clean — Nico's Notes fully committed)
- **Build:** `verify.sh` passes (504 tests + 39 static pages)
- **Tests:** 504 unit/component/integration tests (Vitest, 43 files) + 20 e2e tests (Playwright, 5 files) = 524 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 22 total (19 original + ColumnContent, ColumnCard, NicosNotesWidget) + branded 404 page
- **Routes:** All previous routes + `/[locale]/nico` (archive) + `/[locale]/nico/[slug]` (detail) + `/[locale]/nico/feed.xml` (RSS) + `/api/send-column-newsletter`
- **Sanity:** Project `msr24cg4`, dataset `production`. Column schema deployed. 20 published documents, 0 drafts.

## Recently Completed: Nico's Notes — Weekly Column

All 6 phases complete and committed (`8529f2e`). ExecPlan: `docs/plans/active/nicos-notes-column.md` (ready to move to `completed/`).

**What shipped:**
- `sanity/schemas/column.js` — Column document schema (12 fields, field groups)
- `sanity/actions/sendColumnNewsletterAction.jsx` — Studio action for column newsletters
- `lib/columnEmailTemplate.js` — Email template (Nico accent `#e8453e`)
- `app/api/send-column-newsletter/route.js` — Newsletter API endpoint
- `components/ColumnContent.js`, `ColumnCard.js`, `NicosNotesWidget.js` — 3 new components
- `app/(site)/[locale]/nico/` — Archive + detail + RSS routes
- `app/(site)/[locale]/page.js` — Two-column CSS Grid home layout (sidebar + main)
- `components/SiteNav.js` — 5-item nav with "Nico's Notes" / "Notas de Nico"
- `app/sitemap.js` — `/nico` static + dynamic column entries
- `lib/locale.js` — `hasFullTranslation()` parameterized with `{ bodyField }` option
- `lib/queries.js` — 6 new GROQ queries + fetch wrappers
- 96 new Vitest tests + 6 new Playwright e2e tests

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars on Vercel:** `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` — set (same value for both)
- **Beehiiv:** `locale` custom field created, EN/ES audience segments created
- **Sanity schema:** Column schema deployed to cloud

## Pending

- [ ] Deploy commit `8529f2e` to Vercel (push to remote)
- [ ] Manual end-to-end test: Studio action → Beehiiv draft creation (Issue #001)
- [ ] Manual end-to-end test: Column Studio action → Beehiiv draft creation
- [ ] Activate Beehiiv Recommendations widget when available
- [ ] Move ExecPlan to `docs/plans/completed/`
- [ ] Seed first column content in Sanity

## Known Issues / Deferred Items

- `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` exposes newsletter auth secret to client bundle — both issue and column actions use this pattern. Consider server-side session validation in a future security pass.
- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- OG images use Inter font instead of Space Grotesk — ImageResponse edge runtime limits font loading.
- No rate limiting on API routes — Vercel baseline DDoS protection covers it.
- 5-item nav on mobile — verify nav wrapping doesn't break at small widths after deploy.
- Google Fonts `<link>` in email HTML may not render in most email clients — fallback fonts will display.
- Server-side idempotency for newsletter sending not implemented — Studio action warns but doesn't prevent duplicate sends.
