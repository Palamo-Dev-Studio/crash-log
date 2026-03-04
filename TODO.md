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
- [x] Unit tests: `lib/sanity.js` (7 tests)
- [x] Unit tests: `lib/queries.js` (20 tests)
- [x] Unit tests: `lib/portableText.js` (12 tests)
- [x] Component tests: SeverityBadge, Footer, FallbackBanner, DonateCTA, IssueHeader, NicosTransmission (27 tests)
- [x] Component tests: AgentCard, Header, SiteNav, StoryBlock, ArchiveCard, BeatStoryCard, CoverImage (54 tests)
- [x] Component tests: StackTrace, LanguageToggle, IssueContent (29 tests)
- [x] Integration tests: middleware (12 tests), robots.js (8 tests)
- [x] Install Playwright + Chromium
- [x] E2E tests: home, navigation, locale-switching, empty-state (14 tests)
- [x] Update `scripts/verify.sh` to run tests before build
- [x] Update tracking docs

## Deferred
- [x] Provision Sanity project (project `msr24cg4`, dataset `production`)
- [ ] Beehiiv integration (webhook + API)
- [ ] RSS feeds
- [x] Test framework setup (unit, integration, e2e)
- [ ] CI pipeline
- [x] Vercel deployment — deployed to `crashlog.ai`, CORS origin added, domain URLs updated
- [ ] OG image assets (static or dynamic)
- [ ] Twitter handle verification (@thecrashlog)
- [ ] Social profile URLs in JSON-LD
- [ ] Linter/formatter setup
