# The Crash Log — Implementation TODO

## Phase 1: Project Foundation

- [x] Initialize Next.js app with App Router
- [x] Install Sanity dependencies
- [x] Create project directory structure
- [x] Set up Sanity client (`lib/sanity.js`)
- [x] Embed Sanity Studio at `/studio`
- [x] Create `globals.css` with design tokens
- [x] Set up root layout with Google Fonts
- [x] Create middleware for locale detection
- [x] Create locale-scoped layout
- [x] Create CLAUDE.md

## Phase 2: Sanity Schemas

- [x] Localized field types (localizedString, localizedText, localizedBlockContent)
- [x] Base blockContent type
- [x] Object types (stackTraceHit, sourceLink)
- [x] Issue document schema
- [x] Story document schema
- [x] Category document schema
- [x] Agent document schema
- [x] About page document schema
- [x] Site settings document schema
- [x] Register all schemas in sanity.config.js

## Phase 3: React Components

- [x] SeverityBadge
- [x] Header (masthead wordmark, tagline, subscribe button, language toggle)
- [x] SiteNav (Latest, Archive, Beats, About links)
- [x] StoryBlock (full article section with severity-driven styling)
- [x] NicosTransmission (editorial intro card with red left border)
- [x] StackTrace (collapsible section with trace items)
- [x] LanguageToggle (EN/ES toggle button, client component)
- [x] DonateCTA (donate card with "Feed the Bots" button)
- [x] Footer (copyright, links)
- [x] IssueHeader (issue meta, title, subtitle)
- [x] CoverImage (cover image with Sanity image URL builder)
- [x] FallbackBanner ("Versión en español próximamente" banner)

## Phase 4: Issue Pages + Locale Infrastructure

- [x] Route group restructure — `(site)/[locale]` and `(studio)` with independent root layouts
- [x] `lib/locale.js` — LOCALES, LOCALE_LABELS, LOCALE_OG, t(), hasFullTranslation()
- [x] `lib/queries.js` — GROQ queries + null-safe fetch wrappers
- [x] `lib/portableText.js` — Portable Text component config
- [x] `lib/sanity.js` — null-safe client for placeholder env values
- [x] `components/IssueContent.js` — shared issue renderer composing all Phase 3 components
- [x] `app/(site)/[locale]/page.js` — latest issue page with dynamic metadata
- [x] `app/(site)/[locale]/issue/[slug]/page.js` — individual issue page with JSON-LD

## Phase 4.5: SEO Foundation

- [x] Dynamic `<html lang>` per locale via route groups
- [x] `generateMetadata` with title template, OG, Twitter card, alternates
- [x] JSON-LD WebSite schema on site layout
- [x] JSON-LD NewsArticle + BreadcrumbList on issue pages
- [x] `app/robots.js` — disallow Studio, crawl-delay for bots
- [x] `app/sitemap.js` — all locales, hreflang alternates, x-default
- [x] Studio layout with `noindex` robots meta
- [x] `<Header>`, `<LanguageToggle>`, `<SiteNav>` in shared site layout chrome

## Phase 5: Archive, About, Beat Pages

- [x] GROQ queries: `getAllIssuesForArchive`, `getAboutPage`, `getAllCategories`, `getCategoryWithStories`
- [x] `components/ArchiveCard.js` — issue card for archive listing
- [x] `components/AgentCard.js` — masthead card for about page
- [x] `components/BeatStoryCard.js` — story card for beat pages
- [x] `app/(site)/[locale]/archive/page.js` — archive listing with empty state
- [x] `app/(site)/[locale]/about/page.js` — about page with hardcoded fallback + Sanity path
- [x] `app/(site)/[locale]/beats/page.js` — beats index with category cards
- [x] `app/(site)/[locale]/beat/[slug]/page.js` — beat detail with stories
- [x] `app/sitemap.js` — added `/beats` and dynamic beat entries

## Phase 6: Verification + Content Seeding

- [x] Create `scripts/verify.sh`
- [x] Deploy Sanity schema to cloud (`npx sanity schema deploy`)
- [x] Seed 7 categories (Medical AI, Defense & Policy, Labor & Automation, Surveillance & Privacy, Foundation Models, Regulation & Governance, Robotics & Hardware)
- [x] Seed 6 agents (Nico, Scoop, Root, Gabo, Lupe, Hector) with bios and spawnedBy refs
- [x] Seed siteSettings (name, tagline, editor, UI strings EN+ES)
- [x] Seed 3 stories for Issue #014 (ERROR, OVERRIDE, TERMINATE) with body, categories, sources
- [x] Seed Issue #014 (title, subtitle, stack trace, story refs, Nico's Transmission)
- [x] Seed aboutPage (intro, workflow, contactCTA, masthead refs)
- [x] Publish all 19 documents
- [x] Test EN rendering — all pages return 200 with correct content
- [x] Test ES fallback banner — visible on ES home
- [x] Build gate passes (`scripts/verify.sh`)
- [x] Update tracking docs

