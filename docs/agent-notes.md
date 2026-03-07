# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (408 tests + 36 static pages)
- **Tests:** 408 unit/component/integration tests (Vitest, 36 files) + 14 e2e tests (Playwright) = 422 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total + branded 404 page
- **Routes:** All previous routes + `/api/send-newsletter` (Beehiiv draft creation endpoint)
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 20 published documents, 0 drafts.
- **Sanity MCP server:** Available at `https://mcp.sanity.io` (added via `claude mcp add Sanity -t http https://mcp.sanity.io --scope user`). Auth token at `~/.config/sanity/config.json`.

## In Progress: Nico's Notes — Weekly Column

**ExecPlan:** `docs/plans/active/nicos-notes-column.md`

New `column` document type for a weekly Sunday column by Nico (~600 words reflecting on the past week and looking ahead). First column: 2026-03-07. Plan approved, implementation not yet started.

Key decisions:
- Route: `/[locale]/nico/[slug]` (detail), `/[locale]/nico` (archive)
- Slug: auto-generated from publish date (YYYY-MM-DD)
- Sequential numbering (Column #001, #002, etc.)
- Separate RSS feed at `/[locale]/nico/feed.xml`
- Beehiiv integration for email distribution
- Home page widget featuring latest column with "Read" and "See all" links
- Cover image per column (same as issues)

Phases: Schema & Data → Routes & Pages → SEO & Distribution → Newsletter Integration → Tests → Home Page Widget

## Recent Completed Work

- **Beehiiv newsletter sending system** — 6 phases complete (subscribe locale, PT-to-HTML, email template, send API, Studio action, idempotency tracking)
- **Revalidation pipeline** — Sanity webhook → `/api/revalidate` → edge cache purge (live in production)
- **Security hardening** — `escapeHtml`/`sanitizeHref` in `lib/htmlUtils.js`, auth on send-newsletter endpoint

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars on Vercel:** `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` — set (same value for both)
- **Beehiiv:** `locale` custom field created, EN/ES audience segments created (Dynamic type, OR logic for EN with "is unknown" fallback)
- **Sanity schema:** All fields deployed (including `beehiivPostIds` on issue)

## Pending (pre-column)

- [ ] Manual end-to-end test: Studio action → Beehiiv draft creation (Issue #001)
- [ ] Activate Beehiiv Recommendations widget when available

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- OG images use Inter font instead of Space Grotesk — ImageResponse edge runtime limits font loading.
- No rate limiting on API routes — Vercel baseline DDoS protection covers it.
- No bot protection (honeypot/CAPTCHA) on forms — add if spam becomes an issue.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, test output only.
- Google Fonts `<link>` in email HTML may not render in most email clients — fallback fonts will display. Not harmful.
- `hasFullTranslation()` only checks title + Nico's Transmission — ES newsletter may contain EN-fallback story content.
- Server-side idempotency for newsletter sending not implemented — Studio action warns but doesn't prevent duplicate sends.
