// ABOUTME: Off the Rails page head: file-code kicker with date, case count and reading time, H1, dek, byline + credit, stamp legend.
// ABOUTME: Ported from mockups/off-the-rails.html ".page-head"; the legend stamp uses the page's shared SVG filter.

import SeriesName from "@/components/SeriesName";
import VerdictStamp from "@/components/VerdictStamp";
import { OTR_LABELS } from "@/lib/offTheRailsLabels";
import styles from "./IssueHeader.module.css";

export default function IssueHeader({
  locale,
  code,
  date,
  caseCount,
  minutes,
  title,
  subtitle,
  byline,
  credit,
}) {
  const labels = OTR_LABELS[locale] || OTR_LABELS.en;
  const codeText = code && ` · ${labels.kickerFile} ${code}`;

  return (
    <section className={styles.head}>
      <div className={styles.kicker}>
        <span>
          <SeriesName series="offTheRails" locale={locale} />
          {codeText}
        </span>
        <span className={styles.segs}>
          {date && <span className={styles.seg}>{date}</span>}
          {caseCount > 0 && (
            <span className={styles.seg}>{labels.cases(caseCount)}</span>
          )}
          {minutes && (
            <span className={styles.seg}>{labels.minRead(minutes)}</span>
          )}
        </span>
      </div>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.dek}>{subtitle}</p>}
      {byline && (
        <p className={styles.byline}>
          <span className={styles.seg}>
            {labels.byPrefix} <strong>{byline}</strong>
          </span>
          {credit && <span className={styles.seg}>{credit}</span>}
        </p>
      )}
      <p className={styles.legend}>
        <VerdictStamp
          text={labels.legendStamp}
          index={2}
          className={styles.legendStamp}
        />
        {labels.legendText}
      </p>
    </section>
  );
}