## Phase 7: Test Framework Setup

- [x] Install Vitest + base config (`vitest.config.mjs`)
- [x] Custom Vite plugin for JSX-in-`.js` files
- [x] Install React Testing Library + jest-dom + user-event
- [x] Shared mocks for next/image, next/link, next/navigation
- [x] Unit tests: `lib/locale.js` (16 tests)
- [x] Unit tests: `lib/sanity.js` (11 tests)
- [x] Unit tests: `lib/queries.js` (27 tests)
- [x] Unit tests: `lib/portableText.js` (12 tests)
- [x] Component tests: SeverityBadge, Footer, FallbackBanner, DonateCTA, IssueHeader, NicosTransmission (27 tests)
- [x] Component tests: AgentCard, Header, SiteNav, StoryBlock, ArchiveCard, BeatStoryCard, CoverImage (54 tests)
- [x] Component tests: StackTrace, LanguageToggle, IssueContent (29 tests)
- [x] Integration tests: middleware (12 tests), robots.js (8 tests)
- [x] Install Playwright + Chromium
- [x] E2E tests: home, navigation, locale-switching, empty-state (14 tests)
- [x] Update `scripts/verify.sh` to run tests before build
- [x] Update tracking docs

## Phase 8: Developer Tooling + Features

- [x] ESLint 9 + Prettier setup (flat config, eslint-config-next, codebase formatted)
- [x] CI pipeline (GitHub Actions: push/PR to main → lint + tests + build)
- [x] RSS feeds (locale-specific at `/[locale]/feed.xml`, 8 integration tests)
- [x] Dynamic OG images (site-level + per-issue, dark theme, Inter font, Twitter card re-exports)
- [x] Social profile URLs in JSON-LD (sameAs with Twitter)
- [x] RSS feed discovery link in site metadata
- [x] Updated verify.sh (lint + format check + tests + build)

## Phase 9: Beehiiv Integration + Social Media

- [x] Fix Twitter handle: `@thecrashlog` → `@crashLogNews` in metadata + JSON-LD
- [x] Add Instagram to `sameAs` array in JSON-LD
- [x] Add X and Instagram text links to Footer (2 tests)
- [x] Create `POST /api/subscribe` route (Beehiiv proxy, 9 integration tests)
- [x] Create `SubscribeForm` client component with inline expansion UX (16 tests)
- [x] Replace Header placeholder subscribe button with `SubscribeForm`
- [x] Add Beehiiv credentials to `.env.local`
- [x] Live-test Beehiiv integration (confirmed working)

## Phase 10: Spanish Locale UI Chrome

- [x] Localize Header tagline (EN/ES LABELS)
- [x] Localize SiteNav labels (Latest→Último, Archive→Archivo, Beats→Temas, About→Sobre)
- [x] Localize NicosTransmission label + aria-label
- [x] Localize StackTrace label (same in both, wired for future)
- [x] Localize IssueHeader prefix (Issue→Edición)
- [x] Localize DonateCTA copy + button + aria-label
- [x] Localize Footer credit text
- [x] Thread locale prop through IssueContent, about, archive, beats callers
- [x] Add ES locale tests for all 7 components (10 new tests, 220→230)
- [x] verify.sh passes (230 tests + 30 static pages)
- [x] ~~Populate Spanish content in Sanity for Issue #014~~ (Issue #014 removed; only Issue #001 exists)

## Post-Subscribe Thank-You Page

- [x] Create `BeehiivRecommendations` env-gated widget slot component
- [x] Create `ThankYouContent` bilingual page content component + CSS module
- [x] Create `app/(site)/[locale]/subscribe/thank-you/page.js` with noindex metadata
- [x] Modify `SubscribeForm` to redirect after 1.5s on new-subscriber success
- [x] ThankYouContent tests (12 tests)
- [x] BeehiivRecommendations tests (6 tests)
- [x] SubscribeForm redirect tests (3 tests)
- [x] Thank-you page metadata integration tests (2 tests)
- [x] verify.sh passes (253 tests + 32 static pages)
- [ ] Activate Beehiiv Recommendations widget when available (set `NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL`)

