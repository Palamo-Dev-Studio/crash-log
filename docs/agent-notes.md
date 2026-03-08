# Agent Notes — The Crash Log

## Current State

- **Branch:** `main` (uncommitted — Nico's Notes Phases 1-5 complete, ready for Phase 6)
- **Build:** `verify.sh` passes (504 tests + 39 static pages)
- **Tests:** 504 unit/component/integration tests (Vitest, 43 files) + 14 e2e tests (Playwright) = 518 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 22 total (19 original + ColumnContent, ColumnCard, NicosNotesWidget) + branded 404 page
- **Routes:** All previous routes + `/[locale]/nico` (archive) + `/[locale]/nico/[slug]` (detail) + `/[locale]/nico/feed.xml` (RSS) + `/api/send-column-newsletter`
- **Sanity:** Project `msr24cg4`, dataset `production`. Column schema NOT yet deployed (local only). 20 published documents, 0 drafts.

## In Progress: Nico's Notes — Weekly Column

**ExecPlan:** `docs/plans/active/nicos-notes-column.md`

### Completed (Phases 1-5)

**Phase 1 — Schema & Studio:**

- `sanity/schemas/column.js` — Column document schema (12 fields: columnNumber, slug, publishDate, status, coverImage, coverImageAlt, coverImagePrompt, title, subtitle, body, metaDescription, beehiivStatus, beehiivPostIds; field groups for EN/ES/Meta tabs)
- `sanity/actions/sendColumnNewsletterAction.jsx` — Studio action for column newsletters (POSTs to `/api/send-column-newsletter`)
- `sanity.config.js` — Column type + action registered
- 12 unit tests for action

**Phase 2 — Locale + Data Layer:**

- `lib/locale.js` — `hasFullTranslation()` parameterized with `{ bodyField }` option (default: `"nicosTransmission"`, column uses `"body"`)
- `lib/queries.js` — 6 new GROQ queries + fetch wrappers: `getLatestColumn`, `getColumnBySlug`, `getAllColumnSlugs`, `getAllColumnsForArchive`, `getColumnsForFeed`, `getAllColumnsSummary`
- 3 new locale tests, 17 new query tests

**Phase 3 — Column Email Template + API:**

- `lib/columnEmailTemplate.js` — `buildColumnEmailHtml()` + `buildColumnEmailSubject()` (simpler than issue template — no stories/stackTrace, column meta uses Nico accent `#e8453e`, signature `— Nico`)
- `app/api/send-column-newsletter/route.js` — Separate POST handler (auth, EN+ES drafts via `hasFullTranslation(column, "es", { bodyField: "body" })`)
- 15 email template tests, 11 API integration tests

**Phase 4 — Routes + Components:**

- `components/ColumnContent.js` + `.module.css` — Column detail renderer (cover image, header with prefix/number/date, body via PortableText, `— Nico` signature, FallbackBanner for ES)
- `components/ColumnCard.js` + `.module.css` — Archive listing card (red accent hover, links to `/[locale]/nico/[slug]`)
- `components/NicosNotesWidget.js` + `.module.css` — Home page sidebar widget (red top border, title link, excerpt from body, Read + See all links, returns null when no column)
- `app/(site)/[locale]/nico/[slug]/page.js` — Column detail page (generateStaticParams, generateMetadata, Article + BreadcrumbList JSON-LD, 3-level breadcrumb: Home > Nico's Notes > Title)
- `app/(site)/[locale]/nico/page.js` — Column archive page
- `app/(site)/[locale]/nico/feed.xml/route.js` — Column RSS feed
- 13 ColumnContent, 8 ColumnCard, 10 Widget, 6 RSS tests

**Phase 5 — Home Page Layout + Navigation + SEO:**

- `app/globals.css` — Added `--max-width-wide: 1200px` token
- `app/(site)/[locale]/page.js` — Two-column grid layout, parallel `Promise.all` fetch of issue + column; graceful single-column when no column exists
- `app/(site)/[locale]/home.module.css` — CSS Grid (`1fr 320px` sidebar), mobile stacks at 768px with sidebar on top, sticky sidebar
- `components/SiteNav.js` — Added "Nico's Notes" / "Notas de Nico" nav item (5 items total)
- `app/sitemap.js` — Added `/nico` to static pages + dynamic column entries from `getAllColumnsSummary()`
- Updated SiteNav tests (9 → 10 tests)

### Remaining (Phase 6)

- [ ] E2E Playwright tests for column pages (column page loads, archive lists, locale switching)
- [ ] Deploy Sanity schema: `npx sanity@latest schema deploy`
- [ ] Run `scripts/verify.sh` — must pass clean (already confirmed)
- [ ] Commit all changes
- [ ] Update tracking docs (agent-notes, TODO, MEMORY)
- [ ] Update CLAUDE.md if architecture section needs column references

## Recent Completed Work

- **Nico's Notes column** — Phases 1-5 complete (schema, locale, email, API, routes, components, home page, nav, sitemap)
- **Beehiiv newsletter sending system** — 6 phases complete (subscribe locale, PT-to-HTML, email template, send API, Studio action, idempotency tracking)
- **Revalidation pipeline** — Sanity webhook → `/api/revalidate` → edge cache purge (live in production)

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars on Vercel:** `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` — set (same value for both)
- **Beehiiv:** `locale` custom field created, EN/ES audience segments created
- **Sanity schema:** Column schema NOT yet deployed — must run `npx sanity@latest schema deploy` before production use

## Pending

- [ ] Deploy column schema to Sanity cloud
- [ ] Manual end-to-end test: Studio action → Beehiiv draft creation (Issue #001)
- [ ] Manual end-to-end test: Column Studio action → Beehiiv draft creation
- [ ] Activate Beehiiv Recommendations widget when available

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- OG images use Inter font instead of Space Grotesk — ImageResponse edge runtime limits font loading.
- No rate limiting on API routes — Vercel baseline DDoS protection covers it.
- No bot protection (honeypot/CAPTCHA) on forms — add if spam becomes an issue.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, test output only.
- Google Fonts `<link>` in email HTML may not render in most email clients — fallback fonts will display.
- `hasFullTranslation()` for issues checks title + nicosTransmission; ES newsletter may contain EN-fallback story content.
- Server-side idempotency for newsletter sending not implemented — Studio action warns but doesn't prevent duplicate sends.
- 5-item nav on mobile — verify nav wrapping doesn't break at small widths after deploy.
