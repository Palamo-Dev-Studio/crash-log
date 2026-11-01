// ABOUTME: Plain-text byline for every series: a mono "By <name>" line (name bold) plus the credit when there is one.
// ABOUTME: No photo, avatar or initial; the issue header and the article layout both render this.

import { ARTICLE_LABELS } from "@/lib/articleLabels";
import styles from "./Byline.module.css";

export default function Byline({ locale, byline, credit = null }) {
  if (!byline) return null;
  const labels = ARTICLE_LABELS[locale] || ARTICLE_LABELS.en;
  return (
    <p className={styles.byline} data-byline>
      <span className={styles.seg}>
        {labels.byPrefix} <strong>{byline}</strong>
      </span>
      {credit && <span className={styles.seg}>{credit}</span>}
    </p>
  );
}
