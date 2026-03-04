# SEO Audit & Requirements — The Crash Log

**Audit Date:** March 3, 2026
**Project:** The Crash Log (bilingual EN/ES newsletter, Next.js 16 + Sanity 5)
**Auditor Note:** This is a READ-ONLY audit. No code changes made. Document covers current state, gaps, and prioritized recommendations.

---

## 1. Metadata API & Dynamic Metadata

### Current State

**Root Layout (`app/layout.js`):**
- Static metadata exported:
  ```javascript
  export const metadata = {
    title: "The Crash Log — AI & Tech Gone Off the Rails",
    description: "A newsletter about AI and tech failures, produced by a team of AI agents and edited by a human.",
  };
  ```
- Uses Google Fonts with `display: "swap"` (good for CLS)
- **`<html lang="en">`** — hardcoded to English (critical issue for bilingual site)
- No viewport, charset, or other critical meta tags defined

**Locale Layout (`app/[locale]/layout.js`):**
- No metadata export
- No dynamic `lang` attribute adjustment based on locale param

**Home Page (`app/[locale]/page.js`):**
- No metadata export
- Placeholder content (loading state)

**Studio Page (`app/studio/[[...index]]/page.js`):**
- Not reviewed but should suppress indexing (robots noindex)

### Gaps

1. **No locale-aware metadata:** Root layout always sets `lang="en"`. Spanish pages should have `lang="es"`.
2. **No dynamic metadata for issue pages:** Issues/stories have no `generateMetadata` function to pull title, description, publish date from Sanity.
3. **No structured metadata exports:** Missing `openGraph`, `twitter`, `alternateLanguages`, `canonical`.
4. **No robots metadata:** No `noindex` for `/studio` or draft pages.
5. **No icons/favicon:**
   - No `favicon.ico`, `icon.svg` export functions
   - No apple-touch-icon, manifest references
6. **Missing critical meta tags:**
   - No `<meta charset="utf-8">`
   - No `<meta name="viewport">`
   - No `<meta name="theme-color">`

### Recommendations (P0 — Critical)

**Priority P0:** These must be in place before launch to avoid indexing and internationalization issues.

#### 1.1 Root Layout — Add Comprehensive Metadata

```javascript
// app/layout.js
import { Space_Grotesk, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://crash-log.example.com"), // SET PRODUCTION URL
  title: {
    default: "The Crash Log — AI & Tech Gone Off the Rails",
    template: "%s — The Crash Log",
  },
  description: "A bilingual (EN/ES) newsletter about AI and tech failures, produced by a team of AI agents and edited by a human.",
  generator: "Next.js 16",
  applicationName: "The Crash Log",
  authors: [{ name: "Hector Luis Alamo" }],
  creator: "Hector Luis Alamo",
  publisher: "The Crash Log",
  keywords: [
    "AI failures",
    "technology news",
    "AI safety",
    "tech incidents",
    "newsletter",
    "artificial intelligence",
  ],
  category: "News",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    "max-image-preview": "large",
    "max-snippet": "-1",
    "max-video-preview": "-1",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES"],
    url: "https://crash-log.example.com",
    siteName: "The Crash Log",
    title: "The Crash Log — AI & Tech Gone Off the Rails",
    description: "A bilingual (EN/ES) newsletter about AI and tech failures.",
    images: [
      {
        url: "/og-image.png", // 1200x630px
        width: 1200,
        height: 630,
        alt: "The Crash Log — AI & Tech Gone Off the Rails",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Crash Log — AI & Tech Gone Off the Rails",
    description: "A bilingual (EN/ES) newsletter about AI and tech failures.",
    creator: "@crashlogai", // SET ACTUAL TWITTER HANDLE
    images: ["/twitter-image.png"], // 1200x675px
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="canonical" href="https://crash-log.example.com" />
      </head>
      <body className={`${spaceGrotesk.variable} ${sourceSerif4.variable} ${ibmPlexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

#### 1.2 Locale Layout — Dynamic `lang` & Alternate Links

```javascript
// app/[locale]/layout.js
import { notFound } from "next/navigation";

const LOCALES = ["en", "es"];
const LOCALE_NAMES = {
  en: "en-US",
  es: "es-ES",
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) return {};

  return {
    alternateLanguages: {
      [LOCALE_NAMES[locale]]: `https://crash-log.example.com/${locale}`,
      ...(locale === "en" && { "es-ES": "https://crash-log.example.com/es" }),
      ...(locale === "es" && { "en-US": "https://crash-log.example.com/en" }),
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();

  return (
    <html lang={LOCALE_NAMES[locale]}>
      <body>
        <div className="wrapper">{children}</div>
      </body>
    </html>
  );
}
```

**Note:** The above nests `<html>` inside the locale layout. This may cause Next.js warnings about nested html tags. Alternative: Use `generateMetadata` in root layout to set `lang` dynamically based on route. Coordinate with Hector on preferred approach.

#### 1.3 Home Page — Dynamic Metadata

```javascript
// app/[locale]/page.js
import { client } from "@/lib/sanity";

