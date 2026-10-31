// ABOUTME: Home "Recent files" list: one FileRow per file, then a link to the archive.
// ABOUTME: Row layout and its mobile stacking live in FileRow.

import Link from "next/link";
import FileRow from "@/components/FileRow";
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
          {docs.map((doc) => (
            <FileRow key={doc._id} doc={doc} locale={locale} />
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
