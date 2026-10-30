// ABOUTME: Story row for beat (category) detail pages: issue code chip, date, headline and a mono severity label.
// ABOUTME: Links to the parent issue; the severity is a calm mono label, not a stamp, because rows repeat down the page.

import Link from "next/link";
import { t } from "@/lib/locale";
import FileChip from "@/components/FileChip";
import styles from "./BeatStoryCard.module.css";
import { formatDate } from "@/lib/formatDate";

export default function BeatStoryCard({
  severity,
  verdict,
  headline,
  issueMeta,
  locale,
}) {
  const headlineText =
    typeof headline === "object" ? t(headline, locale) : headline;

  if (!issueMeta?.slug) return null;

  // Prefer the plain-English verdict when a story has one; older stories fall back to severity.
  const label = (verdict && t(verdict, locale)) || severity;

  return (
    <Link href={`/${locale}/issue/${issueMeta.slug}`} className={styles.row}>
      <FileChip
        doc={{ _type: "issue", issueNumber: issueMeta.number }}
        variant="plain"
      />
      <span className={styles.when}>
        {formatDate(issueMeta.date, locale, "short")}
      </span>
      <h2 className={styles.headline}>{headlineText}</h2>
      {label && <span className={styles.label}>{label}</span>}
    </Link>
  );
}
