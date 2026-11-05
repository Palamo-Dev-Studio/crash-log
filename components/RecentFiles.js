// ABOUTME: Home "Recent files": a row of three file cards, then a link to the archive.
// ABOUTME: Card layout lives in FileCard; the three-then-one column layout in FileCardGrid.

import Link from "next/link";
import FileCardGrid from "@/components/FileCardGrid";
import { HOME_LABELS } from "@/lib/homeLabels";
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
          <div className={styles.cards}>
            <FileCardGrid docs={docs} locale={locale} layout="trio" />
          </div>
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
