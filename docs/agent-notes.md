# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (313 tests + 21 static pages)
- **Tests:** 313 unit/component/integration tests (Vitest, 30 files) + 14 e2e tests (Playwright) = 327 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total
- **Routes:** All previous routes + `/api/revalidate` (webhook endpoint)
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 24 published documents + 5 drafts.

## Recent Completed Work

- **Build fix:** 3 stories with dotted document IDs (`crash-log-002.story-*`) were inaccessible to the public API. Re-created with UUID-based IDs, updated issue #001 references, deleted old docs.
- **Defensive null filtering:** Added `.filter(Boolean)` to `IssueContent.js` stories array to prevent crashes from unresolved references.
- **`sanityFetch` wrapper:** New export in `lib/sanity.js` that wraps `client.fetch()` with `{ next: { revalidate: 3600 } }`. All 9 fetchers in `lib/queries.js` migrated to use it.
- **Revalidation webhook:** `POST /api/revalidate` endpoint validates HMAC signature via `next-sanity/webhook`, calls `revalidatePath('/', 'layout')` on valid webhook.
- **New tests:** sanityFetch (4), null story handling (1), revalidate API (8), updated queries tests (5 new null-fallback tests) = 18 net new tests.

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars needed on Vercel:** `SANITY_REVALIDATE_SECRET` (same value as `.env.local`)
- **Sanity webhook needed:** POST to `https://crashlog.ai/api/revalidate` on create/update/delete, with secret

## Immediate Next Steps

1. **Add `SANITY_REVALIDATE_SECRET` to Vercel** env vars
2. **Configure Sanity webhook** in manage.sanity.io > Project msr24cg4 > API > Webhooks
3. **OpenClaw MCP integration** — wire Sanity MCP into OpenClaw runtime for schema introspection
4. **OpenClaw refactors uploader** — diff gold-standard Issue #001, fix document ID generation (no dots!)
5. **Hector reviews Issue #015 in Studio** — edit stories, publish
6. **Discard OpenClaw's failed draft** (`drafts.crashlog-2026-03-06`)

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- OG images use Inter font instead of Space Grotesk — ImageResponse edge runtime limits font loading.
- No rate limiting on `/api/subscribe`, `/api/donate`, or `/api/revalidate` — Vercel baseline DDoS protection covers it.
- No bot protection (honeypot/CAPTCHA) on forms — add if spam becomes an issue.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, test output only.
