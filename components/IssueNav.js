// ABOUTME: Prev/next navigation component for issue pages.
// ABOUTME: Links to adjacent issues by issueNumber, styled with mono font and severity-error accents.

import Link from "next/link";
import { t } from "@/lib/locale";
import styles from "./IssueNav.module.css";

export default function IssueNav({ prev, next, locale }) {
  if (!prev && !next) return null;

  return (
    <nav className={styles.nav} aria-label={locale === "es" ? "Navegación de ediciones" : "Issue navigation"}>
      <div className={styles.side}>
        {prev && (
          <Link href={`/${locale}/issue/${prev.slug}`} className={styles.link}>
            <span className={styles.label}>
              {locale === "es" ? "← Anterior" : "← Previous"}
            </span>
            <span className={styles.title}>
              #{String(prev.issueNumber).padStart(3, "0")}{" "}
              {t(prev.title, locale)}
            </span>
          </Link>
        )}
      </div>
      <div className={`${styles.side} ${styles.right}`}>
        {next && (
          <Link href={`/${locale}/issue/${next.slug}`} className={styles.link}>
            <span className={styles.label}>
              {locale === "es" ? "Siguiente →" : "Next →"}
            </span>
            <span className={styles.title}>
              #{String(next.issueNumber).padStart(3, "0")}{" "}
              {t(next.title, locale)}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
