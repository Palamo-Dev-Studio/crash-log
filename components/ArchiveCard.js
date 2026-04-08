// ABOUTME: Issue summary card for the archive listing page.
// ABOUTME: Shows issue number, date, title, subtitle, and severity badges with hover accent.

import Link from "next/link";
import SeverityBadge from "@/components/SeverityBadge";
import { getStoryColorKey } from "@/lib/storyColors";
import { highlightMatches } from "@/lib/highlightMatches";
import { matchedInLabel } from "@/lib/matchedInLabel";
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
  query,
  matches,
}) {
  const num = String(issueNumber).padStart(3, "0");
  const matchedIn = matchedInLabel(matches, locale);

  const content = (
    <>
      <div className={styles.meta}>
        <span>#{num}</span>
        <span>{formatDate(date, locale)}</span>
      </div>
      <h3 className={styles.title}>{highlightMatches(title, query)}</h3>
      {subtitle && (
        <p className={styles.subtitle}>{highlightMatches(subtitle, query)}</p>
      )}
      {matchedIn && <p className={styles.matchedIn}>{matchedIn}</p>}
      {severities?.length > 0 && (
        <div className={styles.severities}>
          {severities.map((s, i) => (
            <SeverityBadge
              key={i}
              severity={s}
              colorKey={getStoryColorKey(i)}
            />
          ))}
        </div>
      )}
    </>
  );

  if (!slug) {
    return <div className={styles.card}>{content}</div>;
  }

  return (
    <Link href={`/${locale}/issue/${slug}`} className={styles.card}>
      {content}
    </Link>
  );
}
