// ABOUTME: Column summary card for the Nico's Notes archive listing page.
// ABOUTME: Shows column number, date, title, and subtitle with red accent hover.

import Link from "next/link";
import { highlightMatches } from "@/lib/highlightMatches";
import { matchedInLabel } from "@/lib/matchedInLabel";
import styles from "./ColumnCard.module.css";
import { formatDate } from "@/lib/formatDate";

export default function ColumnCard({
  columnNumber,
  date,
  title,
  subtitle,
  slug,
  locale,
  query,
  matches,
}) {
  const num = String(columnNumber).padStart(3, "0");
  const matchedIn = matchedInLabel(matches, locale);

  const content = (
    <>
      <div className={styles.meta}>
        <span>#{num}</span>
        <span>{formatDate(date, locale, "short")}</span>
        <span className={styles.kind}>
          {locale === "es" ? "Columna" : "Column"}
        </span>
      </div>
      <h3 className={styles.title}>{highlightMatches(title, query)}</h3>
      {subtitle && (
        <p className={styles.subtitle}>{highlightMatches(subtitle, query)}</p>
      )}
      {matchedIn && <p className={styles.matchedIn}>{matchedIn}</p>}
    </>
  );

  if (!slug) {
    return <div className={styles.card}>{content}</div>;
  }

  return (
    <Link href={`/${locale}/nico/${slug}`} className={styles.card}>
      {content}
    </Link>
  );
}
