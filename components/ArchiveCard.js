// ABOUTME: Issue summary card for the archive listing page.
// ABOUTME: Shows issue number, date, title, subtitle, and severity badges with hover accent.

import Link from "next/link";
import SeverityBadge from "@/components/SeverityBadge";
import styles from "./ArchiveCard.module.css";

function formatDate(dateString, locale) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ArchiveCard({
  issueNumber,
  date,
  title,
  subtitle,
  severities,
  slug,
  locale,
}) {
  const num = String(issueNumber).padStart(3, "0");

  return (
    <Link href={`/${locale}/issue/${slug}`} className={styles.card}>
      <div className={styles.meta}>
        <span>#{num}</span>
        <span>{formatDate(date, locale)}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {severities?.length > 0 && (
        <div className={styles.severities}>
          {[...new Set(severities)].map((s) => (
            <SeverityBadge key={s} severity={s} />
          ))}
        </div>
      )}
    </Link>
  );
}
