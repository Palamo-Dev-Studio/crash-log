// ABOUTME: One file row: code, date, serif title and byline, linking to the file; shared by home "Recent files", the series indexes and archive results.
// ABOUTME: Archive results pass a highlighted title, subtitle and matched-in line; rows stack (code, date, title, byline) at 700px and below.

import Link from "next/link";
import FileChip from "@/components/FileChip";
import { t } from "@/lib/locale";
import { formatDate } from "@/lib/formatDate";
import { getByline } from "@/lib/series";
import { HOME_LABELS, fileHref } from "@/lib/homeLabels";
import styles from "./FileRow.module.css";

export default function FileRow({
  doc,
  locale,
  title,
  titleTag: TitleTag = "span",
  subtitle,
  matchedIn,
}) {
  const labels = HOME_LABELS[locale] || HOME_LABELS.en;
  return (
    <Link href={fileHref(doc, locale)} className={styles.row}>
      <FileChip doc={doc} variant="plain" />
      <span className={styles.when}>
        {formatDate(doc.publishDate, locale, "short")}
      </span>
      <span className={styles.main}>
        <TitleTag className={styles.title}>
          {title ?? t(doc.title, locale)}
        </TitleTag>
        {subtitle && <span className={styles.sub}>{subtitle}</span>}
        {matchedIn && <span className={styles.matched}>{matchedIn}</span>}
      </span>
      <span className={styles.by}>
        {labels.byPrefix} {getByline(doc, locale)}
      </span>
    </Link>
  );
}
