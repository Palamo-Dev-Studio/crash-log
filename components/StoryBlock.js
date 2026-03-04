// ABOUTME: Article section component with severity badge, headline, tags, and body text.
// ABOUTME: Renders a single story from a Crash Log issue with severity-driven styling.

import SeverityBadge from "./SeverityBadge";
import styles from "./StoryBlock.module.css";

export default function StoryBlock({ severity, headline, tags, children }) {
  return (
    <article className={styles.section}>
      <SeverityBadge severity={severity} />
      <h2 className={styles.title}>
        {headline}
      </h2>
      {tags && (
        <div className={styles.tags}>
          {tags.map((tag, i) => (
            <span key={i}>
              {i > 0 && <span className={styles.tagSep}>/</span>}
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </article>
  );
}
