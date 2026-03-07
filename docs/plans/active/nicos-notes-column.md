# ExecPlan: Nico's Notes — Weekly Column

## Context

Nico's Notes is a weekly column where Nico (the AI managing editor) offers ~600 words reflecting on the past week and looking ahead. Published every Sunday, starting 2026-03-07. Separate from the main newsletter issues but also distributed via Beehiiv.

## Requirements

- **WHAT:** A new `column` document type in Sanity, with dedicated routes, archive, RSS feed, email template, and Beehiiv integration.
- **WHY:** Editorially distinct from the crash-report newsletter — different cadence (weekly Sunday), different format (single-author essay), different purpose (reflection + preview). Deserves its own content type and presentation.

## Key Decisions

- **Route:** `/[locale]/nico/[slug]` for individual columns, `/[locale]/nico` for the archive
- **Slug:** Auto-generated from publish date (e.g., `2026-03-07`). First column: 2026-03-07, then every Sunday.
- **Numbering:** Sequential like issues (Column #001, #002, etc.)
- **RSS:** Separate feed at `/[locale]/nico/feed.xml`
- **Beehiiv:** Columns get emailed to subscribers (same send flow as issues)
- **Home page:** Sidebar widget showing latest column with title, date, excerpt, "Read" link, and "See all" link to archive
- **Cover image:** Each column has its own cover image (same as issues)
- **Author:** Always Nico (hardcoded in schema/UI, no author reference needed)

## Phases

### Phase 1: Schema & Data Layer

1. Create `sanity/schemas/column.js` with fields:
   - `columnNumber` (number, required) — sequential
   - `slug` (slug, auto-generated from publish date as YYYY-MM-DD)
   - `publishDate` (datetime)
   - `status` (string: draft/review/scheduled/published)
   - `coverImage` (image with hotspot)
   - `coverImageAlt` (localizedString)
   - `coverImagePrompt` (text)
   - `title` (localizedString) — e.g., "Week in Review: The Reckoning Continues"
   - `subtitle` (localizedString)
   - `body` (localizedBlockContent) — the ~600-word essay
   - `metaDescription` (localizedText)
   - `beehiivStatus` (string: not_sent/queued/sent)
   - `beehiivPostIds` (object: { en, es }, readOnly)
   - Groups: English, Espanol, Meta (same pattern as issue)
2. Register in `sanity.config.js` — import + add to types array
3. Attach `SendNewsletterAction` to column documents (or create column-specific variant)
4. Add GROQ queries + fetch wrappers to `lib/queries.js`:
   - `getColumnBySlug(slug)`
   - `getAllColumnSlugs()`
   - `getAllColumnsForArchive()`
   - `getColumnsForFeed()`
   - `getLatestColumn()` — for the home page widget

### Phase 2: Routes & Pages

5. Column detail page: `app/(site)/[locale]/nico/[slug]/page.js`
   - `generateStaticParams` for all column slugs x locales
   - `generateMetadata` with OG, Twitter, hreflang, canonical
   - JSON-LD: `Article` + `BreadcrumbList`
   - Render column content (cover image, title, body, signature)
6. Column archive page: `app/(site)/[locale]/nico/page.js`
   - List all published columns with cards
   - Bilingual metadata
7. Components:
   - `ColumnContent.js` — detail view (cover image, header, body, signature)
   - `ColumnCard.js` — archive listing card (similar to ArchiveCard)
   - `NicosNotesWidget.js` — compact home page widget (latest column teaser)

### Phase 3: SEO & Distribution

8. Sitemap: add column entries + `/nico` archive page to `app/sitemap.js`
9. RSS: create `app/(site)/[locale]/nico/feed.xml/route.js` (separate column feed)
10. Navigation: add "Nico's Notes" link to `SiteNav`

### Phase 4: Newsletter Integration

11. Email template: `buildColumnEmailHtml()` + `buildColumnEmailSubject()` in `lib/emailTemplate.js` (or new file if too large)
12. Extend `/api/send-newsletter` to handle `type: "column"` (or separate endpoint)
13. Attach sending action to column documents in `sanity.config.js`

### Phase 5: Tests

14. Unit tests: column queries, email template functions
15. Component tests: ColumnContent, ColumnCard, NicosNotesWidget
16. Integration tests: column detail page, column archive page, column RSS feed, column newsletter API
17. E2E: column page loads, archive lists columns

### Phase 6: Home Page Widget

18. Build `NicosNotesWidget` component with latest column data
19. Integrate into home page layout (sidebar or prominent aside)
20. Style with Nico's red accent for visual distinction
21. Tests for widget component

## Acceptance Criteria

- `scripts/verify.sh` passes with all new tests
- Column detail page renders at `/en/nico/2026-03-07` with full metadata
- Column archive page renders at `/en/nico` with listing
- RSS feed at `/en/nico/feed.xml` includes columns
- Sitemap includes column entries
- SiteNav includes "Nico's Notes" link
- Home page shows latest column widget
- Beehiiv newsletter sending works for columns
- All pages bilingual (EN/ES) with proper hreflang
