// ABOUTME: Story summary card for beat (category) detail pages.
// ABOUTME: Shows severity badge, headline, and parent issue context with link.

import Link from "next/link";
import { t } from "@/lib/locale";
import SeverityBadge from "@/components/SeverityBadge";
import styles from "./BeatStoryCard.module.css";

function formatDate(dateString, locale) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BeatStoryCard({
  severity,
  headline,
  issueMeta,
  locale,
  colorKey = "error",
}) {
  const headlineText =
    typeof headline === "object" ? t(headline, locale) : headline;

  if (!issueMeta?.slug) return null;

  const issueNum = String(issueMeta.number).padStart(3, "0");

  return (
    <Link href={`/${locale}/issue/${issueMeta.slug}`} className={styles.card}>
      <div className={styles.top}>
        <SeverityBadge severity={severity} colorKey={colorKey} />
        <span className={styles.issueMeta}>
          #{issueNum} · {formatDate(issueMeta.date, locale)}
        </span>
      </div>
      <h3 className={styles.headline}>{headlineText}</h3>
    </Link>
  );
}
