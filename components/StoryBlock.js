// ABOUTME: Article section component with severity badge, headline, tags, and body text.
// ABOUTME: Renders a single story from a Crash Log issue with severity-driven styling.

import SeverityBadge from "./SeverityBadge";
import styles from "./StoryBlock.module.css";

const SEVERITY_TOKENS = {
  ERROR: "var(--severity-error)",
  OVERRIDE: "var(--severity-override)",
  TERMINATE: "var(--severity-terminate)",
  WARNING: "var(--severity-warning)",
  CRITICAL: "var(--severity-critical)",
  BREACH: "var(--severity-breach)",
};

export default function StoryBlock({ severity, headline, tags, children }) {
  const severityColor = SEVERITY_TOKENS[severity] || SEVERITY_TOKENS.ERROR;

  return (
    <article
      className={styles.section}
      style={{ "--severity-color": severityColor }}
    >
      <SeverityBadge severity={severity} />
      <h2 className={styles.title}>{headline}</h2>
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
