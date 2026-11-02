# Agent Notes — The Crash Log

## Current State

- **Branch:** `main` @ `e68756e` (merge of #28). Live on Vercel at `crashlog.ai`.
- **Design:** the "Field Manual" redesign is live (PRs #24–#28, merged 2026-10-31 to 2026-11-01). Plan, decisions and ship
  runbook: `docs/plans/completed/field-manual-restyle.md`.
- **Tests:** `scripts/verify.sh` passes: 1324 Vitest tests in 80 files. Playwright has 16 spec files; full runs use
  `E2E_PROD=1` (185 passed, 1 skipped on the #28 branch, 2026-11-01). Get live counts from the commands, not from here.
- **Sanity** (project `msr24cg4`, dataset `production`): 26 published issues (#1–27, no #5), 89 published stories,
  2 agents (Hector, displayOrder 1; Nico, 2), 0 Practical posts. 71 unpublished story drafts (OpenClaw leftovers).
  Archive issues carry `byline: "newsroom"`; 88 archive stories carry `verdict` (EN/ES); the About copy is the
  approved 2026-10-30 text (written 2026-11-01).
- **Newsletter:** Subscribe links still go to Substack (no subscribers). Moving to Ghost(Pro) is planned, not
  started: `docs/plans/active/newsletter-ghost.md`.

## Immediate Next Step

1. Hector decides the Ghost(Pro) plan (rec: Publisher) and creates the account. Then Ice prepares the DNS records
   (step 2 of `docs/plans/active/newsletter-ghost.md`) for Hector's approval and swaps the Subscribe URL.
2. Steam picks up `handoffs/to-steam/2026-11-01-crash-log-new-fields.md` (claude-workspace PR #347, merged; it
   was labelled `for-steam` only after it merged). If Steam hasn't acted, nudge it.

## Blocked on Hector

1. Ghost(Pro) plan choice and account (it costs money).
2. The 71 story drafts: he said to delete them "another time". No agent deletes them without his go.
3. Content fixes in Sanity: ES category names show in English on archive pills; one headline has the typo "44%of".

## Recently Completed

- **2026-11-01, follow-ups (#26–#28):** new tagline "Incident reports on AI and what to do next" with one source
  (`lib/tagline.js`) for the masthead and OG images; rail legend spread only where it fits on one line (≥1180px);
  Spanish masthead tags ("HUMANO AL MANDO", "COLABORADOR DE IA"); short tagline below 900px because the full one
  wrapped and crowded the tools between 700 and 880px. Each passed a Sonnet or Opus review plus CodeRabbit.
- **2026-11-01, ship runbook:** with Hector's go on each write, ran `backfill-newsroom-bylines` (26 patched),
  `backfill-archive-verdicts` (88), and `write-about-copy` (3; a full snapshot was saved first). Hector merged #24
  before the backfills, so archive issues credited him for a few hours; the runbook order (backfills first) was right.
- **2026-10-31/11-01, Hector's design changes (#25):** rail legend on one line, series name in its series colour in kickers
  (`components/SeriesName.js`), one plain-text byline for every series (`components/Byline.js`, no avatar).
- **2026-10-30/31, Field Manual restyle (#24):** seven phases, each reviewed; whole-branch Fable review (REVISE),
  fixes re-reviewed; Hector's copy calls; CodeRabbit by directory. Details in the completed plan.
- **2026-10-30, Beehiiv removed:** Subscribe became a plain Substack link; Hector deleted the Beehiiv and
  newsletter-secret env vars from Vercel.

## Verified / Refuted

- ✅ Sanity MCP must authenticate as Hector's **Google** account; his "sanity" email-login account is not a project
  member ("project user not found"). After `mcp configure`, reconnect through `/mcp`. (2026-11-01)
- ✅ The ship scripts read `SANITY_API_TOKEN` from `.env.local` themselves; their dry runs read without a token and
  so cannot see drafts (`--apply` checks for them). (2026-11-01)
- ✅ crashlog.ai DNS is on Vercel and is locked as a non-sending domain: null MX, SPF `-all`, DMARC `p=reject`
  with strict alignment; subdomains inherit `p=reject`. `newsletter.crashlog.ai` currently resolves to Vercel. (2026-11-01)
- ✅ Ghost(Pro): a custom sending domain needs Publisher or higher, a custom publication domain first and a DMARC
  record; warm-up takes about 6 weeks. The Admin API's member creation documents no confirmation email. (ghost.org, 2026-11-01)
- ❌ "CodeRabbit can review the whole branch in one run": two whole-branch runs (285 files) dropped their WebSocket
  mid-review; splitting with `--dir` worked, and an `--agent` whole-branch run later completed. The CLI allows 5
  reviews per rolling hour. (2026-10-31)
- ✅ Next 16.1.6 dev server corrupts `.next/dev/prerender-manifest.json` under parallel load; full Playwright runs
  use `E2E_PROD=1`. Memory pressure on the iMac (swap near full) causes 60s e2e timeouts; `--workers=1` avoids them.
- ✅ Sanity workspace name is `the-crash-log` (not `default`); pass it to MCP tools.

## Known Issues / Deferred

- **404 pages** server-render an empty error shell (the branded page appears after client JS); the ES 404 `<title>`
  is English in server HTML. Predates the restyle.
- **Practical:** no RSS feed yet; the "subscribe line once" e2e check skips until a Practical post exists.
- **Rail legend (ES):** about 7px of slack at 1280px; a wider DM Mono rendering could wrap it (between items only).
- **Orphan story** `S9mF1lBwsv6MdFz667WGZf` is published but listed by no issue, so it has no verdict.
- **Content pipeline quirk:** the uploader sets `status: "draft"` on issue documents and may leave `drafts.*` story
  refs; fix both before publishing.
- `@sanity/image-url` default export is deprecated (use `createImageUrlBuilder`). Non-blocking.
- Next.js 16 warns that the middleware file convention is deprecated in favour of "proxy". Functional.
- No rate limiting on API routes; Vercel's baseline protection covers it.
