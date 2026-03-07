# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `verify.sh` passes (319 tests + 21 static pages)
- **Tests:** 319 unit/component/integration tests (Vitest, 31 files) + 14 e2e tests (Playwright) = 333 total
- **Verification script:** `scripts/verify.sh` — runs lint, format check, tests, then build; exits non-zero on failure
- **Components:** 19 total + branded 404 page
- **Routes:** All previous routes + `/api/revalidate` (webhook endpoint)
- **Sanity:** Project `msr24cg4`, dataset `production`. Schema deployed (workspace: `the-crash-log`). 24 published documents + 5 drafts.

## Recent Completed Work

- **UI comfort pass:** Brightened text color scale, desaturated severity colors ~15-20%, improved surface/border contrast, removed font smoothing override, softened selection/focus ring, bumped section heading sizes, nav link sizes, Stack Trace description text, increased story block and Stack Trace item spacing, removed subtitle opacity.
- **SEO critical fixes:** Homepage canonical + hreflang, branded locale-aware 404 page, Stack Trace source URLs rendered as clickable external links, RSS language codes corrected to lowercase spec (`en-us`/`es-es`).
- **SEO important fixes:** h2→h1 heading hierarchy on archive/beats/beat/about pages, JSON-LD enhanced with `dateModified`/`image`/`mainEntityOfPage`, improved alt text fallbacks on CoverImage and Portable Text images, `_updatedAt` added to GROQ issue projection.
- **New tests:** NotFound page (6 tests), StackTrace URL rendering (2 tests), updated CoverImage alt + RSS language code tests. Net +8 tests (311→319).

## Deployment

- **Domain:** `crashlog.ai` (Vercel)
- **Sanity CORS:** `https://crashlog.ai` and `http://localhost:3001` with credentials
- All canonical/OG/JSON-LD URLs point to `https://crashlog.ai`
- **Env vars needed on Vercel:** `SANITY_REVALIDATE_SECRET` (same value as `.env.local`)
- **Sanity webhook needed:** POST to `https://crashlog.ai/api/revalidate` on create/update/delete, with secret

## Immediate Next Steps

1. **Visual check:** Refresh site, verify brighter text, softer severity colors, roomier spacing
2. **Verify 404:** Navigate to `/en/nonexistent-page` — should show branded 404
3. **Verify SEO:** Check page source for canonical/hreflang on homepage, JSON-LD enhancements on issue pages, lowercase RSS lang codes
4. **Add `SANITY_REVALIDATE_SECRET` to Vercel** env vars
5. **Configure Sanity webhook** in manage.sanity.io > Project msr24cg4 > API > Webhooks
6. **Hector reviews Issue #015 in Studio** — edit stories, publish
7. **Discard OpenClaw's failed draft** (`drafts.crashlog-2026-03-06`)

## Known Issues / Deferred Items

- `@sanity/image-url` deprecation warning: default export deprecated, use named `createImageUrlBuilder` instead. Non-blocking.
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy". Functional, monitor.
- Sanity workspace name is `the-crash-log` (not `default`) — must pass `workspaceName` to MCP tools.
- OG images use Inter font instead of Space Grotesk — ImageResponse edge runtime limits font loading.
- No rate limiting on `/api/subscribe`, `/api/donate`, or `/api/revalidate` — Vercel baseline DDoS protection covers it.
- No bot protection (honeypot/CAPTCHA) on forms — add if spam becomes an issue.
- React DOM `priority` attribute warning in CoverImage mock — cosmetic, test output only.
