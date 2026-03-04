// ABOUTME: RSS 2.0 feed route handler — one feed per locale at /[locale]/feed.xml.
// ABOUTME: Returns a valid RSS feed of published issues with localized titles and descriptions.

import { getIssuesForFeed } from "@/lib/queries";
import { t, LOCALE_LABELS } from "@/lib/locale";

const SITE_URL = "https://crashlog.ai";

const CHANNEL_META = {
  en: {
    title: "The Crash Log",
    description:
      "AI & Tech Gone Off the Rails — a bilingual newsletter tracking AI failures and tech disasters.",
  },
  es: {
    title: "The Crash Log",
    description:
      "IA y Tecnología Descarriladas — un boletín bilingüe que sigue los fallos de IA y desastres tecnológicos.",
  },
};

/**
 * Format a date string as RFC 822 for RSS pubDate.
 * Returns an empty string if the input is falsy.
 */
function toRfc822(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toUTCString();
}

/**
 * Escape special XML characters in a string.
 */
function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Build a minimal valid RSS 2.0 feed with no items (fallback for no Sanity client).
 */
function buildEmptyFeed(locale) {
  const meta = CHANNEL_META[locale] ?? CHANNEL_META.en;
  const langCode = LOCALE_LABELS[locale] ?? "en-US";
  const feedUrl = `${SITE_URL}/${locale}/feed.xml`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${SITE_URL}/${locale}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${langCode}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  </channel>
</rss>`;
}

export async function GET(request, { params }) {
  const { locale } = await params;
  const resolvedLocale = locale === "es" ? "es" : "en";

  const issues = await getIssuesForFeed();

  if (!issues || issues.length === 0) {
    const xml = buildEmptyFeed(resolvedLocale);
    return new Response(xml, {
      status: 200,
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  }

  const meta = CHANNEL_META[resolvedLocale] ?? CHANNEL_META.en;
  const langCode = LOCALE_LABELS[resolvedLocale] ?? "en-US";
  const feedUrl = `${SITE_URL}/${resolvedLocale}/feed.xml`;

  const items = issues
    .map((issue) => {
      const title = escapeXml(t(issue.title, resolvedLocale) ?? "");
      const description = escapeXml(t(issue.subtitle, resolvedLocale) ?? "");
      const link = `${SITE_URL}/${resolvedLocale}/issue/${issue.slug}`;
      const pubDate = toRfc822(issue.publishDate);
      const guid = link;

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${guid}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${SITE_URL}/${resolvedLocale}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${langCode}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
