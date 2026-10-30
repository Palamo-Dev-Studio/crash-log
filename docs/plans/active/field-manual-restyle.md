# Field Manual restyle — living plan

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
  documents created in Studio; API-created issues get no byline and render "The Crash Log newsroom".

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
  `@hectoralamo.ai`, TikTok `@hectorluislamo` (spelling being confirmed). X dropped everywhere, including JSON-LD
  `sameAs` and twitter `site`; `sameAs` = the Follow-column URLs from one shared constant. "A Palamo publication" → palamo.ai, listed in the Elsewhere column.
- **Wordmark stays "The Crash Log"** (Hector, 2026-10-30).
- **Byline flip approved** (Hector, 2026-10-30): `getByline` treats a missing issue byline as "Hector Luis Alamo"
  and the sentinel `byline: "newsroom"` as the localized newsroom name. At ship time, with Hector's go on the
  write, set `byline: "newsroom"` on issues #1–27 in production Sanity. Steam's pipeline still sets bylines.

- **Credit line on Hector-bylined posts** (Hector, 2026-10-30): Off the Rails and Practical posts bylined
  Hector carry "Reported with Nico" / "Con reportería de Nico" with the byline on the post page (issue header,
  article header). Archive "newsroom" issues and Nico's Notes carry none. Build in Phases 5–6 via a `getCredit`
  helper next to `getByline`.
- **Old masthead retired** (Hector, 2026-10-30): Scoop, Root, Gabo, Lupe. About shows two people: Hector and Nico.
- **Support page headline → "Feed the Agents"** (Hector, 2026-10-30); Phase 7.
- **About page rewrite** (Hector, 2026-10-30): Nico drafts in Nico's voice (three series, who makes it, how it
  works, contact; no weekday labels); Hector edits; it goes into Sanity at ship time with his go.
- **About copy approved** (Hector, 2026-10-30): EN + ES in `docs/plans/active/about-page-copy.md`.
- 🔴 **Ship order: run the `byline: "newsroom"` backfill BEFORE the restyle deploys.** The new code credits any
  issue without a byline to Hector ("Reported with Nico"); deployed first, all 26 archive issues would be
  misattributed live until the write lands. The current production code ignores `byline`, so writing it early is
  invisible. Same for archive `verdict`s if approved.
- **Archive backfills are Nico's (Ice), at ship time, attended:** the `byline: "newsroom"` write, and (proposed,
  awaiting Hector) plain-English `verdict` EN/ES for the ~80 archive stories, drafted by Nico as one table for
  Hector's approval and written by a guarded script like the byline one. Needs `SANITY_API_TOKEN` or a
  re-authenticated Sanity MCP.
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
- **Reading time has one implementation** (Hector, 2026-10-30, after two review rounds): home feed projects
  Practical body text and uses the same extractor as the article page.
- **Heading anchors renumber only for repeated titles; accepted.** Steam handoff: no repeated H2 titles in a
  Practical post.
- **Newsletter move** (Hector, 2026-10-30): after the restyle ships, write a short plan for Ghost(Pro) on
  `newsletter.crashlog.ai` as the sender (email-only posts pushed from Sanity). Substack has no subscribers yet,
  so there's nothing to migrate. `newsletter.palamo.ai` is not needed: palamo.ai links to crashlog.ai.

## Phase 1 follow-ups (Opus PASS 2026-10-30 on `4aa6c51`, branch `field-manual-phase1`; merge after phase 2 fix)

- `getFileCode`: require a non-negative integer (today -3 → `OTR-0-3`, 1.5 → `OTR-1.5`); test the trailing-`?` branch of `withRef`.
- `exhibit` block: add optional `from` sub-header and `rows[]` of `{lead, text}` (mockup `article.html:75-84`).
- `replyAsk` block: add `buttonUrl`.
- Byline default (asked Hector): pin the archive explicitly and default missing bylines to the future case.
- `sharp` is imported by `scripts/build-favicons.mjs` and `__tests__/unit/favicon.test.js` but is only a
  transitive dep of `next`: add it as an explicit devDependency (`sharp@0.34.5`, the installed version).