## Stripe Checkout Donation ("Feed the Bots")

- [x] Install `stripe` dependency
- [x] Create `POST /api/donate` route (Stripe Checkout Sessions, amount validation, return URL sanitization)
- [x] Convert `DonateCTA` to client component (amount form, loading/error/thank-you states, Suspense boundary)
- [x] Update `DonateCTA.module.css` (form, input, disclaimer, error, thanks styles)
- [x] Add tax disclaimer (EN/ES)
- [x] Update `next/navigation` mock with `useSearchParams`
- [x] Donate API integration tests (16 tests)
- [x] DonateCTA component tests (25 tests)
- [x] Update IssueContent test for new env var
- [x] Update `.env.local` and `CLAUDE.md` with new env vars
- [x] Thank-you toast: fixed-position overlay, auto-dismiss after 10s, covers featured image
- [x] Base URL derived from request.url (works in dev and production)
- [x] verify.sh passes (292 tests + 33 static pages)
- [x] Set `STRIPE_SECRET_KEY` in Vercel env vars (test key for preview, live key for production)
- [x] Set `NEXT_PUBLIC_DONATIONS_ENABLED=true` in Vercel env vars
- [x] Manual end-to-end test with real Stripe Checkout
- [x] Switch to live Stripe key in Vercel production env

## Logo & Agent Headshot Integration

- [x] Convert circle logo to `app/icon.png` (180×180 PNG) and `app/apple-icon.png`
- [x] Copy logo webp to `public/logo-circle.webp` for Header
- [x] Delete old `app/favicon.ico`
- [x] Update Header component: logo image + wordmark text in flex layout
- [x] Update Header CSS: `.wordmark` flex container, `.logo`, `.wordmarkText`, mobile responsive
- [x] Add Header logo tests (2 new tests)
- [x] Rename `heashot.png` → `me.png`
- [x] Create `scripts/upload-avatars.mjs` upload script
- [x] Add `images.remotePatterns` for `cdn.sanity.io` in `next.config.mjs`
- [x] Update AgentCard: `image` prop with conditional avatar/dot rendering
- [x] Update AgentCard CSS: `overflow: hidden`, `.avatarImage`
- [x] Pass `image={agent.avatar}` in About page SanityAbout section
- [x] Add AgentCard avatar tests (2 new tests)
- [x] verify.sh passes (296 tests + 33 static pages)
- [x] Upload headshots to Sanity (all 6 agents have avatars)
- [x] Enlarge avatars to 120×120 (88px mobile), improve typography hierarchy
- [x] Spanish About page: fall back to FallbackAbout with Sanity avatars when no ES Sanity content
- [x] Localize fallback masthead bios and roles (EN/ES)
- [x] Update contact email to `info@palamostudio.com` (code + Sanity), remove duplicate email
- [x] Fix loadEnv: ENOENT handling + quote stripping (CodeRabbit review)
- [x] verify.sh passes (296 tests + 33 static pages)

## UI Polish & Layout Fixes

- [x] Header 50% bigger (logo 36→54px, wordmark 28→42px)
- [x] Agent headshots 50% bigger (avatars 120→180px, mobile 88→132px)
- [x] Layout widened (`--max-width` 720→960px)
- [x] SiteNav active state fix (client component with `useSelectedLayoutSegment`)
- [x] Email link visible in English About page (CSS + Sanity content fix)
- [x] Spanish formality: "Suscribirse" → "Suscríbete"
- [x] Beats page: hide categories with 0 stories

## Severity System Refactor

- [x] Change severity from enum to free-text in Sanity schema
- [x] Create `lib/storyColors.js` color cycle utility
- [x] Update SeverityBadge/StoryBlock to accept `colorKey` prop
- [x] Update IssueContent, ArchiveCard, BeatStoryCard, beat detail page
- [x] Deploy updated schema to Sanity cloud
- [x] Update tests (295 tests passing)

## ~~Issue #015 — "Trust Is the Product Now"~~ (removed)

- [x] ~~Seeded and wired but content was removed; only Issue #001 exists~~

## Studio & Infrastructure Fixes

- [x] Add `basePath: "/studio"` to sanity.config.js (fixes "Tool not found: studio" error)
- [x] Add CORS origin `http://localhost:3001` for local Studio development
- [x] Remove unused `getStoryColorKey` import from BeatStoryCard (CodeRabbit review)

## Issue #001 — Gold-Standard Training Upload

