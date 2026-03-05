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
- [x] Localize SiteNav labels (Latest→Último, Archive→Archivo, About→Info)
- [x] Localize NicosTransmission label + aria-label
- [x] Localize StackTrace label (same in both, wired for future)
- [x] Localize IssueHeader prefix (Issue→Edición)
- [x] Localize DonateCTA copy + button + aria-label
- [x] Localize Footer credit text
- [x] Thread locale prop through IssueContent, about, archive, beats callers
- [x] Add ES locale tests for all 7 components (10 new tests, 220→230)
- [x] verify.sh passes (230 tests + 30 static pages)
- [ ] Populate Spanish content in Sanity for Issue #014 (editorial task for Gabo)

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
- [x] DonateCTA component tests (22 tests)
- [x] Update IssueContent test for new env var
- [x] Update `.env.local` and `CLAUDE.md` with new env vars
- [x] Thank-you toast: fixed-position overlay, auto-dismiss after 10s, covers featured image
- [x] Base URL derived from request.url (works in dev and production)
- [x] verify.sh passes (291 tests + 33 static pages)
- [x] Set `STRIPE_SECRET_KEY` in Vercel env vars (test key for preview, live key for production)
- [x] Set `NEXT_PUBLIC_DONATIONS_ENABLED=true` in Vercel env vars
- [x] Manual end-to-end test with real Stripe Checkout
- [ ] Switch to live Stripe key in Vercel production env when ready for real donations

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