**Status:** follow-ups built on `field-manual-phase1b` (`a4beb75`, worktree `.claude/worktrees/agent-a22ef2594b9757de5`), Opus PASS; merge after phase 3 lands. Byline default still open.

**Declined for the PR body:** the lockfile's `node_modules/sharp`, `@img/colour` and `detect-libc` entries stay `"optional": true` rather than `"devOptional": true`. Only `npm ci --omit=optional` drops sharp, and neither CI nor Vercel uses that mode; the site build doesn't import sharp.

**Declined NITs for the PR body (Opus PASS on `320fb31`):** `E2E_PORT=0x0BB8` parses as 3000 (hex input, nobody
types it); the Support/Subscribe test checks parity, not absolute height (Chromium's border rounding already makes
a both-shrink mutant fail).

**Waiting on Hector (2026-10-30):** lint rule — stop iterating (ban simple forms, list exotic ones as accepted
risk)? Backfill script — keep, one final test round (count `<` mutant, `main()` guards as pure functions, exclude
`versions.**`, dry-run note on drafts, partial-run summary), then close?

## Known issues

- **`main`'s e2e suite is red before this branch:** 7 Playwright failures at `1f133a3` (archive-search ×2,
  nicos-notes ×4, locale-switching ×1), same 7 on the branch. SPEC criterion 10 needs e2e green; fix before PR.
- **Contrast test is a list, not a rule** (`__tests__/unit/contrast.test.js` checks named tokens against fixed
  cream/card). Phase 7: replace with a scan of every CSS rule that sets a colour and a background (incl. `:hover`).
- **Date formatting is duplicated 7×** (FeedCard, ColumnContent, IssueContent, ArchiveCard, ColumnCard,
  BeatStoryCard, issue OG image); only FeedCard and the OG image pin `timeZone: "UTC"`, so the others can show a
  date one day early depending on server timezone. Consolidate into one helper (UTC) when Phases 4–6 touch these.
- **Sideways scroll on `/es/issue/crash-log-009`** (9px at 390, 79px at 320): a bare Bloomberg URL in Stack Trace
  text can't wrap. Phase 7: a crawl test that loads EVERY route at 320/360/390 (EN/ES) and asserts no horizontal
  overflow (SPEC criterion 8), plus `overflow-wrap: anywhere` on long-URL text. Declined NITs from the Phase 5
  review: e2e stamp markup is synthetic (unit test covers the component); source date not wrapped in `<time>`.
- **Unmatched URLs serve Next's bare 404** (no masthead/footer). Phase 7: add a `[locale]/[...rest]` catch-all
  that calls `notFound()` so the branded 404 renders.
- Nav links to `/[locale]/off-the-rails` and `/[locale]/practical` 404 until Phases 5 and 6 add those indexes.

## Phases

| #   | Phase                                                                                       | Status                             |
| --- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | Schema: `story.verdict`, `story.summary`, `story.image` (+credit), author, `practical` type | merged `e2532e3`                   |
| 2   | Tokens, fonts (`next/font`), roundel SVGs, favicon set                                      | PASS `1e65711`                     |
| 3   | Global chrome: masthead + blinking bar, nav, EN/ES toggle, footer                           | PASS `320fb31`; lint + p3b pending |
| 4   | Home: cover hero, rail, recent files                                                        | merged `86ec32d`                   |
| 5   | Off the Rails issue page: case cards, verdict stamps                                        | merged                             |
| 6   | Practical article template + Nico's Notes column page                                       | building                           |
| 7   | Every other page (archive, beats, about, support, 404, OG images) + legacy token removal    | —                                  |
| 8   | Whole-branch Fable review → CodeRabbit → PR                                                 | —                                  |

## Acceptance criteria

`SPEC.md` § Acceptance criteria 1–10, with these changes from the decisions above: bylines per the author
rule, nav includes About, and "Read the file →" points to the story source.
