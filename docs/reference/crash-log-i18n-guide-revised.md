# The Crash Log — i18n Implementation Guide (Revised)

Language toggle with Latin American Spanish. One document, bilingual
fields, zero drift risk. Powered by Sanity + Next.js App Router.

**Revision note:** Original plan used document-level localization
(two docs per issue linked via `localizedCounterpart`). Nico flagged
the sync risk — two publish states, two validation surfaces, easier
to drift. For a tightly paired newsletter like Crash Log, field-level
bilingual fields on a single document are cleaner and safer. This
revision adopts that model.

---

## 1. Localized String Helper Type

Define a reusable object type for any field that needs EN + ES.

```js
// sanity/schemas/objects/localizedString.js

export default {
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fields: [
    {
      name: 'en',
      title: '🇺🇸 English',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'es',
      title: '🇲🇽 Español',
      type: 'string',
    },
  ],
};
```

```js
// sanity/schemas/objects/localizedText.js

export default {
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    {
      name: 'en',
      title: '🇺🇸 English',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'es',
      title: '🇲🇽 Español',
      type: 'text',
    },
  ],
};
```

```js
// sanity/schemas/objects/localizedBlockContent.js

export default {
  name: 'localizedBlockContent',
  title: 'Localized Block Content',
  type: 'object',
  fields: [
    {
      name: 'en',
      title: '🇺🇸 English',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'es',
      title: '🇲🇽 Español',
      type: 'blockContent',
    },
  ],
};
```

---

## 2. Sanity Schemas — Field-Level Bilingual

### `issue`

One document per issue. Both languages live inside it. One slug, one
publish state, one validation surface.

```js
// sanity/schemas/issue.js

export default {
  name: 'issue',
  title: 'Issue',
  type: 'document',
  groups: [
    { name: 'english', title: '🇺🇸 English', default: true },
    { name: 'spanish', title: '🇲🇽 Español' },
    { name: 'meta', title: 'Meta' },
  ],
  fields: [
    // ── Shared (language-independent) ──
    {
      name: 'issueNumber',
      title: 'Issue Number',
      type: 'number',
      group: 'meta',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: { source: (doc) => `crash-log-${String(doc.issueNumber).padStart(3, '0')}` },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'publishDate',
      title: 'Publish Date',
      type: 'datetime',
      group: 'meta',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'meta',
      options: { list: ['draft', 'review', 'scheduled', 'published'] },
      initialValue: 'draft',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'meta',
      description: 'Shared across both languages',
    },
    {
      name: 'coverImageAlt',
      title: 'Cover Image Alt',
      type: 'localizedString',
      group: 'meta',
    },
    {
      name: 'coverImagePrompt',
      title: 'Cover Image Prompt',
      type: 'text',
      group: 'meta',
    },

    // ── Localized content ──
    {
      name: 'title',
      title: 'Issue Title',
      type: 'localizedString',
      group: 'english',
    },
    {
      name: 'nicosTransmission',
      title: "Nico's Transmission",
      type: 'localizedBlockContent',
      group: 'english',
    },
    {
      name: 'stories',
      title: 'Stories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'story' }] }],
      group: 'english',
    },
    {
      name: 'stackTrace',
      title: 'Stack Trace',
      type: 'array',
      of: [{ type: 'stackTraceHit' }],
      validation: (Rule) => Rule.max(3),
      group: 'english',
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'localizedText',
      group: 'meta',
    },
    {
      name: 'beehiivStatus',
      title: 'Beehiiv Status',
      type: 'string',
      group: 'meta',
      options: { list: ['not_sent', 'queued', 'sent'] },
      initialValue: 'not_sent',
    },
  ],
  preview: {
    select: { title: 'title.en', number: 'issueNumber', hasEs: 'title.es' },
    prepare({ title, number, hasEs }) {
      return {
        title: `#${number} — ${title}`,
        subtitle: hasEs ? '🇺🇸 + 🇲🇽' : '🇺🇸 only',
      };
    },
  },
};
```

**Field groups** give you tabbed editing in Sanity Studio — English
tab, Spanish tab, Meta tab. Gabo works in the Spanish tab without
touching the English content.

### `story`

Same approach. Headline stays partly in English (the system-error
syntax) with a localized description slug.

```js
// sanity/schemas/story.js

