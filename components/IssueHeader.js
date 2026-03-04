// ABOUTME: Issue header displaying issue number, date, title, and subtitle.
// ABOUTME: Red dot indicator, mono meta line, display font title, serif subtitle.

import styles from "./IssueHeader.module.css";

export default function IssueHeader({ issueNumber, date, title, subtitle }) {
  return (
    <section className={styles.header}>
      <div className={styles.meta}>
        <span className={styles.dot} aria-hidden="true" />
        Issue #{String(issueNumber).padStart(3, "0")} &middot; {date}
      </div>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </section>
  );
}
