# BRIEF: About page, centered column + self-improvement loop graphic

ABOUTME: web-build intake for the crashlog.ai About page change Hector asked for on 2026-11-04.
ABOUTME: Goal, task, ambiguities, mode, medium table and budgets; Hector approves before any code.

Site: palamo   Mode: restrained (crashlog.ai)
Date: 2026-11-04   Repo: ~/workspace/palamo-studio/crash-log-site   Worktree: ~/workspace/palamo-studio/crash-log-site-wt-about-loop   Branch: feat/about-loop-motion
Request: Hector, #crash-log `1567606082858123424`: "The About page's text should be centered. Add a motion graphic that illustrates the self-improvement loop"
Approved: Hector, #crash-log `1567608251472683030` ("About page: good recs"): A center the column, paragraphs left-aligned; B play once then rest; C labels hardcoded EN/ES.

## Preflight
- Worktree off fresh origin/main: HEAD a526f14 == `git ls-remote origin main`. Main checkout untouched (on `main`, 212 behind; not used).
- Rulings read: decisions.jsonl hit for the About page: 2026-10-10 "names the model without a version ('Claude Opus')". No ruling on layout or motion for this page. Registry: crashlog.ai "no scroll spectacle"; keep red and the serif identity.
- Paid generation: none planned (no Higgsfield call). `npm ci` and tool checks run in the builder's first step.

## Goal (WHAT + WHY)
Hector wants the About page to read as a centered, composed page, and wants "How it gets better" shown, not just told: a reader should see in a few seconds that Hector's edits feed rules Nico reads before the next draft.

## Task (HOW, Nico's proposal)
1. Center the content column on the page (title, section labels, prose, masthead), keeping paragraphs left-aligned at their 62ch measure.
2. Add one inline SVG + CSS motion graphic inside "How it gets better": a ring of five steps (Nico drafts → Hector edits and publishes → a weekly script logs every change → the third repeat becomes a rule → Nico reads the rules before writing) with an arrow back to the start. EN and ES.

## Ambiguities (for Hector)
A. "Centered": center the column (rec; centered paragraphs of 60+ words are hard to read) vs center-align every line of text.
B. Motion behavior: plays once when the graphic scrolls into view, then rests on its final state (rec, restrained mode) vs loops gently forever.
C. The step labels are hardcoded in code (EN/ES); the section prose stays in Sanity. If he rewrites that section in Studio, the graphic won't follow. Rec: accept; it's a diagram, five short labels.

## Medium table
| Element | Medium | Notes |
|---|---|---|
| Step labels | HTML (`<ol>`, real text, both locales) | screen readers read the list in order |
| Ring, arrow, travelling marker, tally ticks | inline SVG | `aria-hidden` |
| Motion | CSS keyframes, started by a tiny IntersectionObserver client component adding a class | no new dependency |
| Reduced motion | final state, static | no animation runs |

## Budgets
- No paid assets. No new dependency. JS added: one small client component (< 1 KB gz).
- Performance floor: LCP unchanged (graphic is below the fold), CLS no worse than baseline (graphic reserves its height).

## Done (observable)
- /en/about and /es/about: content column centered at 1440 px and 1024 px; mobile unchanged in width.
- The graphic shows five labelled steps in the right locale, plays once on entering view, and shows the final state with `prefers-reduced-motion: reduce`.
- Floor harness: no FAIL. design-critic (opus) PASS below the hero. Existing test suite green.