export default {
  name: 'story',
  title: 'Story',
  type: 'document',
  groups: [
    { name: 'english', title: '🇺🇸 English', default: true },
    { name: 'spanish', title: '🇲🇽 Español' },
    { name: 'meta', title: 'Meta' },
  ],
  fields: [
    // ── Shared ──
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: { source: 'headline.en' },
    },
    {
      name: 'severity',
      title: 'Severity',
      type: 'string',
      group: 'meta',
      options: {
        list: ['ERROR', 'OVERRIDE', 'TERMINATE', 'WARNING', 'CRITICAL', 'BREACH'],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'meta',
    },
    {
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [{ type: 'sourceLink' }],
      group: 'meta',
      description: 'Shared — source links stay in their original language',
    },

    // ── Localized ──
    {
      name: 'headline',
      title: 'Headline',
      type: 'localizedString',
      group: 'english',
      description: 'EN: ERROR: OpRoom.med // Patch_Not_Safe · ES: ERROR: OpRoom.med // Parche_Inseguro',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'localizedBlockContent',
      group: 'english',
    },
  ],
  preview: {
    select: { headline: 'headline.en', severity: 'severity', hasEs: 'headline.es' },
    prepare({ headline, severity, hasEs }) {
      return {
        title: headline,
        subtitle: `${severity} · ${hasEs ? '🇺🇸 + 🇲🇽' : '🇺🇸 only'}`,
      };
    },
  },
};
```

### `stackTraceHit`

```js
// sanity/schemas/objects/stackTraceHit.js

export default {
  name: 'stackTraceHit',
  title: 'Stack Trace Hit',
  type: 'object',
  fields: [
    {
      name: 'text',
      title: 'Text',
      type: 'localizedText',
    },
    { name: 'sourceUrl', title: 'Source URL', type: 'url' },
    { name: 'sourceOutlet', title: 'Source Outlet', type: 'string' },
  ],
};
```

### `siteSettings` — UI strings

```js
// Add to sanity/schemas/siteSettings.js fields array

{
  name: 'ui',
  title: 'UI Strings',
  type: 'object',
  fields: [
    { name: 'subscribeCTA', type: 'localizedString', initialValue: { en: 'Subscribe', es: 'Suscríbete' } },
    { name: 'donateButtonText', type: 'localizedString', initialValue: { en: 'Feed the Bots', es: 'Alimenta a los Bots' } },
    { name: 'donateCTA', type: 'localizedText' },
    { name: 'contributorCredit', type: 'localizedString' },
    { name: 'editorCredit', type: 'localizedString' },
    { name: 'latestLabel', type: 'localizedString', initialValue: { en: 'Latest', es: 'Último' } },
    { name: 'archiveLabel', type: 'localizedString', initialValue: { en: 'Archive', es: 'Archivo' } },
    { name: 'beatsLabel', type: 'localizedString', initialValue: { en: 'Beats', es: 'Secciones' } },
    { name: 'aboutLabel', type: 'localizedString', initialValue: { en: 'About', es: 'Nosotros' } },
  ],
}
```

---

## 3. Locale Resolver Utility

A small helper that extracts the right language from any bilingual
field, falling back to English when the Spanish version doesn't exist.

```js
// lib/locale.js

/**
 * Resolve a localized field to the current locale.
 * Falls back to English if the target locale is missing.
 *
 * @param {Object} field - { en: string, es: string }
 * @param {string} locale - 'en' | 'es'
 * @returns {string|null}
 */
