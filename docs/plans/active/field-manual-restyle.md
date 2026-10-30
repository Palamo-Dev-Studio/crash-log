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
- **Steam handoff must say: set `byline` explicitly.** `issue.byline`'s `initialValue` applies only to
  documents created in Studio; API-created issues get no byline and render "The Crash Log newsroom".

- **Subscribe is a plain link to Substack** (masthead button and rail box), not an inline-expanding form
  (Hector, 2026-10-30, after two review rounds of masthead layout bugs from the inline form).
- **Dates go through one helper, `lib/formatDate.js`** (UTC, never a weekday), enforced by an ESLint rule
  banning date formatting elsewhere. RSS feeds keep `toUTCString` (RFC 822 pubDate). Replaces output word-scans.
- **Masthead Support link** sits in a terracotta outline box (Hector, 2026-10-30).

## Phase 1 follow-ups (Opus PASS 2026-10-30 on `4aa6c51`, branch `field-manual-phase1`; merge after phase 2 fix)

- `getFileCode`: require a non-negative integer (today -3 → `OTR-0-3`, 1.5 → `OTR-1.5`); test the trailing-`?` branch of `withRef`.
- `exhibit` block: add optional `from` sub-header and `rows[]` of `{lead, text}` (mockup `article.html:75-84`).
- `replyAsk` block: add `buttonUrl`.
- Byline default (asked Hector): pin the archive explicitly and default missing bylines to the future case.
- `sharp` is imported by `scripts/build-favicons.mjs` and `__tests__/unit/favicon.test.js` but is only a
  transitive dep of `next`: add it as an explicit devDependency (`sharp@0.34.5`, the installed version).

**Status:** follow-ups built on `field-manual-phase1b` (`a4beb75`, worktree `.claude/worktrees/agent-a22ef2594b9757de5`), Opus PASS; merge after phase 3 lands. Byline default still open.

**Declined for the PR body:** the lockfile's `node_modules/sharp`, `@img/colour` and `detect-libc` entries stay `"optional": true` rather than `"devOptional": true`. Only `npm ci --omit=optional` drops sharp, and neither CI nor Vercel uses that mode; the site build doesn't import sharp.

## Known issues

- **`main`'s e2e suite is red before this branch:** 7 Playwright failures at `1f133a3` (archive-search ×2,
  nicos-notes ×4, locale-switching ×1), same 7 on the branch. SPEC criterion 10 needs e2e green; fix before PR.
- **Contrast test is a list, not a rule** (`__tests__/unit/contrast.test.js` checks named tokens against fixed
  cream/card). Phase 7: replace with a scan of every CSS rule that sets a colour and a background (incl. `:hover`).
- **Date formatting is duplicated 7×** (FeedCard, ColumnContent, IssueContent, ArchiveCard, ColumnCard,
  BeatStoryCard, issue OG image); only FeedCard and the OG image pin `timeZone: "UTC"`, so the others can show a
  date one day early depending on server timezone. Consolidate into one helper (UTC) when Phases 4–6 touch these.
- Nav links to `/[locale]/off-the-rails` and `/[locale]/practical` 404 until Phases 5 and 6 add those indexes.

## Phases

| #   | Phase                                                                                       | Status           |
| --- | ------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Schema: `story.verdict`, `story.summary`, `story.image` (+credit), author, `practical` type | merged `e2532e3` |
| 2   | Tokens, fonts (`next/font`), roundel SVGs, favicon set                                      | PASS `1e65711`   |
| 3   | Global chrome: masthead + blinking bar, nav, EN/ES toggle, footer                           | building         |
| 4   | Home: cover hero, rail, recent files                                                        | —                |
| 5   | Off the Rails issue page: case cards, verdict stamps                                        | —                |
| 6   | Practical article template + Nico's Notes column page                                       | —                |
| 7   | Every other page (archive, beats, about, support, 404, OG images) + legacy token removal    | —                |
| 8   | Whole-branch Fable review → CodeRabbit → PR                                                 | —                |

## Acceptance criteria

`SPEC.md` § Acceptance criteria 1–10, with these changes from the decisions above: bylines per the author
rule, nav includes About, and "Read the file →" points to the story source.
