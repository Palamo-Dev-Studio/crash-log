// ABOUTME: Archive page listing all published issues in reverse chronological order.
// ABOUTME: Uses ArchiveCard components with severity badges, links to individual issues.

import { cache } from "react";
import { getAllIssuesForArchive } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import ArchiveCard from "@/components/ArchiveCard";
import Footer from "@/components/Footer";
import styles from "./archive.module.css";

const getCachedArchive = cache(getAllIssuesForArchive);

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

export default async function ArchivePage({ params }) {
  const { locale } = await params;
  const issues = await getCachedArchive();

  return (
    <main>
      <h2 className={styles.heading}>
        {locale === "es" ? "── ARCHIVO ──" : "── ARCHIVE ──"}
      </h2>

      {issues.length === 0 ? (
        <p className={styles.empty}>
          {locale === "es"
            ? "No hay ediciones publicadas todavía."
            : "No issues published yet."}
        </p>
      ) : (
        issues.map((issue) => (
          <ArchiveCard
            key={issue._id}
            issueNumber={issue.issueNumber}
            date={issue.publishDate}
            title={t(issue.title, locale)}
            subtitle={t(issue.subtitle, locale)}
            severities={issue.severities}
            slug={issue.slug}
            locale={locale}
          />
        ))
      )}

      <Footer locale={locale} />
    </main>
  );
}