- [x] Create 4 story documents (EXPLOIT, OVERRIDE, ACCESS_DENIED, RUNTIME_ERROR) with full EN/ES Portable Text bodies, link annotations, structured sources
- [x] Patch category references (Surveillance & Privacy, Foundation Models ×2, Regulation & Governance)
- [x] Create issue document with issueNumber, slug, publishDate, title/subtitle, nicosTransmission (EN/ES), stackTrace (3 hits), metaDescription, beehiivStatus
- [x] Patch story references onto issue (weak refs with \_strengthenOnPublish)
- [x] ~~OpenClaw tasks~~ (failed draft already discarded, no drafts remain in Sanity)

## Build Fix + Revalidation

- [x] Fix dotted document IDs — re-create 3 stories with UUID-based IDs, update issue #001 refs, delete old docs
- [x] Add `.filter(Boolean)` to IssueContent.js stories array (defensive null filtering)
- [x] Add `sanityFetch` wrapper in `lib/sanity.js` with `{ next: { revalidate: 3600 } }`
- [x] Migrate all 9 fetchers in `lib/queries.js` to use `sanityFetch`
- [x] Create `POST /api/revalidate` webhook endpoint with HMAC signature validation
- [x] Add `SANITY_REVALIDATE_SECRET` to `.env.local`
- [x] Tests: sanityFetch (4), null story handling (1), revalidate API (8), updated queries (5 new)
- [x] verify.sh passes (313 tests + 21 static pages)
- [x] Add `SANITY_REVALIDATE_SECRET` to Vercel env vars
- [x] Configure Sanity webhook in manage.sanity.io (POST to /api/revalidate on CRUD)
- [x] Deploy to Vercel and verify revalidation works

## UI Comfort + SEO Fixes

- [x] Brighten text color scale (secondary, tertiary, muted, faint)
- [x] Desaturate severity colors ~15-20% (error, override, warning, critical, breach)
- [x] Update severity glows and agent accents to match
- [x] Improve surface/border contrast
- [x] Remove font smoothing override (`-webkit-font-smoothing`, `-moz-osx-font-smoothing`)
- [x] Soften selection highlight and focus ring
- [x] Remove subtitle opacity on IssueHeader
- [x] Bump section heading sizes (11→12px) and color (faint→muted) on archive/beats/about
- [x] Bump nav link size (12→13px)
- [x] Bump Stack Trace description text (15→16px, line-height 1.6→1.7)
- [x] Increase story block spacing (56→72px) and Stack Trace item gap (20→28px)
- [x] Add Stack Trace link styles
- [x] Homepage canonical + hreflang alternates
- [x] Branded locale-aware 404 page with noindex
- [x] Stack Trace source URLs rendered as clickable external links
- [x] RSS language codes: `en-US`/`es-ES` → lowercase `en-us`/`es-es` per RSS spec
- [x] Heading hierarchy: h2→h1 on archive, beats, beat detail pages; h1 added to about page
- [x] JSON-LD: dateModified, image, mainEntityOfPage on NewsArticle
- [x] `_updatedAt` added to GROQ issue projection
- [x] CoverImage alt fallback: "Cover image" → "Cover image for The Crash Log newsletter"
- [x] Portable Text image alt fallback: "" → "Article image"
- [x] Tests: NotFound (6), StackTrace URL (2), updated CoverImage alt + RSS lang tests
- [x] verify.sh passes (319 tests + 21 static pages)

## Beehiiv Newsletter Sending

- [x] Phase 1: Subscribe flow passes locale to Beehiiv as custom_fields
- [x] Phase 2: Portable Text to HTML converter (`lib/portableTextToHtml.js`)
- [x] Phase 3: Email template builder (`lib/emailTemplate.js`) with inline CSS, bilingual labels
- [x] Phase 4: `POST /api/send-newsletter` route with auth, EN+ES draft creation
- [x] Phase 5: Sanity Studio document action (`sanity/actions/sendNewsletterAction.js`)
- [x] Phase 6: `beehiivPostIds` schema field for idempotency tracking
- [x] Security: `escapeHtml`/`sanitizeHref` in `lib/htmlUtils.js`, auth on send-newsletter endpoint
- [x] Tests: 89 new tests (319→408), verify.sh passes
- [x] Deploy Sanity schema (`npx sanity@latest schema deploy`) — required .jsx rename for CLI compatibility
- [x] Set `SEND_NEWSLETTER_SECRET` + `NEXT_PUBLIC_SEND_NEWSLETTER_SECRET` in `.env.local` and Vercel (same value)
- [x] Beehiiv setup: `locale` custom field created, EN/ES audience segments created (Dynamic, OR for EN)
- [x] Deploy to Vercel
- [ ] Manual end-to-end test: Studio action → Beehiiv draft creation

