// ABOUTME: One file row: code, date, serif title and byline, linking to the file; shared by home "Recent files" and the series index.
// ABOUTME: Rows stack (code, date, title, byline) at 700px and below.

import Link from "next/link";
import FileChip from "@/components/FileChip";
import { t } from "@/lib/locale";
import { formatDate } from "@/lib/formatDate";
import { getByline } from "@/lib/series";
import { HOME_LABELS, fileHref } from "@/lib/homeLabels";
import styles from "./FileRow.module.css";

export default function FileRow({ doc, locale }) {
  const labels = HOME_LABELS[locale] || HOME_LABELS.en;
  return (
    <Link href={fileHref(doc, locale)} className={styles.row}>
      <FileChip doc={doc} variant="plain" />
      <span className={styles.when}>
        {formatDate(doc.publishDate, locale, "short")}
      </span>
      <span className={styles.title}>{t(doc.title, locale)}</span>
      <span className={styles.by}>
        {labels.byPrefix} {getByline(doc, locale)}
      </span>
    </Link>
  );
}
