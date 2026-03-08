// ABOUTME: Latest issue page — the homepage for each locale.
// ABOUTME: Two-column layout: latest issue + Nico's Notes sidebar widget.

import { cache } from "react";
import { getLatestIssue, getLatestColumn } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import IssueContent from "@/components/IssueContent";
import NicosNotesWidget from "@/components/NicosNotesWidget";
import styles from "./home.module.css";

const getCachedLatestIssue = cache(getLatestIssue);
const getCachedLatestColumn = cache(getLatestColumn);

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const issue = await getCachedLatestIssue();

  if (!issue) {
    return {
      title:
        locale === "es"
          ? "El Crash Log — IA y tecnología descarriladas"
          : "The Crash Log — AI & Tech Gone Off the Rails",
    };
  }

  const title = t(issue.title, locale) || "The Crash Log";
  const description =
    t(issue.metaDescription, locale) ||
    (locale === "es"
      ? "La última edición de The Crash Log"
      : "The latest issue of The Crash Log");

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}`,
      languages: {
        "en-US": "/en",
        "es-ES": "/es",
        "x-default": "/en",
      },
    },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  const [issue, column] = await Promise.all([
    getCachedLatestIssue(),
    getCachedLatestColumn(),
  ]);

  return (
    <div className={column ? styles.grid : undefined}>
      <div className={styles.main}>
        <IssueContent issue={issue} locale={locale} />
      </div>
      {column && (
        <div className={styles.sidebar}>
          <NicosNotesWidget column={column} locale={locale} />
        </div>
      )}
    </div>
  );
}