export function t(field, locale) {
  if (!field) return null;
  return field[locale] || field.en || null;
}

/**
 * Check if an issue has complete Spanish content.
 * "Complete" = title + transmission + all story bodies.
 */
export function hasFullTranslation(issue) {
  if (!issue.title?.es || !issue.nicosTransmission?.es) return false;
  // Check if stories are resolved (dereferenced)
  if (issue.stories) {
    return issue.stories.every((story) => story.body?.es);
  }
  return true;
}
```

---

## 4. Next.js App Router — Locale Routing

### File structure

```
app/
├── [locale]/
│   ├── layout.js
│   ├── page.js              ← latest issue
│   ├── issue/
│   │   └── [slug]/
│   │       └── page.js
│   ├── archive/
│   │   └── page.js
│   ├── beat/
│   │   └── [slug]/
│   │       └── page.js
│   └── about/
│       └── page.js
├── middleware.js
└── lib/
    ├── sanity.js
    ├── queries.js
    └── locale.js
```

### Middleware

```js
// middleware.js

import { NextResponse } from 'next/server';

const LOCALES = ['en', 'es'];
const DEFAULT_LOCALE = 'en';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, Sanity Studio
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/studio') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Already has locale prefix
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return NextResponse.next();

  // Cookie override (set by language toggle) > Accept-Language > default
  const cookieLocale = request.cookies.get('CRASH_LOG_LOCALE')?.value;
  const acceptLang = request.headers.get('accept-language') || '';
  const detectedLocale = acceptLang.includes('es') ? 'es' : DEFAULT_LOCALE;

  const locale = cookieLocale && LOCALES.includes(cookieLocale)
    ? cookieLocale
    : detectedLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|studio|favicon.ico).*)'],
};
```

### Root layout

```jsx
// app/[locale]/layout.js

import { notFound } from 'next/navigation';

const LOCALES = ['en', 'es'];

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }) {
  const { locale } = params;
  if (!LOCALES.includes(locale)) notFound();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 5. GROQ Queries

Since everything lives in one document now, queries are simpler.
No locale filter needed — you fetch the full doc and resolve the
locale on the frontend.

```js
// lib/queries.js

// Latest published issue — full doc with both locales
export const latestIssueQuery = `
  *[_type == "issue" && status == "published"]
  | order(publishDate desc)[0] {
    _id,
    issueNumber,
    slug,
    publishDate,
    title,
    coverImage,
    coverImageAlt,
    nicosTransmission,
    "stories": stories[]-> {
      _id,
      headline,
      slug,
      severity,
      body,
      "category": category-> { name, slug, color },
      sources,
    },
    stackTrace,
    metaDescription,
  }
`;

// Issue by slug
export const issueBySlugQuery = `
  *[_type == "issue" && slug.current == $slug][0] {
    _id,
    issueNumber,
    slug,
    publishDate,
    title,
    coverImage,
    coverImageAlt,
    nicosTransmission,
    "stories": stories[]-> {
      _id,
      headline,
      slug,
      severity,
      body,
      "category": category-> { name, slug, color },
      sources,
    },
    stackTrace,
    metaDescription,
  }
`;

// Site settings with UI strings
export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    newsletterName,
    tagline,
    ui,
    donateUrl,
    socialLinks,
  }
`;

// Archive
export const archiveQuery = `
  *[_type == "issue" && status == "published"]
  | order(publishDate desc) {
    _id,
    title,
    slug,
    issueNumber,
    publishDate,
    coverImage,
    coverImageAlt,
    metaDescription,
  }
`;
```

---

## 6. Language Toggle Component

```jsx
// components/LanguageToggle.jsx

'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function LanguageToggle({ locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const targetLocale = locale === 'en' ? 'es' : 'en';
  const label = locale === 'en' ? 'ES' : 'EN';

  function handleToggle() {
    // Remember preference
    document.cookie = `CRASH_LOG_LOCALE=${targetLocale};path=/;max-age=31536000`;

    // Swap locale prefix — same slug, same page
    const newPath = pathname.replace(`/${locale}`, `/${targetLocale}`);
    router.push(newPath);
  }

  return (
    <button
      onClick={handleToggle}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#8E8E93',
        background: 'transparent',
        border: '1px solid #2C2C2E',
        padding: '6px 14px',
        borderRadius: '2px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      aria-label={`Switch to ${targetLocale === 'es' ? 'Spanish' : 'English'}`}
    >
      {label}
    </button>
  );
}
```

Simpler than before — no `counterpartSlug` needed because both
languages live at the same URL. The toggle just swaps the locale
prefix and the page re-renders with the other language's fields.

---

## 7. Issue Page — Putting It Together

```jsx
// app/[locale]/issue/[slug]/page.js

