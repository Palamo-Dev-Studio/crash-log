// ABOUTME: Sidebar widget showing the latest Nico's Notes column on the home page.
// ABOUTME: Displays title, date, excerpt, and links to the column and archive.

import Link from "next/link";
import { t } from "@/lib/locale";
import { toPlainText } from "@portabletext/react";
import styles from "./NicosNotesWidget.module.css";

function formatDate(dateString, locale) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const LABELS = {
  en: { heading: "Nico\u2019s Notes", read: "Read", seeAll: "See all" },
  es: { heading: "Notas de Nico", read: "Leer", seeAll: "Ver todas" },
};

export default function NicosNotesWidget({ column, locale }) {
  if (!column) return null;

  const l = LABELS[locale] || LABELS.en;
  const title = t(column.title, locale);
  const body = t(column.body, locale);
  const excerpt = body ? toPlainText(body).slice(0, 150).trim() + "\u2026" : "";
  const slug = column.slug;
  const num = String(column.columnNumber).padStart(3, "0");

  return (
    <aside className={styles.widget} aria-label={l.heading}>
      <h2 className={styles.heading}>{l.heading}</h2>

      <p className={styles.meta}>
        #{num} &middot; {formatDate(column.publishDate, locale)}
      </p>

      <h3 className={styles.title}>
        <Link href={`/${locale}/nico/${slug}`} className={styles.titleLink}>
          {title}
        </Link>
      </h3>

      {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

      <div className={styles.links}>
        <Link href={`/${locale}/nico/${slug}`} className={styles.readLink}>
          {l.read} &rarr;
        </Link>
        <Link href={`/${locale}/nico`} className={styles.archiveLink}>
          {l.seeAll}
        </Link>
      </div>
    </aside>
  );
}