## Nico's Notes — Weekly Column

ExecPlan: `docs/plans/active/nicos-notes-column.md`

### Phase 1: Schema & Studio (done)

- [x] Create `sanity/schemas/column.js` (columnNumber, slug, publishDate, status, coverImage, coverImageAlt, coverImagePrompt, title, subtitle, body, metaDescription, beehiivStatus, beehiivPostIds)
- [x] Register column schema in `sanity.config.js`
- [x] Create `SendColumnNewsletterAction` Studio action (separate from issue action)
- [x] Attach column action in `sanity.config.js`
- [x] 12 unit tests for action

### Phase 2: Locale + Data Layer (done)

- [x] Parameterize `hasFullTranslation()` with `bodyField` option (backward-compatible)
- [x] Add 6 GROQ queries + fetch wrappers to `lib/queries.js` (getLatestColumn, getColumnBySlug, getAllColumnSlugs, getAllColumnsForArchive, getColumnsForFeed, getAllColumnsSummary)
- [x] 3 new locale tests, 17 new query tests

### Phase 3: Column Email Template + API (done)

- [x] `lib/columnEmailTemplate.js` — `buildColumnEmailHtml()` + `buildColumnEmailSubject()`
- [x] `app/api/send-column-newsletter/route.js` — Separate POST handler
- [x] 15 email template tests, 11 API integration tests

### Phase 4: Routes + Components (done)

- [x] `components/ColumnContent.js` + `.module.css` — Column detail renderer
- [x] `components/ColumnCard.js` + `.module.css` — Archive listing card
- [x] `components/NicosNotesWidget.js` + `.module.css` — Home page sidebar widget
- [x] `app/(site)/[locale]/nico/[slug]/page.js` — Column detail page (metadata, Article + BreadcrumbList JSON-LD, static params)
- [x] `app/(site)/[locale]/nico/page.js` — Column archive page
- [x] `app/(site)/[locale]/nico/feed.xml/route.js` — Column RSS feed
- [x] 13 ColumnContent, 8 ColumnCard, 10 Widget, 6 RSS tests

### Phase 5: Home Page Layout + Navigation + SEO (done)

- [x] `app/globals.css` — Added `--max-width-wide: 1200px` token
- [x] `app/(site)/[locale]/page.js` — Two-column grid, parallel fetch issue + column
- [x] `app/(site)/[locale]/home.module.css` — CSS Grid (1fr + 320px sidebar, mobile stack)
- [x] `components/SiteNav.js` — Added "Nico's Notes" / "Notas de Nico" (5 nav items)
- [x] `app/sitemap.js` — Added `/nico` static page + dynamic column entries
- [x] Updated SiteNav tests (9 → 10 tests)
- [x] verify.sh passes (504 tests + 39 static pages)

### Phase 6: E2E + Deploy + Docs

- [x] Add Playwright e2e tests: 6 tests (archive EN/ES, empty state, nav, locale toggle, page structure)
- [x] Deploy Sanity schema: `npx sanity@latest schema deploy`
- [x] Commit all changes
- [x] Update tracking docs (agent-notes, TODO, MEMORY)

## Sanity Content Localization

- [x] Push Spanish bios into all 6 agent documents in Sanity
- [x] Push Spanish translations into aboutPage (introParagraph, workflowSection, contactCTA)
- [x] Publish all updated documents
- [x] Spanish About page now renders via `SanityAbout` (no longer uses `FallbackAbout`)
- [x] Remove `max-width: 640px` from about page text sections (intro, workflow, contact)
- [x] Fix column email subject: localize prefix for Spanish ("Notas de Nico" vs "Nico's Notes")

## Deferred

- [x] Provision Sanity project (project `msr24cg4`, dataset `production`)
- [x] Beehiiv integration
- [x] RSS feeds
- [x] Test framework setup (unit, integration, e2e)
- [x] CI pipeline
- [x] Vercel deployment — deployed to `crashlog.ai`, CORS origin added, domain URLs updated
- [x] OG image assets (dynamic via next/og ImageResponse)
- [x] Twitter handle verification (@crashLogNews) — verified
- [x] Social profile URLs in JSON-LD
- [x] Linter/formatter setup
- [x] Add Beehiiv env vars to Vercel for production
- [x] Beehiiv recommendation modal redirect (post-subscribe thank-you page)
