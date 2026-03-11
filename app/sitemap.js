// ABOUTME: Dynamic sitemap generator for search engine indexing.
// ABOUTME: Lists all locale variants of home, about, archive, and individual issue pages.

import {
  getAllIssuesSummary,
  getAllCategories,
  getAllColumnsSummary,
} from "@/lib/queries";
import { LOCALES } from "@/lib/locale";

const BASE_URL = "https://crashlog.ai";

// Stable timestamp for static pages to avoid search engines seeing constant changes
const STATIC_PAGE_DATE = "2026-03-04T00:00:00.000Z";

export default async function sitemap() {
  const [issues, categories, columns] = await Promise.all([
    getAllIssuesSummary(),
    getAllCategories(),
    getAllColumnsSummary(),
  ]);

  const staticPages = ["", "/about", "/archive", "/beats", "/nico", "/support"];
  const staticEntries = staticPages.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1.0 : 0.7,
      alternates: {
        languages: {
          "en-US": `${BASE_URL}/en${path}`,
          "es-ES": `${BASE_URL}/es${path}`,
          "x-default": `${BASE_URL}/en${path}`,
        },
      },
    }))
  );

  const issueEntries = issues.flatMap((issue) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/issue/${issue.slug}`,
      lastModified:
        issue._updatedAt || issue.publishDate || new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          "en-US": `${BASE_URL}/en/issue/${issue.slug}`,
          "es-ES": `${BASE_URL}/es/issue/${issue.slug}`,
          "x-default": `${BASE_URL}/en/issue/${issue.slug}`,
        },
      },
    }))
  );

  const beatEntries = categories.flatMap((cat) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/beat/${cat.slug}`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: {
          "en-US": `${BASE_URL}/en/beat/${cat.slug}`,
          "es-ES": `${BASE_URL}/es/beat/${cat.slug}`,
          "x-default": `${BASE_URL}/en/beat/${cat.slug}`,
        },
      },
    }))
  );

  const columnEntries = columns.flatMap((col) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/nico/${col.slug}`,
      lastModified:
        col._updatedAt || col.publishDate || new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          "en-US": `${BASE_URL}/en/nico/${col.slug}`,
          "es-ES": `${BASE_URL}/es/nico/${col.slug}`,
          "x-default": `${BASE_URL}/en/nico/${col.slug}`,
        },
      },
    }))
  );

  return [...staticEntries, ...issueEntries, ...columnEntries, ...beatEntries];
}