import { client } from '@/lib/sanity';
import { issueBySlugQuery, siteSettingsQuery } from '@/lib/queries';
import { t, hasFullTranslation } from '@/lib/locale';
import LanguageToggle from '@/components/LanguageToggle';

export default async function IssuePage({ params }) {
  const { locale, slug } = params;

  const [issue, settings] = await Promise.all([
    client.fetch(issueBySlugQuery, { slug }),
    client.fetch(siteSettingsQuery),
  ]);

  if (!issue) notFound();

  const showFallbackBanner = locale === 'es' && !hasFullTranslation(issue);

  return (
    <>
      {/* Header */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LanguageToggle locale={locale} />
          <button>{t(settings.ui.subscribeCTA, locale)}</button>
        </div>
      </header>

      {/* Fallback banner if ES content missing */}
      {showFallbackBanner && (
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          color: '#FFB020',
          background: 'rgba(255,176,32,0.08)',
          border: '1px solid rgba(255,176,32,0.2)',
          padding: '10px 16px',
          borderRadius: '2px',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          Versión en español próximamente — showing English
        </div>
      )}

      {/* Issue title */}
      <h1>{t(issue.title, showFallbackBanner ? 'en' : locale)}</h1>

      {/* Nico's Transmission */}
      <div>
        {/* Render t(issue.nicosTransmission, locale) through your
            Portable Text renderer */}
      </div>

      {/* Stories */}
      {issue.stories.map((story) => (
        <article key={story._id}>
          <span>{story.severity}</span>
          <h2>{t(story.headline, showFallbackBanner ? 'en' : locale)}</h2>
          {/* Render t(story.body, locale) through Portable Text */}
        </article>
      ))}

      {/* Stack Trace */}
      {issue.stackTrace?.map((hit, i) => (
        <div key={i}>
          {t(hit.text, showFallbackBanner ? 'en' : locale)}
          {' — '}{hit.sourceOutlet}
        </div>
      ))}

      {/* Donate */}
      <p>{t(settings.ui.donateCTA, locale)}</p>
      <button>{t(settings.ui.donateButtonText, locale)}</button>
    </>
  );
}
```

---

## 8. Gabo's Updated Workflow

Pipeline stays the same. Output destination changes.

```
BEFORE (two separate editions):
  Gabo writes EN body → Beehiiv EN edition
  Gabo translates    → separate ES edition → Beehiiv ES

AFTER (one doc, two fields):
  Gabo writes EN     → story.body.en, issue.title.en, etc.
  Gabo translates    → story.body.es, issue.title.es, etc.
  Same doc. One publish. Toggle on frontend.
```

### What Gabo fills in per issue:

| Field | EN | ES | Notes |
|---|---|---|---|
| `issue.title` | ✅ | ✅ | e.g. "Las Máquinas Están Contratando (y Despidiendo)" |
| `issue.nicosTransmission` | ✅ | ✅ | Full LatAm rewrite, not word-for-word |
| `story.headline` | ✅ | ✅ | Keep system-error syntax, localize the slug |
| `story.body` | ✅ | ✅ | Full reporting block in LatAm Spanish |
| `stackTrace[].text` | ✅ | ✅ | Quick-hit translations |
| `issue.metaDescription` | ✅ | ✅ | SEO in both languages |
| `issue.coverImage` | ✅ | — | Shared, not localized |
| `story.severity` | ✅ | — | Enum, not localized |
| `story.sources` | ✅ | — | Source links stay in original language |

### LatAm Spanish style notes for Gabo's system prompt:

```
LANGUAGE: Latin American Spanish (Mexican/Central American register)

ALWAYS:
- "ustedes" never "vosotros"
- "computadora" not "ordenador"
- "celular" not "móvil"
- "manejar" not "conducir" (for driving)
- "plata" or "dinero" not "pasta" (for money)
- "renunciar" not "dimitir"
- "aplicación" not "app" when possible, but "app" is acceptable
- Keep technical terms in English: AI, API, LLM, CEO, FDA, etc.
- Keep company names, product names, proper nouns in English
- Contractions and rhythm should feel natural to Mexican Spanish

HEADLINES:
- Keep the system-error syntax structure in English
- Localize the description slug where natural
  EN: ERROR: OpRoom.med // Patch_Not_Safe
  ES: ERROR: OpRoom.med // Parche_Inseguro

TONE:
- Same as the English: direct, sharp, no fluff
- Don't soften the editorial voice in translation
- Nico's Transmission should feel like Nico speaking Spanish,
  not like someone translating Nico
```

---

## 9. Sanity Studio UX

With field groups, the Studio editing experience is tabbed:

```
┌────────────┬────────────┬────────┐
│ 🇺🇸 English │ 🇲🇽 Español │  Meta  │
├────────────┴────────────┴────────┤
│                                  │
│  Issue Title (en)                │
│  ┌──────────────────────────┐    │
│  │ The Machines Are Hiring  │    │
│  │ (And Firing)             │    │
│  └──────────────────────────┘    │
│                                  │
│  Nico's Transmission (en)        │
│  ┌──────────────────────────┐    │
│  │ Three stories this week, │    │
│  │ one thread: the gap...   │    │
│  └──────────────────────────┘    │
│                                  │
│  Stories [drag to reorder]       │
│  ├── ERROR: OpRoom.med //...     │
│  ├── OVERRIDE: MilAccess.gov //  │
│  └── TERMINATE: Block.hr //...   │
│                                  │
│  Stack Trace                     │
│  ├── Hit 1                       │
│  ├── Hit 2                       │
│  └── Hit 3                       │
│                                  │
└──────────────────────────────────┘
```

Click the 🇲🇽 Español tab and the same fields appear with the `.es`
variants. Stories reference the same story documents — Gabo just
fills in the `.es` fields on each story doc.

The preview line shows `🇺🇸 + 🇲🇽` when both languages are present
and `🇺🇸 only` when Spanish is still pending.

---

## 10. URL Structure

Both languages share the same slug. No counterpart linking needed.

```
English:
  /en                          → latest issue
  /en/issue/crash-log-014      → issue #014
  /en/archive                  → all issues
  /en/beat/medical-ai          → beat page
  /en/about                    → about page

Spanish:
  /es                          → último número (same issue, .es fields)
  /es/issue/crash-log-014      → same slug, Spanish content
  /es/archive                  → same issues, Spanish titles
  /es/beat/medical-ai          → same beat, Spanish bodies
  /es/about                    → about page in Spanish
```

---

## 11. Beehiiv Integration

One publication, two segments:

```
Sanity webhook fires on status: "published"
  ├── Check if issue.title.en exists → push to EN segment
  └── Check if issue.title.es exists → push to ES segment

Subscribers pick language preference at signup.
One list. Two sends. One source of truth.
```

If Gabo's Spanish isn't ready at publish time, only the EN
segment fires. When the `.es` fields get filled later, a
second webhook fires and sends the ES edition.
