<!--
Update rules: one line per item. Check items off in place (- [x]), never delete them. Deferred or declined items
stay "- [ ]" with the reason as a clause on the same line. Organize by work area, not by date. Facts that cost a
probe or a live test go in agent-notes.md "Verified / Refuted", not here.
-->

# TODO — The Crash Log

## Already Complete

- [x] Field Manual restyle, phases 1–7 and the whole-branch review fixes — PR #24
- [x] Hector's design changes: legend, series-name colour, plain bylines — PR #25
- [x] New tagline and legend spread — PR #26; Spanish masthead tags — PR #27; short tagline below 900px — PR #28
- [x] Ship runbook: archive bylines, verdicts, About copy written to Sanity (2026-11-01)
- [x] Beehiiv removed; Subscribe is a Substack link

## Newsletter (Ghost)

- [ ] Hector picks the plan (rec: Publisher) and creates the Ghost(Pro) account — blocked on Hector (money)
- [ ] DNS on Vercel: CNAME for `newsletter.crashlog.ai`, Ghost's DKIM/SPF, `_dmarc.newsletter` at `p=none` — needs Hector's approval
- [ ] Ghost setup: EN and ES newsletters, From address, postal-address footer, email-only posts, homepage redirect
- [ ] Site: Subscribe points to Ghost's signup page; rename `lib/substack.js`; tests
- [ ] Substack: take links down (with the site change) and park or close the publication
- [ ] Later: Steam's pipeline creates email-only Ghost drafts through the Admin API (needs Portable Text to HTML)

## Content (Sanity)

- [ ] Delete the 71 unpublished story drafts — blocked on Hector ("another time")
- [ ] ES category names show in English on archive pills — Sanity content fix
- [ ] Headline typo "44%of" — Sanity content fix
- [ ] Orphan story `S9mF1lBwsv6MdFz667WGZf`: attach to issue #10 or unpublish — Hector's call
- [ ] Steam handoff for the new story fields is picked up — claude-workspace `handoffs/to-steam/2026-11-01-crash-log-new-fields.md`

## Site

- [ ] 404 pages: render the branded page on the server; ES `<title>` in Spanish
- [ ] Practical RSS feed
- [ ] Un-skip the Practical "subscribe line once" e2e check once the first Practical post exists
- [ ] Move `docs/plans/active/nicos-notes-column.md` to completed
- [ ] `@sanity/image-url`: switch to `createImageUrlBuilder`
- [ ] Next.js middleware → "proxy" convention — deferred (functional, monitor)

## Declined (reasons recorded)

- [ ] Byline "no avatar" tests catch only known avatar markup — declined (no avatar code left; Hector: stop chasing)
- [ ] Practical search test doesn't prove hidden values stay out of the index — declined (Hector: "keep the test, but stop chasing")
- [ ] Rail legend one-line test doesn't await `document.fonts.ready` — declined (`goto` waits for `load`)
