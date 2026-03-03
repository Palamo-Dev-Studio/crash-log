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
- [ ] Header (masthead wordmark, tagline, subscribe button, language toggle)
- [ ] SiteNav (Latest, Archive, Beats, About links)
- [ ] StoryBlock (full article section with severity-driven styling)
- [ ] NicosTransmission (editorial intro card with red left border)
- [ ] StackTrace (collapsible section with trace items)
- [ ] LanguageToggle (EN/ES toggle button, client component)
- [ ] DonateCTA (donate card with "Feed the Bots" button)
- [ ] Footer (copyright, links)
- [ ] IssueHeader (issue meta, title, subtitle)
- [ ] CoverImage (cover image with Sanity image URL builder)
- [ ] FallbackBanner ("Versión en español próximamente" banner)

## Phase 4: Issue Page + Locale Infrastructure
- [ ] `lib/locale.js` — t() helper and hasFullTranslation()
- [ ] `lib/queries.js` — GROQ queries
- [ ] `app/[locale]/page.js` — latest issue page
- [ ] `app/[locale]/issue/[slug]/page.js` — individual issue page

## Phase 5: Archive, About, Beat Pages
- [ ] `app/[locale]/archive/page.js`
- [ ] `app/[locale]/about/page.js`
- [ ] `app/[locale]/beat/[slug]/page.js`

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
