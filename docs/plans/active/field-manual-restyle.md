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

## Phase 1 follow-ups (Opus PASS 2026-10-30 on `4aa6c51`, branch `field-manual-phase1`; merge after phase 2 fix)

- `getFileCode`: require a non-negative integer (today -3 → `OTR-0-3`, 1.5 → `OTR-1.5`); test the trailing-`?` branch of `withRef`.
- `exhibit` block: add optional `from` sub-header and `rows[]` of `{lead, text}` (mockup `article.html:75-84`).
- `replyAsk` block: add `buttonUrl`.
- Byline default (asked Hector): pin the archive explicitly and default missing bylines to the future case.

## Phases

| #   | Phase                                                                                       | Status           |
| --- | ------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Schema: `story.verdict`, `story.summary`, `story.image` (+credit), author, `practical` type | next             |
| 2   | Tokens, fonts (`next/font`), roundel SVGs, favicon set                                      | built, in review |
| 3   | Global chrome: masthead + blinking bar, nav, EN/ES toggle, footer                           | —                |
| 4   | Home: cover hero, rail, recent files                                                        | —                |
| 5   | Off the Rails issue page: case cards, verdict stamps                                        | —                |
| 6   | Practical article template + Nico's Notes column page                                       | —                |
| 7   | Every other page (archive, beats, about, support, 404, OG images) + legacy token removal    | —                |
| 8   | Whole-branch Fable review → CodeRabbit → PR                                                 | —                |

## Acceptance criteria

`SPEC.md` § Acceptance criteria 1–10, with these changes from the decisions above: bylines per the author
rule, nav includes About, and "Read the file →" points to the story source.
