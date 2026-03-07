# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (408 tests + 36 static pages)
- **Tests:** 408 unit/component/integration tests (Vitest, 36 files) + 14 e2e tests (Playwright) = 422 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total + branded 404 page
- **Routes:** All previous routes + `/api/send-newsletter` (Beehiiv draft creation endpoint)
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 24 published documents + 5 drafts.

## Recent Completed Work

- **Beehiiv newsletter sending system** (6 phases):
  - Phase 1: Subscribe flow passes `locale` as custom field to Beehiiv (for audience segmentation)
  - Phase 2: `lib/portableTextToHtml.js` — Portable Text to HTML converter for email templates
  - Phase 3: `lib/emailTemplate.js` — Full email template builder with inline CSS, severity colors, bilingual labels
  - Phase 4: `POST /api/send-newsletter` — Creates Beehiiv draft posts from published Sanity issues (EN always, ES if translated)
  - Phase 5: `sanity/actions/sendNewsletterAction.js` — Studio document action with confirm/result dialogs, patches `beehiivStatus` + `beehiivPostIds`
  - Phase 6: Added `beehiivPostIds` (readOnly) to issue schema for idempotency tracking
- **Security hardening:** `escapeHtml`/`sanitizeHref` utilities in `lib/htmlUtils.js`, auth via `SEND_NEWSLETTER_SECRET` on the send-newsletter endpoint
- **New dependency:** `@portabletext/to-html`

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars needed on Vercel:** `SEND_NEWSLETTER_SECRET` (server-only API auth) + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` (client-side for Studio action) — same value for both
- **Sanity schema:** `beehiivPostIds` field added to issue — deploy schema with `npx sanity@latest schema deploy`

## Immediate Next Steps

1. **Deploy Sanity schema** — run `npx sanity@latest schema deploy` to push `beehiivPostIds` field
2. **Set env vars** — add `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` to `.env.local` and Vercel (same value)
3. **Beehiiv setup** — Create `locale` custom field on Beehiiv publication, create EN/ES segments
4. **Manual test** — `npm run dev` → `/studio` → open published issue → "Send Newsletter" action
5. **Deploy to Vercel** and verify the newsletter flow end-to-end
6. **Review/publish Issue #015** in Studio
7. **Discard OpenClaw's failed draft** (`drafts.crashlog-2026-03-06`)

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