const LOCALE_NAMES = { en: "en-US", es: "es-ES" };

export async function generateMetadata({ params }) {
  const { locale } = await params;

  // Fetch latest issue from Sanity
  const issue = await client.fetch(
    `*[_type == "issue" && status == "published"]
     | sort(publishDate desc) | [0]`
  );

  if (!issue) {
    return {
      title: "The Crash Log — Latest Edition",
      description: "Loading the latest AI and tech news...",
    };
  }

  const title = issue.title?.[locale] || issue.title?.en || "The Crash Log";
  const description = issue.metaDescription?.[locale] ||
                      issue.metaDescription?.en ||
                      "The latest edition of The Crash Log newsletter.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: issue.publishDate,
      url: `https://crash-log.example.com/${locale}`,
      images: issue.coverImage
        ? [
            {
              url: `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${issue.coverImage.asset._ref}`,
              width: 1200,
              height: 630,
              alt: issue.coverImageAlt?.[locale] || "Issue cover",
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  // Component will fetch and render latest issue
  return (
    <main>
      {/* ... */}
    </main>
  );
}
```

#### 1.4 Issue Page — Dynamic Metadata (Future)

For `/[locale]/issue/[slug]/page.js` (not yet implemented):

```javascript
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;

  const issue = await client.fetch(
    `*[_type == "issue" && slug.current == $slug][0]`,
    { slug }
  );

  if (!issue) return { title: "Not Found" };

  const title = issue.title?.[locale] || "Issue";
  const description = issue.metaDescription?.[locale] || "";
  const publishedTime = issue.publishDate;
  const authors = [{ name: "Hector Luis Alamo" }];

  return {
    title,
    description,
    authors,
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime,
      authors,
      url: `https://crash-log.example.com/${locale}/issue/${slug}`,
      images: issue.coverImage ? [{ url: urlFor(issue.coverImage).url() }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
```

#### 1.5 Studio — Robots NoIndex

```javascript
// app/studio/[[...index]]/page.js
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

---

## 2. Structured Data (JSON-LD)

### Current State

- **Zero structured data** on any page
- No Schema.org implementation
- Missing semantic HTML markup for accessibility + SEO

### Gaps

1. **No WebSite schema** — Missing site identity, searchAction, logo, social profiles
2. **No Organization schema** — No publisherName, founder, contact info
3. **No NewsArticle schema** — Issues should declare themselves as news articles
4. **No Article schema** — Stories lack schema metadata
5. **No BreadcrumbList** — No navigation hints for crawlers
6. **No FAQPage schema** — About page could benefit (if FAQ is added)
7. **No Event schema** — If issues are scheduled/dated, could declare as NewsEvent
8. **Missing Publisher association** — Should declare publisher org in ArticleBody

### Recommendations (P0 — Critical for Discovery)

#### 2.1 WebSite Schema (Root Layout)

Add a JSON-LD script to `app/layout.js`:

```javascript
// Add to root layout RootLayout component's return:
export default function RootLayout({ children }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Crash Log",
    description: "A bilingual (EN/ES) newsletter about AI and tech failures.",
    url: "https://crash-log.example.com",
    image: "https://crash-log.example.com/logo.png",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://crash-log.example.com/search?q={search_term_string}",
      },
      query_input: "required name=search_term_string",
    },
    inLanguage: ["en-US", "es-ES"],
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: "The Crash Log Editorial Team",
      url: "https://crash-log.example.com/about",
      logo: "https://crash-log.example.com/logo.png",
      sameAs: [
        "https://twitter.com/crashlogai",
        "https://linkedin.com/company/crash-log",
      ],
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body className={`...`}>{children}</body>
    </html>
  );
}
```

#### 2.2 NewsArticle Schema (Issue Pages)

For `/[locale]/issue/[slug]/page.js`:

```javascript
// In the issue page component
export default async function IssuePage({ params }) {
  const { locale, slug } = await params;
  const issue = await client.fetch(/* ... */);

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: issue.title?.[locale],
    description: issue.metaDescription?.[locale],
    image: issue.coverImage ? [urlFor(issue.coverImage).url()] : [],
    datePublished: issue.publishDate,
    dateModified: issue._updatedAt,
    author: {
      "@type": "Organization",
      name: "The Crash Log Editorial Team",
      url: "https://crash-log.example.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "The Crash Log",
      logo: {
        "@type": "ImageObject",
        url: "https://crash-log.example.com/logo.png",
      },
    },
    mainEntity: {
      "@type": "NewsArticle",
      headline: issue.title?.[locale],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* ... rest of page ... */}
    </>
  );
}
```

#### 2.3 BreadcrumbList (All Pages)

For pages with routes `/[locale]/issue/[slug]`, add breadcrumbs:

```javascript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "The Crash Log",
      item: `https://crash-log.example.com/${locale}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: issue.title?.[locale],
      item: `https://crash-log.example.com/${locale}/issue/${slug}`,
    },
  ],
};
```

#### 2.4 Organization Schema (About Page - Future)

```javascript
// For /[locale]/about
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Crash Log",
  url: "https://crash-log.example.com",
  logo: "https://crash-log.example.com/logo.png",
  description: "A bilingual newsletter about AI and tech failures.",
  founder: {
    "@type": "Person",
    name: "Hector Luis Alamo",
  },
  foundingDate: "2025-06-01", // CONFIRM ACTUAL DATE
  team: [
    {
      "@type": "Person",
      name: "Nico",
      jobTitle: "AI Agent / Newsroom Lead",
    },
    // ... other agents
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Editorial",
    email: "editor@crash-log.example.com", // SET ACTUAL EMAIL
  },
  sameAs: [
    "https://twitter.com/crashlogai",
    "https://linkedin.com/company/crash-log",
  ],
};
```

---

## 3. Open Graph & Twitter Cards

### Current State

- **Zero OG tags** in any layout
- **Zero Twitter Card tags**
- No image assets prepared

### Gaps

1. **OG tags missing:** `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale`, `og:locale:alternate`
2. **Twitter cards missing:** `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:creator`
3. **No image assets:** Need `og-image.png` (1200×630px) and `twitter-image.png` (1200×675px)
4. **Locale-specific OG:** Spanish pages need `og:locale="es_ES"`

### Recommendations (P0 — Critical for Social Sharing)

#### 3.1 Add OG/Twitter to Root Metadata (see Section 1.1)

The code in **1.1** covers this for the root. Replicate for issue pages:

```javascript
// app/[locale]/issue/[slug]/page.js
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const issue = await client.fetch(/* ... */);

  const canonicalUrl = `https://crash-log.example.com/${locale}/issue/${slug}`;
  const ogImage = issue.coverImage ? urlFor(issue.coverImage).url() : "/og-default.png";

  return {
    title: issue.title?.[locale],
    description: issue.metaDescription?.[locale],
    openGraph: {
      type: "article",
      title: issue.title?.[locale],
      description: issue.metaDescription?.[locale],
      url: canonicalUrl,
      siteName: "The Crash Log",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: issue.coverImageAlt?.[locale],
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_ES"],
      publishedTime: issue.publishDate,
      modifiedTime: issue._updatedAt,
      authors: ["The Crash Log Editorial Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: issue.title?.[locale],
      description: issue.metaDescription?.[locale],
      images: [ogImage],
      creator: "@crashlogai", // SET ACTUAL HANDLE
    },
  };
}
```

#### 3.2 Design OG/Twitter Images

- **OG Image (1200×630px):** Dark background (#0A0A0A), The Crash Log wordmark, issue headline excerpt, severity badge accent color
- **Twitter Image (1200×675px):** Same as OG, optimized for Twitter's taller crop
- **Safe zone:** Keep critical text/logos within 900×900px (for avatar overlap on Twitter)

These can be generated dynamically via Sanity cover images or static fallback.

---

## 4. Sitemap & robots.txt

### Current State

- **No sitemap.xml**
- **No robots.txt**
- No dynamic sitemap generation strategy

### Gaps

1. **Crawlers cannot discover full site structure** — No priority hints
2. **No robots directives** — Crawlers don't know which pages to index/follow
3. **Locale handling unclear** — Bilingual routes `/en` and `/es` need proper directives
4. **Studio is public** — `/studio` must be blocked from indexing
5. **No lastmod/changefreq hints** — Affects crawl frequency allocation

### Recommendations (P0 — Required for Indexing)

#### 4.1 Create `public/robots.txt`

```txt
# The Crash Log robots.txt
# https://crash-log.example.com/robots.txt

