# Field Manual restyle — living plan

**Status: shipped 2026-11-01.** PR #24 (restyle), #25 (legend, series-name colour, plain bylines) and #26 (tagline, legend spread) merged; the ship runbook ran 2026-11-01 (26 bylines, 88 verdicts, About copy, each with Hector's go). Steam handoff: claude-workspace PR #347.

Branch: `feature/field-manual-restyle` (cut from `origin/main` @ `a08b403`, 2026-10-30).
Input: `docs/reference/field-manual/SPEC.md` + `mockups/` + `renders/` (Steam's handoff, approved by Hector 2026-10-30).
The mockup CSS (`mockups/styles.css`) is the source of truth for tokens and sizes.

## Goal

Restyle crashlog.ai from the dark error-console look to a printed incident report: cream paper, ink type,
rubber-stamp roundel, file codes. Same brand and content, calm instead of menacing, EN and ES equally good.

## Decisions (Hector, 2026-10-30, in session)

- **Build pipeline:** no `web-build` skill on Ice. Sonnet builds, Opus reviews each phase, Fable reviews the
  whole branch once at the end, then CodeRabbit, then one PR assigned to Hector, not armed (code PR).
  Playwright tests stand in for the floor harness (criteria 2, 5, 6, 8, 9).
- **Series come from document type**, not a `series` field: `issue` = Off the Rails (OTR), `column` = Nico's
  Notes (NOTE), new `practical` type = Practical (FIX).
- **Numbering:** OTR-### = `issueNumber`, NOTE-### = `columnNumber`, FIX starts at 001.
- **Verdict stamp:** new localized `verdict` field on `story`; falls back to `severity` for old stories.
- **Bylines:** author field defaulting by series. New OTR and Practical: "Hector Luis Alamo". NOTE: "Nico von
  Bot". Archive issues #1–27: "The Crash Log newsroom".
- **Off the Rails format:** like the MyClaw newsletter: headline, image, brief summary, link to source.
  "Read the file →" opens the story's source URL. Case cards in a grid.
- **Nav:** Latest, Off the Rails, Practical, Nico's Notes, Archive, About. About also in the footer.
  Beats leaves the nav; `/beats` and `/beat/[slug]` stay live and get restyled.
- **Rail label:** "Latest files" until the new series run weekly.
- **Logo:** keep the chevrons at 16px.
- **Icon files use the simple mark** (180 apple-touch, 512, OG avatar), not the stamp: the ring legend is
  unreadable at home-screen size and needs DM Mono at raster time. The stamp mark lives in the masthead.
  (Nico's call, 2026-10-30; Hector may veto.) Favicon gets a cream fill so it shows on dark tabs.
- **Old issues' Nico's Transmission and Stack Trace** render below the cases in the new style.
- **One PR** at the end: `main` deploys straight to production, so a half-restyled site can't ship.
- **CI:** org Actions billing failing as of 2026-10-30; `scripts/verify.sh` locally is the gate.

- **Case card (modeled on the MyClaw newsletter item):** case number + verdict stamp, headline, image with a
  credit line, ~60–75-word summary, source line (outlet + date), "Read the file →" to the source.
- **Grid:** two columns on desktop, one on mobile.
- **Archive issues:** same cards, summary falls back to the story body's first paragraph, and the full story
  bodies stay below the grid so no published writing disappears.
- **Outbound source links** get `?ref=crashlog.ai`.
- **New `story` fields:** `verdict` (localized), `summary` (localized), `image` with localized alt + `credit`.
  Hand the field names to Steam's Off the Rails pipeline once merged.
- **Steam handoff must say: every Off the Rails and Practical post ships with a cover image.** The home hero
  without art ends above the rail (accepted by Hector 2026-10-30, not designed for).
- **Steam handoff must say: set `byline` explicitly.** `issue.byline`'s `initialValue` applies only to
  documents created in Studio; an API-created issue without a byline renders as Hector's (see the byline flip).

- **Subscribe is a plain link to Substack** (masthead button and rail box), not an inline-expanding form
  (Hector, 2026-10-30, after two review rounds of masthead layout bugs from the inline form).
- **Dates go through one helper, `lib/formatDate.js`** (UTC, never a weekday), enforced by an ESLint rule
  banning date formatting elsewhere. RSS feeds keep `toUTCString` (RFC 822 pubDate). Replaces output word-scans.
- **Masthead Support link** sits in a terracotta outline box (Hector, 2026-10-30).
- **Donation thank-you has no auto-dismiss:** it stays until closed (Hector, 2026-10-30, after the timer's
  focus loss became the second review round on the toast's focus handling).

- **Donation prompt on every page** (Hector, 2026-10-30): restyle `DonateCTA` in Field Manual tokens and render
  it site-wide above the footer, still gated by `NEXT_PUBLIC_DONATIONS_ENABLED`.
- **Footer "Follow" column** (Hector, 2026-10-30): Bluesky `@hectoralamo.bsky.social`, Instagram
  `@hectoralamo.ai`, TikTok `@hectorluisalamo` (Hector, confirmed). X dropped everywhere, including JSON-LD
  `sameAs` and twitter `site`; `sameAs` = the Follow-column URLs from one shared constant. "A Palamo publication" → palamo.ai, listed in the Elsewhere column.
- **Wordmark stays "The Crash Log"** (Hector, 2026-10-30).
- **Byline flip approved** (Hector, 2026-10-30): `getByline` treats a missing issue byline as "Hector Luis Alamo"
  and the sentinel `byline: "newsroom"` as the localized newsroom name. At ship time, with Hector's go on the
  write, set `byline: "newsroom"` on issues #1–27 in production Sanity. Steam's pipeline still sets bylines.

- **Credit line on Hector-bylined posts** (Hector, 2026-10-30): Off the Rails and Practical posts bylined
  Hector carry "Reported with Nico" / "Con reportería de Nico" with the byline on the post page (issue header,
  article header). Archive "newsroom" issues and Nico's Notes carry none. Build in Phases 5–6 via a `getCredit`
  helper next to `getByline`.
- **Masthead is two people, Hector and Nico** (Hector, 2026-10-30). Verified 2026-10-30: Sanity holds only those two
  `agent` docs and the About masthead references only them, so no retire step is needed (the earlier plan assumed
  four retired agents still in Sanity; they weren't).
- **Support page headline → "Feed the Agents"** (Hector, 2026-10-30); Phase 7.
- **About page rewrite** (Hector, 2026-10-30): Nico drafts in Nico's voice (three series, who makes it, how it
  works, contact; no weekday labels); Hector edits; it goes into Sanity at ship time with his go.
- **About copy approved** (Hector, 2026-10-30): EN + ES in `docs/plans/active/about-page-copy.md`.
- 🔴 **Ship order: run the `byline: "newsroom"` backfill BEFORE the restyle deploys.** The new code credits any
  issue without a byline to Hector ("Reported with Nico"); deployed first, all 26 archive issues would be
  misattributed live until the write lands. The current production code ignores `byline`, so writing it early is
  invisible. Same for archive `verdict`s if approved.
- **Ship-time Sanity writes are Nico's (Ice), attended, with Hector's go on each:** see § Ship runbook. Needs
  `SANITY_API_TOKEN` in the environment for the run.
- **Card summaries (Hector, 2026-10-30, after two review rounds on sentence detection):** no code-side
  truncation. Authored `summary` when present; otherwise the body's first paragraph, capped visually at 5 lines
  with CSS line-clamp. The sentence splitter is deleted.
- **Stamps:** line-break opportunity after each `_` in severity codes; e2e down to 320px.
- **Sources get an optional `date`** (Hector, 2026-10-30): source line reads "SOURCE · Outlet · date" when set.
  Steam handoff: fill it.
- **Issue kicker dates: US style in caps** ("JUN 11, 2026"), via `formatDate` (Hector, 2026-10-30).
- **Card keeps both links** (Hector, 2026-10-30): "Read the file →" out to the source; "CASE 0N" down to the full
  story on archive issues.
- **Archive verdicts approved** (Hector, 2026-10-30): Nico drafts EN/ES verdicts for the archive stories as one
  table; Hector approves; written at ship time (before deploy) by a guarded script.
- **Archive verdicts approved as drafted** (Hector, 2026-10-30): `scripts/data/archive-verdicts.json` (88 stories,
  full IDs). Ship prep: extend the guarded backfill script to write them (same guards: dry run by default,
  `--apply --expect=88`, `ifRevisionId`, never overwrite a non-empty verdict), run before deploy.
- **Nico's Notes pages show the cover image**, between byline and body (Hector, 2026-10-30).
- **Columns end with the "New files every week. Free." subscribe box** (Hector, 2026-10-30).
- **Reading time has one implementation per series** (Hector, 2026-10-30, after two review rounds): the home
  feed and the file's own page use the same function and projection (Practical: custom blocks counted, code
  excluded; issues: aligned in the final-review fix round).
- **Heading anchors renumber only for repeated titles; accepted.** Steam handoff: no repeated H2 titles in a
  Practical post.
- **Newsletter move** (Hector, 2026-10-30): after the restyle ships, write a short plan for Ghost(Pro) on
  `newsletter.crashlog.ai` as the sender (email-only posts pushed from Sanity). Substack has no subscribers yet,
  so there's nothing to migrate. `newsletter.palamo.ai` is not needed: palamo.ai links to crashlog.ai.

## Ship runbook (attended; each Sanity write needs Hector's go)

Order matters — verified by the final review. Production today (`origin/main` @ `a08b403`) ignores `byline` and
`verdict`, so steps 1–2 are invisible on the live site and safe even if the deploy later fails. The About payload
uses H2 blocks the OLD About page would render as doubled headings, so it goes in only AFTER the deploy (the new
code renders today's About copy correctly through its legacy path).

1. Dry run, then `node scripts/backfill-newsroom-bylines.mjs --apply --expect=26` (issues #1–27; #5 doesn't exist).
2. Dry run, then `node scripts/backfill-archive-verdicts.mjs --apply --expect=88`.
3. Merge the PR (Hector, by hand) → Vercel deploys. Verify live: home, one archive issue (byline "The Crash Log
   newsroom", plain-English stamps), a column, About (legacy copy, restyled), Support, a 404.
4. Dry run, then `node scripts/write-about-copy.mjs --apply --expect=3` (aboutPage + two agents; refuses if the
   About intro already has H2s). Verify `/en/about` and `/es/about`.
5. Steam handoff note: new `story` fields (`verdict`, `summary`, `image`, `imageAlt`, `imageCredit`), source `date`,
   explicit `byline`, cover image on every OTR/Practical post, no repeated H2 titles in a Practical post.

Rollback: the deploy reverts in Vercel. Steps 1–2 need no rollback (old code ignores the fields). Step 4: before
`--apply`, save the three docs in full with a read-only query (`*[_id in $ids]`, with the three `_id`s from `about-page-sanity.json`)
to a file in the scratchpad; the dry run truncates values to 70 characters and the script writes only from
`about-page-sanity.json`, so neither can undo it. To undo, restore each doc's previous revision from Studio History.

## Known issues (open)

- **Practical "subscribe line exactly once" e2e always skips** until a Practical post exists in Sanity. Un-skip
  (or seed a fixture) when the first Practical post is published.
- **Next 16.1.6 dev-server manifest race:** under parallel load `next-dev-server.js` can corrupt
  `.next/dev/prerender-manifest.json` (the cause of the intermittent JSON parse errors). Full Playwright runs use
  `E2E_PROD=1` (build + start).
- **Final gate before the PR:** `scripts/verify.sh` AND a full `E2E_PROD=1 npx playwright test`, both green. The
  static CSS contrast unit test is a partial guard; the e2e contrast scan is the full check.
- **404s server-render an empty error shell** (the branded page appears after client JS; the ES 404 `<title>` is
  English in server HTML). Pre-existing behaviour of `notFound()` here; follow-up after ship.
- **Machine-load stalls:** the test runner occasionally stalls ~84s on this iMac under heavy parallel load;
  not a code defect.
- **Content cleanup (Sanity, not code):** ES category names show in English on archive pills; "44%of" headline typo.
- **Product follow-ups:** no RSS feed for Practical yet; one index-head pattern across Archive/Beats (kicker, count and rule) vs series indexes (H1 and "ALL FILES") — accepted as is for this PR.

## Declined findings (for the PR body)

- Lockfile: `node_modules/sharp`, `@img/colour`, `detect-libc` stay `"optional": true` (only `--omit=optional`
  drops sharp; neither CI nor Vercel uses it).
- `E2E_PORT=0x0BB8` parses as 3000; Support/Subscribe height test checks parity (Chromium border rounding covers
  the both-shrink case).
- Date-lint residual risk documented in `eslint.config.mjs` (runtime-computed keys, `Reflect.get`, coercion).
- e2e stamp markup is synthetic (the unit test covers the component); source date not wrapped in `<time>`.
- OG: wide-caps no-space strings; 90-char no-space title orphan line.
- CodeRabbit (2026-10-31), premise false: Practical "not registered" (`sanity.config.js` registers it and its
  blocks; the `--dir sanity` run couldn't see the config); `HOME_FEED_QUERY` assertion (already asserts the full
  type list, `queries.test.js:239`); "count evaluates to 0" (the test passes with 3); `locale-switching.spec.js`
  nav strict mode (only `SiteNav` renders a `<nav>`).
- CodeRabbit, declined on scope: empty Español tab on `practical` (same as `issue`/`column`: EN/ES inputs live
  inside each localized field; a Studio-wide redesign); `import.meta.dirname` in `build-favicons.mjs` (CI's
  `node-version: "20"` resolves to the latest 20.x; the script runs by hand).
- Practical search property test, known limits (Hector: "keep the test, but stop chasing"): it proves every
  reader-visible field reaches search, not that hidden values (URLs, `_key`, language hints) stay out — the helper
  indexes none today; `nestedBlockText` covers rich text inside custom blocks, which today's schema doesn't use.
- `practical.body` required is Studio validation only; API writes (Steam's uploader) bypass it.
- Byline "no avatar" tests match known avatar markup; a one-letter element with a neutral class would pass. No
  avatar code remains to come back, and Hector ruled against chasing edge cases.
- Rail legend one-line e2e test doesn't await `document.fonts.ready`; `goto` waits for `load`, which fonts
  requested at first render hold. ES has ~7px of slack at 1280, so a wider DM Mono rendering on another platform
  could wrap it, between series only.

## Phases

| #   | Phase                                                                                       | Status           |
| --- | ------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Schema: `story.verdict`, `story.summary`, `story.image` (+credit), author, `practical` type | merged           |
| 2   | Tokens, fonts (`next/font`), roundel SVGs, favicon set                                      | merged           |
| 3   | Global chrome: masthead + blinking bar, nav, EN/ES toggle, footer                           | merged           |
| 4   | Home: cover hero, rail, recent files                                                        | merged           |
| 5   | Off the Rails issue page: case cards, verdict stamps                                        | merged           |
| 6   | Practical article template + Nico's Notes column page                                       | merged           |
| 7   | Archive, beats, about, support, 404, OG images, site-wide crawl/contrast, legacy tokens     | merged `6f1b23b` |
| 8   | Whole-branch Fable review (REVISE 2026-10-31) → fixes → re-review → CodeRabbit → PR         | merged #24–#26   |

## Acceptance criteria

`SPEC.md` § Acceptance criteria 1–10, with these changes from the decisions above: bylines per the author
rule, nav includes About, and "Read the file →" points to the story source.
