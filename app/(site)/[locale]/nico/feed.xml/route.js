// ABOUTME: RSS 2.0 feed route handler for Nico's Notes columns.
// ABOUTME: Returns a valid RSS feed of published columns with localized titles.

import { getColumnsForFeed } from "@/lib/queries";
import { t } from "@/lib/locale";

const RSS_LANG = {
  en: "en-us",
  es: "es-es",
};

const SITE_URL = "https://crashlog.ai";

const CHANNEL_META = {
  en: {
    title: "Nico\u2019s Notes \u2014 The Crash Log",
    description:
      "A weekly column by Nico, the managing editor of The Crash Log.",
  },
  es: {
    title: "Notas de Nico \u2014 The Crash Log",
    description:
      "Una columna semanal de Nico, el editor jefe de The Crash Log.",
  },
};

function toRfc822(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toUTCString();
}

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildEmptyFeed(locale) {
  const meta = CHANNEL_META[locale] ?? CHANNEL_META.en;
  const langCode = RSS_LANG[locale] ?? "en-us";
  const feedUrl = `${SITE_URL}/${locale}/nico/feed.xml`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${SITE_URL}/${locale}/nico</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${langCode}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  </channel>
</rss>`;
}

export async function GET(request, { params }) {
  const { locale } = await params;
  const resolvedLocale = locale === "es" ? "es" : "en";

  const columns = await getColumnsForFeed();

  if (!columns || columns.length === 0) {
    const xml = buildEmptyFeed(resolvedLocale);
    return new Response(xml, {
      status: 200,
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  }

  const meta = CHANNEL_META[resolvedLocale] ?? CHANNEL_META.en;
  const langCode = RSS_LANG[resolvedLocale] ?? "en-us";
  const feedUrl = `${SITE_URL}/${resolvedLocale}/nico/feed.xml`;

  const items = columns
    .map((column) => {
      const title = escapeXml(t(column.title, resolvedLocale) ?? "");
      const description = escapeXml(t(column.subtitle, resolvedLocale) ?? "");
      const link = `${SITE_URL}/${resolvedLocale}/nico/${column.slug}`;
      const pubDate = toRfc822(column.publishDate);
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
    <link>${SITE_URL}/${resolvedLocale}/nico</link>
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
