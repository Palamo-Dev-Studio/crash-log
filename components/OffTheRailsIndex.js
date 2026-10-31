// ABOUTME: Off the Rails series index: page head with a one-line description, then every issue as a file row, newest first.
// ABOUTME: Rows are the same FileRow the home "Recent files" list uses.

import FileRow from "@/components/FileRow";
import { OTR_LABELS } from "@/lib/offTheRailsLabels";
import styles from "./OffTheRailsIndex.module.css";

export default function OffTheRailsIndex({ issues, locale }) {
  const labels = OTR_LABELS[locale] || OTR_LABELS.en;

  return (
    <main>
      <section className={styles.head}>
        <h1 className={styles.title}>{labels.indexTitle}</h1>
        <p className={styles.dek}>{labels.indexDescription}</p>
      </section>
      <section className={styles.list} aria-labelledby="otr-index-heading">
        <h2 id="otr-index-heading" className={styles.heading}>
          {labels.indexHeading}
        </h2>
        {issues.length === 0 && (
          <p className={styles.empty}>{labels.indexEmpty}</p>
        )}
        {issues.map((issue) => (
          <FileRow
            key={issue._id}
            doc={{ ...issue, _type: "issue" }}
            locale={locale}
          />
        ))}
      </section>
    </main>
  );
}
