# Agent Notes — The Crash Log

## Current State

- **Branch:** `main`
- **Build:** `npm run build` passes cleanly (Next.js 16.1.6 Turbopack)
- **Tests:** None yet (no test framework configured)
- **Verification script:** Not yet created
- **Components:** 16 total (12 Phase 3 + IssueContent + ArchiveCard + AgentCard + BeatStoryCard)
- **Routes:** `/[locale]` (home), `/[locale]/issue/[slug]`, `/[locale]/archive`, `/[locale]/about`, `/[locale]/beats`, `/[locale]/beat/[slug]`, `/studio`, `/robots.txt`, `/sitemap.xml`

## What's Done

- **Phase 1 (Project Foundation):** Next.js app with App Router, Sanity client, Studio at `/studio`, global CSS with design tokens, Google Fonts, locale middleware, root redirect.
- **Phase 2 (Sanity Schemas):** All schemas — 6 object types, 6 document types. Field groups for EN/ES/Meta editing.
- **Phase 3 (React Components):** All 12 components complete with CSS Modules. UI design review applied.
- **Phase 4 (Issue Pages + Locale Infrastructure):** Route group restructure splits app into `(site)` and `(studio)` groups — each with its own root layout and `<html>` tag. Dynamic `lang` attribute per locale. Locale utilities (`lib/locale.js`), GROQ queries (`lib/queries.js`), Portable Text config (`lib/portableText.js`). `IssueContent` component composes all Phase 3 components. Latest issue page and individual issue page with dynamic `generateMetadata`. Sanity client made null-safe for pre-provisioning.
- **Phase 4.5 (SEO Foundation):** JSON-LD schemas (WebSite, NewsArticle, BreadcrumbList). `robots.js` with crawl-delay for AI bots. `sitemap.js` with hreflang alternates and x-default. Studio layout with noindex. Shared site chrome (Header, LanguageToggle, SiteNav) in root layout.
- **Phase 5 (Archive, About, Beat Pages):** Archive page with ArchiveCard component. About page with hardcoded fallback content (from approved draft) + Sanity override path. Beats index with category cards. Beat detail with BeatStoryCard component. 4 new GROQ queries in `lib/queries.js`. Sitemap updated with `/beats` and dynamic beat entries. All SiteNav links now resolve.

## Immediate Next Step

Phase 6: Verification + Docs — create `scripts/verify.sh`, seed content, test rendering. Alternatively, provision Sanity project to test with real data.

## Known Issues / Deferred Items

- Sanity project not yet provisioned — `.env.local` has placeholder values. Client handles this gracefully (null-safe).
- Next.js 16 deprecation warning: middleware file convention deprecated in favor of "proxy".
- No test framework, linter, or CI pipeline configured yet.
- Beehiiv integration, RSS feeds, and content seeding are deferred.
- OG image assets not yet created. Twitter handle (@thecrashlog) not verified.
- `metadataBase` URL set to `https://thecrashlog.com` — update if domain changes.
