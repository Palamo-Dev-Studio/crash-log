// ABOUTME: Stack Trace section with a list of trace items.
// ABOUTME: "STACK TRACE" heading and items with left border.

import styles from "./StackTrace.module.css";

const LABELS = {
  en: { title: "Stack Trace" },
  es: { title: "Stack Trace" },
};

export default function StackTrace({ locale, items }) {
  const labels = LABELS[locale] || LABELS.en;

  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.triangle}>&#9654;</span>
        <span className={styles.label}>{labels.title}</span>
      </div>
      <div className={styles.items}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.itemTitle}>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </div>
            <div className={styles.itemDesc}>{item.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
