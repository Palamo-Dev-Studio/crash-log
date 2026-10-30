// ABOUTME: Prev/next navigation for issue pages, linking to adjacent issues by issueNumber.
// ABOUTME: Mono labels over serif titles, prefixed with the OTR file code.

import Link from "next/link";
import { t } from "@/lib/locale";
import { getFileCode } from "@/lib/series";
import { OTR_LABELS } from "@/lib/offTheRailsLabels";
import styles from "./IssueNav.module.css";

function codeOf(issue) {
  return getFileCode({ ...issue, _type: "issue" });
}

export default function IssueNav({ prev, next, locale }) {
  if (!prev && !next) return null;
  const labels = OTR_LABELS[locale] || OTR_LABELS.en;

  return (
    <nav className={styles.nav} aria-label={labels.issueNav}>
      <div className={styles.side}>
        {prev && (
          <Link href={`/${locale}/issue/${prev.slug}`} className={styles.link}>
            <span className={styles.label}>{labels.previous}</span>
            <span className={styles.title}>
              {codeOf(prev)} {t(prev.title, locale)}
            </span>
          </Link>
        )}
      </div>
      <div className={`${styles.side} ${styles.right}`}>
        {next && (
          <Link href={`/${locale}/issue/${next.slug}`} className={styles.link}>
            <span className={styles.label}>{labels.next}</span>
            <span className={styles.title}>
              {codeOf(next)} {t(next.title, locale)}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
