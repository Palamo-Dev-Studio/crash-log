# Crash Log restyle — "Field Manual" (direction B, rev3) — build spec for Ice

Approved by Hector 2026-10-30 ("this is the one", #crash-log `1565751359288905851`). Picked B on 10-30 (`1565736842710483085`); his rev2 notes became rev3 (`1565748918015361075`). Steam made the mockups; Ice builds the site.

## Goal
Keep Crash Log's crash/error-code identity, but make it calm and good-looking. Today's frame (black page, red wordmark, warning triangle, error badges) reads as menacing. The new frame is a **printed incident report**: paper-cream page, ink type, a rubber-stamp roundel, and file codes. The content and the brand name stay the same. The audience is owner-operators and professionals reading long practical posts, in EN and ES.

## Scope
- **In:** a visual restyle of `crash-log-site` (Next.js + Sanity, `~/…/palamo-studio/crash-log-site` on Steam; use your own clone). Global chrome (masthead, nav, footer), the home page, an issue/post page (article template), the Off the Rails issue layout, the logo/favicon set, the EN/ES toggle, and the bylines.
- **Out (separate work, don't build here):** the content pipelines for the new Off the Rails and Practical series (scheduled jobs on Steam), the copy and taglines (placeholders in the mockups), Sanity schema changes beyond what the templates need to tell the three series apart (see Open questions).
- **Use the web-build skill's pipeline** (BRIEF, two-pass build, floor harness, critic gate, PR to Hector). It owns the build; this spec is its input.

## Files in this bundle
- `mockups/`: static HTML of every page, the shared `styles.css`, and `assets/` (`hero-feathered.png`, `logo-old.png`).
  - **Pages:** `home.html`, `home-es.html`, `off-the-rails.html`, `off-the-rails-es.html`, `article.html`, `marks.html`.
  - **The CSS is the source of truth for tokens and sizes.** Port it to the site's styling system; don't rely on the numbers in this file alone.
- `renders/`: PNGs at desktop 1440 and mobile 390 for every page, EN and ES, plus `marks.png` (logo sizes) and `cursor-blink-strip.png` (both frames of the blinking bar).
- **Fonts** are Google Fonts: Instrument Serif (400, italic), Newsreader (opsz 6–72; 400, 600, italic 400), DM Mono (400, 500). Self-host them with `next/font` rather than the CDN link the mockups use.

## Design tokens (from `mockups/styles.css` `:root`)
| Token | Value | Use |
|---|---|---|
| `--cream` | `#F4ECDD` | page background |
| `--card` | `#FBF7EE` | cards and panels |
| `--ink` | `#2A2420` | text, rules, outlines |
| `--rule` | `#CFC3AE` | hairlines, dashed separators |
| `--terra` | `#A83F24` | fills, borders, large roundel symbol |
| `--terra-ink` | `#8F3219` | terracotta as **text**, and the small roundel (6.8:1 on cream) |
| `--teal` | `#1F6F6B` | fills, borders |
| `--teal-ink` | `#17615D` | teal as text (6.2:1) |
| `--muted` | `#5C5043` | secondary text (6.7:1) |
| `--label` | `13px` | every mono micro-label on desktop (14px on mobile) |
| `--wrap` / `--gutter` | `1120px` / `32px` | content width and gutter, the same on every page |

Never put `--terra` or `--teal` text on cream: use the `-ink` variants. All text must clear WCAG AA, and the values above do.

## Typography
- **Display (wordmark, H1, card and rail titles):** Instrument Serif 400. Wordmark 50px; cover H1 52px; page H1 58px; article H1 54px; rail and recent titles 26px.
- **Body:** Newsreader, 18px / 1.5 base. The article dek is 22px, the home dek 21px.
- **Labels, nav, file codes, meta, buttons:** DM Mono at `--label`.
- **Article prose width:** `.art-body { max-width: 68ch }`, beside a 230px left column (the TOC). Hector chose this rev1 width deliberately. Figures, code and callouts stay within the same column.
- **Widows:** `text-wrap: balance` on titles, `text-wrap: pretty` on captions and meta.

## Components
1. **Masthead.** Roundel, wordmark "Crash Log", the **blinking terracotta bar** right after the wordmark, a one-line mono tagline under it, then the EN | ES toggle and the Subscribe button on the right. A double-rule underline separates it from the nav.
   - **Blinking bar:** `.cursor`, about 0.27em × 0.7em, `--terra`, `animation: blink 1s steps(1) infinite` (on half the cycle, off half). Under `prefers-reduced-motion: reduce` it stays solid. `cursor-blink-strip.png` shows both frames.
2. **Nav.** Mono links: Latest, Off the Rails, Practical, Nico's Notes, Archive. On mobile it's a single-row horizontal scroller, not a wrapped second row.
3. **EN | ES toggle.** A segmented control with a clear active state (filled ink with cream text). It switches locale; the existing site already serves `.es` fields from Sanity.
4. **Series colour coding (no weekday labels anywhere).** Each post type has one colour, used for its file-code chip, rail tag and key:
   - **Off the Rails:** terracotta (`.s-otr`, text `--terra-ink`)
   - **Practical:** teal (`.s-fix`, text `--teal-ink`)
   - **Nico's Notes:** ink (`.s-note`)
   - A colour key labelled by **series name** sits beside "This week's files".
   - **Hector's rule:** no MON/WED/FRI labels on issues, in dates or in the footer. Dates show the date only, never the weekday.
5. **File codes.** Each post shows a mono code chip (`.chip`): 1.5px outline, 2px radius. Use the prefix per series plus a zero-padded number (`OTR-044`, `FIX-012`, `NOTE-022`), the same scheme everywhere: hero, rail, recent and article. Derive the number from the issue or column number in Sanity, and don't hard-code it.
6. **Bylines.**
   - **Off the Rails and Practical:** "By Hector Luis Alamo" / "Por Hector Luis Alamo".
   - **Nico's Notes:** "By Nico von Bot" / "Por Nico von Bot".
   - Bylines show on the hero, rail items, recent-files rows, the Off the Rails page header and the article. Off the Rails case cards carry no per-card byline; the issue header covers them.
7. **Home.**
   - **Cover hero:** the newest file, with its illustration feathered into the cream on the right edge, plus code chip, H1, a one-line dek and a read cue.
   - **Right rail:** "This week's files". The cover story's entry is marked "On the cover ←" on desktop and "↑" when stacked.
   - **"Recent files" list:** before the footer.
   - Hero and rail end at the same baseline on desktop.
8. **Off the Rails issue.**
   - **Shared chrome:** masthead, nav, roundel and footer.
   - **Page head:** kicker, H1, byline line, and a stamp legend line.
   - **Case-file grid:** equal-height cards. Each card holds a case number, a **verdict stamp**, the claim (Newsreader 18/1.5), a dashed-rule source line (outlet + date), and a "Read the file →" link (mono, `--terra-ink`, 2px underline).
9. **Verdict stamp** (`.stamp`): mono 500, 13.5px caps, letter-spacing 0.09em, `--terra`, `5px double` border, 3px radius, rotated −3° (`--rot` per card), and an SVG roughness filter (`filter: url(#rough)`, the inline `<filter id="rough">` in each mockup) for the inked edge. One ink colour.
   - Spanish strings are longer: `white-space: nowrap` on mobile, and under ~400px the stamp moves to its own line below the case number.
   - The stamp must stay legible with the filter applied; check it in Safari.
10. **Article (Practical post).**
    - **Top:** a kicker line (code chip, date, reading time) and the byline, once only.
    - **Left column:** a sticky TOC that mirrors the H2s exactly.
    - **Body elements:** H2/H3, numbered steps (teal numerals), a figure with an "EXHIBIT A · …" printed-form header strip and caption, a "Check before you act" callout box, a pull quote, a terminal/code block (right padding on mobile, scroll with a fade rather than overflow), an in-body subscribe prompt, and a closing "Your turn" reply-ask block.
11. **Footer.** The series list (not a day schedule), the subscribe line "New files every week. Free." (placeholder copy), and the EN/ES links.

## Logo and roundel (adapted from the current site)
- **Start from** the current asset, `public/logo-circle.webp` (served by `components/Header.js`).
- **Remove** the dark disc and the binary-digit background.
- **Keep** the warning-triangle, "!" and chevrons symbol, drawn in terracotta: `--terra-ink` at 32px and below, `--terra` at 48px and above.
- **Draw** the circle as an ink outline.
- **At ≥ 48px** (masthead) add the stamp finish: a "CRASH LOG · FILED" ring legend in DM Mono caps, a thin inner ring and a subtle ink texture.
- **At ≤ 32px** (favicon, avatar) use the simple version: outline ring and symbol only, no legend.
- `marks.png` shows old and new at 16/32/48/180 and in the masthead. Deliver it as SVG (two variants) and export the favicon set (16, 32, 180 apple-touch, 512) plus an OG avatar.
- **Open call for Hector:** at 16px the symbol reads as a small triangle with two ticks. Steam recommended keeping it; drop the chevrons at that size only if he says so.

## Responsive
- **Breakpoints in the mockup CSS:** 980px (rail stacks under the hero; grid goes to one column) and 700px (mobile type and spacing, nav becomes a scroller, labels go to 14px).
- **Mobile is designed, not squeezed:** see the `*-mobile.png` renders.
- **No horizontal overflow** at 360px.
- **EN and ES** must line up on the same edges. ES runs about 20% longer: hero dek and rail titles may take one more line, but nothing may clip.

## Accessibility and motion
- AA contrast everywhere (tokens above).
- Visible focus states on links, the toggle and buttons; the mockups don't show them, so design them in the same mono/ink language.
- The blinking bar is decorative (`aria-hidden`) and stops under reduced motion.
- The roundel has alt text "Crash Log".

## Placeholders (not part of this build's sign-off)
- Tagline, verdict wording, recent-file titles, the sample article's H1 and body, and `[Outlet]`/`[Medio]` sources.
- Real issues come from Sanity. Keep the templates content-driven.

## Acceptance criteria (observable)
1. At 1440px and 390px, every page matches its render in layout, tokens and type scale. Run a side-by-side screenshot check for home, Off the Rails and article, in EN and ES.
2. No weekday name or MON/WED/FRI label appears anywhere in rendered HTML for either locale (grep the build output).
3. The byline on every Nico's Notes item reads "Nico von Bot"; every Off the Rails and Practical item reads "Hector Luis Alamo". Test with fixtures for all three series.
4. Every series shows its colour on its chip and rail tag. The colour key labels series by name.
5. The article prose column measures `68ch` at desktop. The TOC entries equal the H2s.
6. The blinking bar animates on a 1s cycle. With `prefers-reduced-motion: reduce` emulated, it is static (Playwright test).
7. The favicon and masthead roundel use the adapted current symbol: no background, terracotta symbol, ink outline. The stamp finish appears only at ≥ 48px.
8. No horizontal scroll at 360px. The Spanish stamps don't break mid-word on mobile.
9. Text contrast ≥ 4.5:1 for every text colour used, measured by the floor harness.
10. The existing test suite and e2e pass. The web-build floor harness passes. The PR is assigned to Hector, not armed (code PR), and Hector merges it by hand after the Claude bot's verdict.

## Open questions for Hector (Ice should ask before building the data side)
- **Series in Sanity:** today the site knows `issue` and `column` (Nico's Notes). Off the Rails and Practical are new.
  - **Rec:** add a `series` field (`offTheRails` / `practical` / `nicosNotes`) that the templates read for colour, code prefix and byline, with `column` mapping to `nicosNotes`.
  - The content pipelines that fill these series are separate work on Steam.
- **Numbering:** whether OTR-/FIX- numbers start at 001 or continue the issue count.
  - **Rec:** start at 001 per series.
- **Note:** Actions billing on the org was failing as of 2026-10-30 14:40Z, so CI checks may not run until it's fixed.
