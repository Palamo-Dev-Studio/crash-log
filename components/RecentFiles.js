// ABOUTME: Home "Recent files" list: code, date, serif title and byline per row, then a link to the archive.
// ABOUTME: Rows stack (code, date, title, byline) on mobile.

import Link from "next/link";
import FileChip from "@/components/FileChip";
import { t } from "@/lib/locale";
import { formatDate } from "@/lib/formatDate";
import { getByline } from "@/lib/series";
import { HOME_LABELS, fileHref } from "@/lib/homeLabels";
import styles from "./RecentFiles.module.css";

export default function RecentFiles({ docs, locale }) {
  const labels = HOME_LABELS[locale] || HOME_LABELS.en;

  return (
    <section
      className={styles.recent}
      aria-labelledby={docs.length > 0 ? "recent-files-heading" : undefined}
    >
      {docs.length > 0 && (
        <>
          <h2 id="recent-files-heading" className={styles.heading}>
            {labels.recentHeading}
          </h2>
          {docs.map((doc) => (
            <Link
              key={doc._id}
              href={fileHref(doc, locale)}
              className={styles.row}
            >
              <FileChip doc={doc} variant="plain" />
              <span className={styles.when}>
                {formatDate(doc.publishDate, locale, "short")}
              </span>
              <span className={styles.title}>{t(doc.title, locale)}</span>
              <span className={styles.by}>
                {labels.byPrefix} {getByline(doc, locale)}
              </span>
            </Link>
          ))}
        </>
      )}
      <div className={styles.archiveWrap}>
        <Link href={`/${locale}/archive`} className={styles.archive}>
          {labels.archive} →
        </Link>
      </div>
    </section>
  );
}