User-agent: *
Allow: /
Disallow: /studio/
Disallow: /_next/
Disallow: /.vercel/
Disallow: /__nextjs_original-stack-frame

# Specific rules for different crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Slow-bot courtesy
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

Sitemap: https://crash-log.example.com/sitemap.xml
```

#### 4.2 Create Dynamic Sitemap (`app/sitemap.js`)

```javascript
// ABOUTME: Dynamic XML sitemap for the Crash Log.
// ABOUTME: Generates entries for all published issues and key pages.

import { client } from "@/lib/sanity";

const BASE_URL = "https://crash-log.example.com";
const LOCALES = ["en", "es"];

export default async function sitemap() {
  // Fetch all published issues
  const issues = await client.fetch(
    `*[_type == "issue" && status == "published"]
     | sort(publishDate desc) {
       _id, slug, publishDate, _updatedAt, title, metaDescription
     }`
  );

  // Static pages (homepage for each locale + about)
  const staticEntries = [];
  for (const locale of LOCALES) {
    staticEntries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          "en-US": `${BASE_URL}/en`,
          "es-ES": `${BASE_URL}/es`,
        },
      },
    });

    staticEntries.push({
      url: `${BASE_URL}/${locale}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          "en-US": `${BASE_URL}/en/about`,
          "es-ES": `${BASE_URL}/es/about`,
        },
      },
    });

    staticEntries.push({
      url: `${BASE_URL}/${locale}/archive`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "en-US": `${BASE_URL}/en/archive`,
          "es-ES": `${BASE_URL}/es/archive`,
        },
      },
    });
  }

  // Issue pages
  const issueEntries = [];
  for (const locale of LOCALES) {
    for (const issue of issues) {
      issueEntries.push({
        url: `${BASE_URL}/${locale}/issue/${issue.slug.current}`,
        lastModified: new Date(issue._updatedAt || issue.publishDate),
        changeFrequency: "never",
        priority: 0.9,
        alternates: {
          languages: {
            "en-US": `${BASE_URL}/en/issue/${issue.slug.current}`,
            "es-ES": `${BASE_URL}/es/issue/${issue.slug.current}`,
          },
        },
      });
    }
  }

  return [...staticEntries, ...issueEntries];
}
```

#### 4.3 Robots.txt Metadata (in root layout)

Next.js 16 supports dynamic `robots.ts` export alongside `sitemap.js`:

```javascript
// app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio/", "/_next/", "/.vercel/"],
      },
      {
        userAgent: "AhrefsBot",
        crawlDelay: 10,
      },
      {
        userAgent: "SemrushBot",
        crawlDelay: 10,
      },
    ],
    sitemap: "https://crash-log.example.com/sitemap.xml",
  };
}
```

---

## 5. Canonical URLs & hreflang Tags

### Current State

- **No canonical tags** on any page
- **No hreflang tags** for bilingual pages
- Locale routing via `/en` and `/es` prefixes (good foundation, but no link annotations)

### Gaps

1. **No explicit canonicals** — Search engines may treat `/en/issue/slug` and `/es/issue/slug` as duplicate content
2. **No hreflang links** — Google doesn't know which language variant corresponds to which version
3. **No locale fallback hints** — If ES page missing, should canonical to EN

### Recommendations (P1 — Important for Duplicate Content)

#### 5.1 Add Canonical Link to All Pages

Include in `generateMetadata` for all pages:

```javascript
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const canonicalUrl = `https://crash-log.example.com/${locale}/issue/${slug}`;

  return {
    alternateLanguages: {
      "en-US": "https://crash-log.example.com/en/issue/${slug}",
      "es-ES": "https://crash-log.example.com/es/issue/${slug}",
    },
    // Next.js will automatically generate <link rel="canonical" href="..." />
    // from the generated page URL
  };
}
```

**Next.js 16 behavior:** Automatically generates `<link rel="canonical">` based on the page's canonical URL (which is derived from its route). The `alternateLanguages` in metadata generates `<link rel="alternate" hreflang="...">` tags.

#### 5.2 Ensure hreflang Tags for All Content

For every page with EN and ES versions, Next.js should auto-generate:

```html
<!-- On /en/issue/slug: -->
<link rel="alternate" hreflang="es-ES" href="https://crash-log.example.com/es/issue/slug">
<link rel="alternate" hreflang="x-default" href="https://crash-log.example.com/en/issue/slug">

<!-- On /es/issue/slug: -->
<link rel="alternate" hreflang="en-US" href="https://crash-log.example.com/en/issue/slug">
<link rel="alternate" hreflang="x-default" href="https://crash-log.example.com/en/issue/slug">
```

This is configured in root layout's `generateMetadata`:

```javascript
export async function generateMetadata() {
  return {
    openGraph: {
      locale: "en_US",
      alternateLocale: ["es_ES"],
    },
    // This tells Next.js to generate hreflang links across all pages
  };
}
```

---

## 6. Internationalization SEO

### Current State

**Current Approach:**
- Middleware detects locale from cookie → Accept-Language header → defaults EN
- All routes prefixed `/en/` and `/es/`
- Locale Layout validates and renders (no per-locale modifications yet)
- Root layout hardcoded to `lang="en"` — **critical issue**

**Strengths:**
- Locale prefix routing is SEO-friendly (better than query params)
- Proper fallback chain (cookie > Accept-Language > default)

**Weaknesses:**
- No locale-specific metadata on locale layout
- Root `<html lang="en">` breaks Spanish pages
- No hreflang or x-default declaration yet
- No language selector visible to crawlers

### Gaps

1. **HTML lang attribute mismatch** — Spanish pages served with `lang="en"`
2. **No x-default hreflang** — Should default to `/en` as primary version
3. **No language selector meta tag** — Missing `og:locale:alternate`
4. **Locale detection could improve** — Should prefer user's browser language more intelligently
5. **No locale-specific sitemaps** — Single sitemap OK, but could split for optimization

### Recommendations (P0 — Critical for Language-Specific Indexing)

#### 6.1 Fix HTML Lang Attribute (Root Layout)

**Option A: Dynamic in Root (simplest)**

```javascript
// app/layout.js
// Extract locale from pathname at render time

export default function RootLayout({ children }) {
  // This runs on the server; we'll get the locale from the child component context
  // Best approach: make Root layout accept locale via server context
  return (
    <html lang="en" suppressHydrationWarning>
      {/* lang="en" as fallback; child layout will override */}
      <body className={`...`}>{children}</body>
    </html>
  );
}
```

**Option B: Override in Locale Layout**

Better approach — move the `<html>` tag to locale layout:

```javascript
// app/[locale]/layout.js
const LOCALE_NAMES = { en: "en-US", es: "es-ES" };

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    alternateLanguages: {
      "en-US": "https://crash-log.example.com/en",
      "es-ES": "https://crash-log.example.com/es",
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();

  return (
    <html lang={LOCALE_NAMES[locale]} suppressHydrationWarning>
      <body>
        <div className="wrapper">{children}</div>
      </body>
    </html>
  );
}
```

⚠️ **Caveat:** This results in two `<html>` elements in the DOM (one in root, one in locale layout). Next.js may warn or strip the duplicate. **Action Item:** Test this pattern in a staging build and confirm it doesn't cause issues. If it does, use root-level middleware to inject the correct `lang` dynamically (more complex).

#### 6.2 Add x-default hreflang in Root Metadata

```javascript
// app/layout.js
export const metadata = {
  // ... other metadata ...
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  // This auto-generates hreflang for all pages
};
```

#### 6.3 Locale Switching Header for Crawlers

Add a language switcher component that's visible to crawlers (not just JS):

```javascript
// app/[locale]/page.js (home page)
export default async function HomePage({ params }) {
  const { locale } = await params;

  const translations = {
    en: { label: "English", href: "/en" },
    es: { label: "Español", href: "/es" },
  };

  return (
    <main>
      <nav role="navigation" aria-label="Language selection">
        {Object.entries(translations).map(([lang, { label, href }]) => (
          <Link
            key={lang}
            href={href}
            aria-current={locale === lang ? "page" : undefined}
            hrefLang={lang === "es" ? "es-ES" : "en-US"}
          >
            {label}
          </Link>
        ))}
      </nav>
      {/* ... rest of page ... */}
    </main>
  );
}
```

This ensures language links are discoverable by crawlers even if JavaScript fails.

#### 6.4 Locale-Specific Metadata (Future Enhancement)

For analytics/reporting, consider storing locale-specific meta descriptions in Sanity:

```javascript
// On Issue schema, add:
{
  name: "metaDescriptionES",
  title: "Meta Description (Spanish)",
  type: "text",
  group: "spanish",
  description: "Search result snippet for Spanish pages",
}
```

Then in page metadata:

```javascript
const description = locale === "es"
  ? issue.metaDescriptionES
  : issue.metaDescription?.en;
```

---

## 7. Performance SEO

### Current State

**Font Loading:**
- Google Fonts with `display: "swap"` ✓ (good for CLS)
- 3 font families: Space Grotesk (display), Source Serif 4 (body), IBM Plex Mono (system)
- No font subsetting or preloading

**Image Optimization:**
- Sanity image optimization via `@sanity/image-url`
- No Next.js `<Image>` component in use (components use `<img>`)
- No lazy loading or responsive images
- No image format optimization (WebP, AVIF)

**CSS:**
- Global CSS with design tokens (good performance)
- CSS Modules for components (scoped, efficient)
- Dark theme as default (potential battery savings on OLED)

**JavaScript:**
- React 19 with App Router (good, modern)
- Portable Text rendering for rich text (fine)
- No bundler config optimizations visible
- No suspense boundaries or streaming SSR

**Render Blocking:**
- Fonts are not preloaded → potential CLS
- No font subset optimization

### Gaps

1. **Font preloading missing** — `<link rel="preload">` not declared for critical fonts
2. **No font subsetting** — Loading full character sets for 3 families (90KB+ overhead)
3. **Images using `<img>` not `<Image>`** — Missing automatic optimization, responsive srcset
4. **No image lazy loading** — All images load eagerly
5. **No WebP/AVIF fallbacks** — Serving original formats only
6. **No Core Web Vitals instrumentation** — Can't measure LCP, FID, CLS
7. **No streaming SSR setup** — Could improve TTFB for complex pages
8. **Missing font-display strategy** — Currently uses `swap`, consider `fallback` for less critical fonts

### Recommendations (P1 — Important for UX & Rankings)

#### 7.1 Preload Critical Fonts (Root Layout)

```javascript
// app/layout.js
export const metadata = {
  // ... existing metadata ...
  // Add to the root metadata export:
  icons: {
    icon: "/favicon.ico",
  },
  // Preload critical fonts
  other: {
    preload: [
      {
        rel: "preload",
        as: "font",
        href: "/fonts/SpaceGrotesk-Bold.woff2",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        href: "/fonts/SourceSerif4-Regular.woff2",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
    ],
  },
};
```

Or in HTML head:

```html
<link rel="preload" as="font" href="..." type="font/woff2" crossorigin>
```

#### 7.2 Switch Images to Next.js `<Image>` Component

```javascript
// OLD: components/CoverImage.js
import styles from "./CoverImage.module.css";

export default function CoverImage({ image, alt }) {
  return (
    <figure className={styles.figure}>
      <img src={image.src} alt={alt} className={styles.image} />
    </figure>
  );
}

// NEW:
import Image from "next/image";
import styles from "./CoverImage.module.css";

export default function CoverImage({ image, alt, priority = false }) {
  return (
    <figure className={styles.figure}>
      <Image
        src={image.src}
        alt={alt}
        width={720}
        height={480}
        priority={priority} // true for above-fold images
        placeholder="blur"
        blurDataURL={image.blurHash} // if available from Sanity
        className={styles.image}
      />
    </figure>
  );
}
```

#### 7.3 Add `next/navigation` Link Prefetching

Ensure all internal links use Next.js `Link` with prefetching enabled (default):

```javascript
// app/[locale]/page.js
import Link from "next/link";

export default function HomePage() {
  return (
    <Link href={`/${locale}/issue/${slug}`} prefetch={true}>
      {/* Crawlers will also follow this for discovery */}
      Read More
    </Link>
  );
}
```

#### 7.4 Configure Image Optimization in next.config.mjs

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.sanity.io"],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
```

#### 7.5 Consider Font Subsetting (Future)

Use `font-display: "fallback"` for non-critical fonts:

```javascript
// app/layout.js
const sourceSerif4 = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"], // Could add "latin-ext" only if needed
  display: "fallback", // Falls back to system font faster
});
```

#### 7.6 Add Core Web Vitals Monitoring

Integrate a Web Vitals library for metrics:

```javascript
// app/layout.js or a separate client component
"use client";

import { useEffect } from "react";
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

export function WebVitals() {
  useEffect(() => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }, []);

  return null;
}
```

Then in root layout:

```javascript
import { WebVitals } from "./web-vitals";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <WebVitals />
      </body>
    </html>
  );
}
```

---

## 8. Accessibility as SEO Signal

### Current State

**Semantic HTML:**
- Using proper heading hierarchy (h1, h2, h3)
- `<header>`, `<footer>`, `<main>`, `<nav>` tags present
- `<figure>` for images ✓

**ARIA:**
- Global CSS includes `:focus-visible` outline (good)
- Components use `aria-hidden` on decorative elements
- Components use `aria-label` on interactive elements
- No missing alt text (enforced via Sanity schema)

**Color Contrast:**
- Dark theme with sufficient contrast (checked in CLAUDE.md — fixed via CodeRabbit review)
- Severity badge colors tested and adjusted

**Font Sizing:**
- Root font size: 16.5px (readable)
- Line height: 1.72 (spacious, good for readability)

**Keyboard Navigation:**
- `:focus-visible` applied globally
- Links and buttons are natively focusable
- No keyboard traps detected (component review pending)

**Screen Reader Support:**
- Semantic HTML largely in place
- Alt text on images (required in Sanity)
- Navigation structure clear

### Gaps

1. **No lang attribute on HTML** — Screen readers can't determine language
2. **No page landmarks** — Some components missing `role` attributes
3. **Skip links** — No "Skip to content" link for keyboard users
4. **Form labels** — No forms yet, but future subscribe/search inputs need labels
5. **Table structure** — If tables are used, need proper th/td markup
6. **Heading hierarchy** — Should verify no missing h1 or out-of-order jumps
7. **ARIA live regions** — No dynamic content announcements

### Recommendations (P1 — Important for Accessibility & SEO)

#### 8.1 Add Skip Link (Header Component)

```javascript
// components/Header.js
export default function Header({ locale, children }) {
  return (
    <header className={styles.header}>
      {/* Skip link (visually hidden but accessible) */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <div className={styles.inner}>
        <div>
          <Link href={`/${locale}`} className={styles.wordmark}>
            The Crash Log
          </Link>
          <div className={styles.tagline}>AI &amp; Tech Gone Off the Rails</div>
        </div>
        <div className={styles.actions}>
          {children}
          <button className={styles.subscribe} aria-label="Subscribe to newsletter">
            Subscribe
          </button>
        </div>
      </div>
    </header>
  );
}

// Header.module.css
.skipLink {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--severity-error);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skipLink:focus {
  top: 0;
}
```

#### 8.2 Add Main Content ID

In issue page layout:

```javascript
// app/[locale]/issue/[slug]/page.js
export default async function IssuePage() {
  return (
    <main id="main-content">
      {/* ... page content ... */}
    </main>
  );
}
```

#### 8.3 Verify Heading Hierarchy

Audit in Phase 4 once pages are built:
- Each page should have exactly one `<h1>` (page title)
- No skipped heading levels (h1 → h2 → h4 is bad)
- Use semantic HTML heading tags, not divs with `role="heading"`

#### 8.4 Ensure Form Accessibility (Future)

When subscribe/search forms are added:

```javascript
// Example form structure
<form>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    name="email"
    aria-required="true"
    aria-describedby="email-hint"
  />
  <span id="email-hint">We'll never share your email.</span>
  <button type="submit" aria-label="Subscribe">
    Subscribe
  </button>
</form>
```

#### 8.5 Add ARIA Labels to Interactive Components

Review all buttons/links in CodeRabbit to ensure:
- `aria-label` on icon-only buttons
- `aria-current="page"` on active nav links
- `aria-expanded` on collapsible sections (if any)

---

## 9. Implementation Roadmap

### Phase Summary

| Phase | Focus | P0/P1 Items | Timeline |
|-------|-------|-----------|----------|
| **Phase 4** (Current) | Issue Page + Queries | Root metadata, robots.txt, sitemap.js, hreflang setup | Week 1 |
| **Phase 4.5** (New) | SEO Infrastructure | NewsArticle schema, OG images, font preloading, Image component refactor | Week 1-2 |
| **Phase 5** | Archive + Search | Per-page metadata, BreadcrumbList schema, Core Web Vitals tracking | Week 2-3 |
| **Future** | Site Launch | Final audit, performance testing, Search Console setup | Week 4+ |

### Checklist for Phase 4.5 (NEW PHASE)

**Priority P0:**
- [ ] Update `app/layout.js` with comprehensive metadata (Section 1.1)
- [ ] Create `app/[locale]/layout.js` with locale-aware metadata and `lang` attribute (Section 1.2)
- [ ] Create `app/robots.js` and `public/robots.txt` (Section 4.1-4.3)
- [ ] Create `app/sitemap.js` (Section 4.2)
- [ ] Fix HTML `lang` attribute for Spanish pages (Section 6.1)
- [ ] Add NewsArticle JSON-LD schema to issue pages (Section 2.2)
- [ ] Add WebSite schema to root (Section 2.1)
- [ ] Create OG/Twitter image assets (1200×630px, 1200×675px) (Section 3.2)

**Priority P1:**
- [ ] Refactor image components to use `<Image>` from `next/image` (Section 7.2)
- [ ] Add font preloading (Section 7.1)
- [ ] Configure image optimization in `next.config.mjs` (Section 7.4)
- [ ] Add skip link to Header component (Section 8.1)
- [ ] Add Core Web Vitals tracking library (Section 7.6)
- [ ] Create `/[locale]/about` page with Organization schema (Section 2.4)
- [ ] Set up Search Console and monitor indexing

---

## 10. Search Console & Monitoring Setup

### Gaps

1. **No Search Console setup** — No visibility into crawl errors, indexing status
2. **No analytics integration** — Can't track organic traffic
3. **No monitoring of Core Web Vitals** — No visibility into page speed metrics
4. **No brand SERP tracking** — Don't know if rich snippets appear

### Recommendations (P1 — Post-Launch)

#### 10.1 Google Search Console Verification

Add to root metadata:

```javascript
export const metadata = {
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_TOKEN", // Get from Search Console
  },
};
```

Or add HTML meta tag:

```html
<meta name="google-site-verification" content="YOUR_TOKEN">
```

#### 10.2 Analytics Integration

Add Google Analytics or Plausible Analytics:

```javascript
// app/layout.js or separate client component
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script dangerouslySetInnerHTML={{
  __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX');`
}} />
```

#### 10.3 Monitoring Dashboard

Set up alerts for:
- Crawl errors (404s, robots.txt blocks)
- Indexing coverage (pages indexed vs. excluded)
- Search performance (CTR, impressions, position trends)
- Core Web Vitals thresholds

---

## Summary: Critical Path to SEO-Ready Launch

### MUST DO (P0 — Before Public Launch)

1. **Metadata API** (Section 1)
   - Root layout: comprehensive metadata with OG, Twitter, robots directives
   - Locale layout: dynamic `lang` attribute, hreflang tags
   - Issue page: dynamic metadata from Sanity content

2. **Structured Data** (Section 2)
   - WebSite schema (root)
   - NewsArticle schema (issue pages)
   - BreadcrumbList schema (navigation)

3. **Crawlability** (Section 4)
   - `robots.txt` blocking `/studio` and `/_next`
   - Dynamic `sitemap.xml` with all issues and key pages

4. **Internationalization** (Section 6)
   - Fix HTML `lang` attribute for ES pages
   - Verify hreflang links generated correctly

### SHOULD DO (P1 — Within 1-2 Weeks)

5. **Performance SEO** (Section 7)
   - Refactor images to use `<Image>` component
   - Preload critical fonts
   - Add Core Web Vitals tracking

6. **Accessibility** (Section 8)
   - Add skip links
   - Verify heading hierarchy
   - Document form accessibility patterns

7. **Open Graph / Twitter Cards** (Section 3)
   - Create image assets (1200×630px, 1200×675px)
   - Verify social preview rendering

8. **Search Console** (Section 10)
   - Verify site in Google Search Console
   - Monitor indexing, crawl errors, coverage

---

## Files & Assets to Create/Modify

### New Files Required

| File | Purpose | Priority |
|------|---------|----------|
| `/app/robots.js` | Dynamic robots.txt export | P0 |
| `/public/robots.txt` | Static robots.txt fallback | P0 |
| `/app/sitemap.js` | Dynamic XML sitemap generator | P0 |
| `/public/og-image.png` | OG social image (1200×630) | P0 |
| `/public/twitter-image.png` | Twitter card image (1200×675) | P0 |
| `/public/logo.png` | Masthead logo for schema | P0 |
| `/public/favicon.ico` | Browser tab icon | P1 |
| `/public/apple-touch-icon.png` | iOS home screen icon | P1 |
| `/public/site.webmanifest` | PWA manifest | P1 |
| `/lib/seo.js` | Shared SEO utility functions | P1 |
| `/docs/SEO_IMPLEMENTATION.md` | Step-by-step implementation guide | P1 |

### Modified Files

| File | Changes | Priority |
|------|---------|----------|
| `app/layout.js` | Add comprehensive metadata, OG, Twitter, schemas | P0 |
| `app/[locale]/layout.js` | Add locale-aware metadata, fix `lang` attribute | P0 |
| `app/[locale]/page.js` | Add generateMetadata, fetch latest issue | P0 |
| `app/[locale]/issue/[slug]/page.js` | Add dynamic metadata, NewsArticle schema | P0 |
| `app/studio/[[...index]]/page.js` | Add robots noindex | P0 |
| `components/CoverImage.js` | Switch to `<Image>` component | P1 |
| `components/StoryBlock.js` | Add semantic HTML, ARIA labels | P1 |
| `components/Header.js` | Add skip link, aria-labels | P1 |
| `next.config.mjs` | Add image optimization config | P1 |

---

## Appendix: Reference Links

- [Next.js 16 Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Dynamic Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata#dynamic-metadata)
- [Schema.org NewsArticle](https://schema.org/NewsArticle)
- [Google Search Central: Hreflang](https://developers.google.com/search/docs/crawling-indexing/localized-versions)
- [Web Vitals Thresholds](https://web.dev/articles/vitals)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Robots.txt Specification](https://www.robotstxt.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Tags](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

**End of Audit**

This document reflects the state of the codebase as of March 3, 2026. All recommendations are based on current Next.js 16 and Sanity 5 best practices.
