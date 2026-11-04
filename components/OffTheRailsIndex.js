// ABOUTME: Off the Rails series index: page head with a one-line description, then the newest issue as a lead and the rest as cards.
// ABOUTME: Lead and cards are the same FileCard the Practical and Nico's Notes indexes use.

import FileMagazine from "@/components/FileMagazine";
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
        <FileMagazine
          docs={issues.map((issue) => ({ ...issue, _type: "issue" }))}
          locale={locale}
        />
      </section>
    </main>
  );
}
