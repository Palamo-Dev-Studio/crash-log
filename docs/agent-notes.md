# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (408 tests + 36 static pages)
- **Tests:** 408 unit/component/integration tests (Vitest, 36 files) + 14 e2e tests (Playwright) = 422 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total + branded 404 page
- **Routes:** All previous routes + `/api/send-newsletter` (Beehiiv draft creation endpoint)
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 20 published documents, 0 drafts.

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
- **Env vars on Vercel:** `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` — set (same value for both)
- **Beehiiv:** `locale` custom field created, EN/ES audience segments created (Dynamic type, OR logic for EN with "is unknown" fallback)
- **Sanity schema:** `beehiivPostIds` field added to issue — NOT YET DEPLOYED, run `npx sanity@latest schema deploy`

## Immediate Next Steps

1. **Deploy Sanity schema** — run `npx sanity@latest schema deploy` to push `beehiivPostIds` field
2. **Deploy to Vercel** — push to trigger a build with the new env vars
3. **Manual end-to-end test** — `npm run dev` → `/studio` → open Issue #001 → "Send Newsletter" action → verify Beehiiv draft(s) created

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
