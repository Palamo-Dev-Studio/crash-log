// ABOUTME: Home right rail "Latest files": series colour key, the latest file of each series, and the subscribe box.
// ABOUTME: The cover's entry is highlighted and marked "On the cover"; series with no file get no slot.

import Link from "next/link";
import FileChip, { seriesName } from "@/components/FileChip";
import { t } from "@/lib/locale";
import { formatDate } from "@/lib/formatDate";
import { getByline } from "@/lib/series";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";
import { HOME_LABELS, fileHref } from "@/lib/homeLabels";
import styles from "./HomeRail.module.css";

const KEY_ORDER = [
  ["offTheRails", "keyOtr"],
  ["practical", "keyFix"],
  ["nicosNotes", "keyNote"],
];

export default function HomeRail({ rail, locale }) {
  const labels = HOME_LABELS[locale] || HOME_LABELS.en;

  return (
    <aside className={styles.rail} aria-label={labels.railHeading}>
      <div className={styles.heading}>
        {labels.railHeading}
        <ul className={styles.key} aria-label={labels.railKey}>
          {KEY_ORDER.map(([series, cls]) => (
            <li key={series} className={styles[cls]}>
              <i aria-hidden="true" />
              {seriesName(series, locale)}
            </li>
          ))}
        </ul>
      </div>

      {rail.map(({ series, doc, onCover }) => (
        <Link
          key={doc._id}
          href={fileHref(doc, locale)}
          className={`${styles.item} ${onCover ? styles.isCover : ""}`.trim()}
          data-series={series}
        >
          <span className={styles.tag}>
            <FileChip doc={doc} variant="plain" />
            <span className={styles.date}>
              {formatDate(doc.publishDate, locale, "dayMonth")}
            </span>
          </span>
          <span className={styles.title}>
            {t(doc.title, locale)}
            <span className={styles.by}>
              {labels.byPrefix} {getByline(doc, locale)}
            </span>
            {onCover && (
              <span className={styles.onCover}>{labels.onCover}</span>
            )}
          </span>
        </Link>
      ))}

      <div className={styles.subscribe}>
        <p>{labels.subscribeLine}</p>
        <a href={SUBSTACK_SUBSCRIBE_URL} className={styles.button}>
          {labels.subscribe}
        </a>
      </div>
    </aside>
  );
}
