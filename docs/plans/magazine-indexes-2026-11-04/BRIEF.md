# BRIEF: magazine layout for the series indexes and "Recent files"

ABOUTME: web-build intake for crashlog.ai's index pages (Off the Rails, Practical, Nico's Notes) and the homepage "Recent files" block.
ABOUTME: Approved by Hector 2026-11-04 (#crash-log 1567608251472683030, "redesign: good recs").

Site: palamo   Mode: restrained (crashlog.ai)
Date: 2026-11-04   Repo: ~/workspace/palamo-studio/crash-log-site   Worktree: ~/workspace/palamo-studio/crash-log-site-wt-magazine   Branch: feat/magazine-indexes
Request: Hector, #crash-log `1567607173318574213`: "These bare lists leave much to be desired. Can't we implement more of a magazine layout, with a featured image and at least a subtitle for each item?" (screenshots: homepage Recent files, /off-the-rails, /practical, /nico indexes)

## Preflight
- Worktree off fresh origin/main, HEAD == `git ls-remote origin main`. Main checkout untouched.
- Rulings: no logged ruling on index layout (decisions.jsonl grep). Registry: keep red and the serif identity, no scroll spectacle.
- Data (Sanity, 2026-11-04): every published item has `coverImage` and `subtitle`: issue 26/26, column 23/23, practical 1/1. Covers are 16:9, no burned-in text. No paid generation.

## Goal
Index pages read like a magazine: each piece shows its featured image and subtitle, so a reader can choose by picture and promise, not title alone.

## Task (approved)
- Series indexes (Off the Rails, Practical, Nico's Notes): newest piece as a LEAD (large 16:9 image, file code + date + byline in mono, serif title, full subtitle), then a card GRID: 3 columns desktop, 2 tablet, 1 phone. Card = 16:9 image, file code + date (mono), serif title, subtitle clamped to 3 lines, byline.
- Homepage "Recent files": a row of 3 cards instead of 5 rows.
- Archive search results: unchanged (rows).
- Keep file codes and their series colours, serif titles, mono labels.
- Issue 27's Gemini watermark: accepted by Hector; no crop work.

## Medium
| Element | Medium |
|---|---|
| Titles, subtitles, labels | HTML text, both locales (subtitle is localized: use the site's `t()` helper) |
| Images | Sanity image via the site's existing image path, `sizes` set per layout, lead image eager + priority on index pages, all others lazy; alt from `coverImageAlt` (localized) or empty alt when missing |
| Motion | none |

## Budgets
- No new dependency, no paid assets. LCP ≤ 2.5 s mobile on each index; CLS no worse than baseline (images reserve 16:9 space).

## Done (observable)
- /en and /es: off-the-rails, practical, nico indexes show a lead + card grid with image, title, subtitle; homepage shows 3 cards in Recent files; archive search unchanged.
- 1440 / 1024 / 768 / 390 px: 3 / 3 / 2 / 1 columns; no overflow; Practical with one item shows only the lead.
- Floor harness: no FAIL. design-critic (opus) PASS below the hero. Full test suite green, new tests fail without the change.
