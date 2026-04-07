// ABOUTME: Archive page listing all published issues + Nico's Notes columns with inline search.
// ABOUTME: Server-fetches data, builds a flattened search index, hands off to ArchiveSearch client component.

import { cache } from "react";
import {
  getAllIssuesForArchive,
  getAllColumnsForArchiveSearch,
  getAllCategories,
} from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import { portableTextToPlain } from "@/lib/portableTextToPlain";
import ArchiveSearch from "@/components/ArchiveSearch";
import Footer from "@/components/Footer";
import styles from "./archive.module.css";

const getCachedArchive = cache(getAllIssuesForArchive);
const getCachedColumns = cache(getAllColumnsForArchiveSearch);
const getCachedCategories = cache(getAllCategories);

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const title = locale === "es" ? "Archivo" : "Archive";
  const description =
    locale === "es"
      ? "Todas las ediciones de The Crash Log"
      : "All issues of The Crash Log";

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/archive`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/archive`,
      languages: {
        "en-US": "/en/archive",
        "es-ES": "/es/archive",
        "x-default": "/en/archive",
      },
    },
  };
}

function lower(s) {
  return (s || "").toString().toLowerCase();
}

function buildIssueIndexEntry(issue, locale) {
  const title = t(issue.title, locale) || "";
  const subtitle = t(issue.subtitle, locale) || "";
  const transmission = portableTextToPlain(t(issue.nicosTransmission, locale));
  const headlines = (issue.stories || [])
    .map((s) => t(s?.headline, locale) || "")
    .join("\n");
  const bodies = (issue.stories || [])
    .map((s) => portableTextToPlain(t(s?.body, locale)))
    .join("\n");
  const stackTrace = (issue.stackTrace || [])
    .map((hit) => portableTextToPlain(t(hit?.text, locale)))
    .join("\n");

  // Collect unique categories with localized names.
  const categoryMap = new Map();
  for (const story of issue.stories || []) {
    const cat = story?.category;
    if (cat?.slug && !categoryMap.has(cat.slug)) {
      categoryMap.set(cat.slug, {
        slug: cat.slug,
        name: t(cat.name, locale) || cat.slug,
      });
    }
  }

  const fields = {
    titleSubtitle: lower([title, subtitle].join(" ")),
    transmission: lower(transmission),
    headlines: lower(headlines),
    bodies: lower(bodies),
    stackTrace: lower(stackTrace),
    columnBody: "",
  };

  return {
    id: issue._id,
    type: "issue",
    publishDate: issue.publishDate,
    title,
    subtitle,
    searchText: Object.values(fields).join(" "),
    fields,
    categories: Array.from(categoryMap.values()),
    raw: {
      issueNumber: issue.issueNumber,
      slug: issue.slug,
      severities: issue.severities,
    },
  };
}

function buildColumnIndexEntry(column, locale) {
  const title = t(column.title, locale) || "";
  const subtitle = t(column.subtitle, locale) || "";
  const body = portableTextToPlain(t(column.body, locale));

  const fields = {
    titleSubtitle: lower([title, subtitle].join(" ")),
    transmission: "",
    headlines: "",
    bodies: "",
    stackTrace: "",
    columnBody: lower(body),
  };

  return {
    id: column._id,
    type: "column",
    publishDate: column.publishDate,
    title,
    subtitle,
    searchText: Object.values(fields).join(" "),
    fields,
    categories: [],
    raw: {
      columnNumber: column.columnNumber,
      slug: column.slug,
    },
  };
}

export default async function ArchivePage({ params }) {
  const { locale } = await params;
  const [issues, columns, allCategories] = await Promise.all([
    getCachedArchive(),
    getCachedColumns(),
    getCachedCategories(),
  ]);

  const items = [
    ...issues.map((i) => buildIssueIndexEntry(i, locale)),
    ...columns.map((c) => buildColumnIndexEntry(c, locale)),
  ].sort((a, b) => {
    const da = a.publishDate || "";
    const db = b.publishDate || "";
    return db.localeCompare(da);
  });

  // Only surface categories that actually appear in current issues.
  const presentSlugs = new Set();
  for (const item of items) {
    for (const c of item.categories) presentSlugs.add(c.slug);
  }
  const filterCategories = (allCategories || [])
    .filter((c) => presentSlugs.has(c.slug))
    .map((c) => ({ slug: c.slug, name: t(c.name, locale) || c.slug }));

  const empty = items.length === 0;

  return (
    <main>
      <h1 className={styles.heading}>
        {locale === "es" ? "Archivo de The Crash Log" : "The Crash Log Archive"}
      </h1>

      {empty ? (
        <p className={styles.empty}>
          {locale === "es"
            ? "No hay contenido publicado todavía."
            : "No content published yet."}
        </p>
      ) : (
        <ArchiveSearch
          items={items}
          categories={filterCategories}
          locale={locale}
        />
      )}

      <Footer locale={locale} />
    </main>
  );
}
