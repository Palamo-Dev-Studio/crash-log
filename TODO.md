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
- [ ] `app/(site)/[locale]/archive/page.js`
- [ ] `app/(site)/[locale]/about/page.js`
- [ ] `app/(site)/[locale]/beat/[slug]/page.js`

## Phase 6: Verification + Docs
- [ ] Create `scripts/verify.sh`
- [ ] Seed issue #014 content (or create migration script)
- [ ] Seed categories, agents, siteSettings
- [ ] Test EN rendering
- [ ] Test ES fallback banner
- [ ] Test language toggle
- [ ] Update tracking docs

## Deferred
- [ ] Provision Sanity project (replace .env.local placeholders)
- [ ] Beehiiv integration (webhook + API)
- [ ] RSS feeds
- [ ] Test framework setup (unit, integration, e2e)
- [ ] CI pipeline
- [ ] Vercel deployment config
- [ ] OG image assets (static or dynamic)
- [ ] Twitter handle verification (@thecrashlog)
- [ ] Social profile URLs in JSON-LD
