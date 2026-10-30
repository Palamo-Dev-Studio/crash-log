// ABOUTME: Series index (Practical, Nico's Notes): page head with a one-line description, then every file as a FileRow, newest first.
// ABOUTME: With no files it shows an intentional empty state, plus a Subscribe link when the series has one.

import FileRow from "@/components/FileRow";
import { SERIES_INDEX_LABELS } from "@/lib/articleLabels";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";
import styles from "./SeriesIndex.module.css";

const DOC_TYPES = { practical: "practical", nicosNotes: "column" };

export default function SeriesIndex({ series, docs, locale }) {
  const labels =
    SERIES_INDEX_LABELS[series][locale] || SERIES_INDEX_LABELS[series].en;
  const headingId = `${series}-index-heading`;

  return (
    <main>
      <section className={styles.head}>
        <h1 className={styles.title}>{labels.title}</h1>
        <p className={styles.dek}>{labels.description}</p>
      </section>
      <section className={styles.list} aria-labelledby={headingId}>
        <h2 id={headingId} className={styles.heading}>
          {labels.heading}
        </h2>
        {docs.length === 0 && (
          <div className={styles.empty}>
            <p>{labels.empty}</p>
            {labels.emptyCta && (
              <a className={styles.emptyCta} href={SUBSTACK_SUBSCRIBE_URL}>
                {labels.emptyCta}
              </a>
            )}
          </div>
        )}
        {docs.map((doc) => (
          <FileRow
            key={doc._id}
            doc={{ ...doc, _type: DOC_TYPES[series] }}
            locale={locale}
          />
        ))}
      </section>
    </main>
  );
}
