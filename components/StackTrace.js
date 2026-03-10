// ABOUTME: Stack Trace section with rich text items and source attribution.
// ABOUTME: "STACK TRACE" heading, items with left border, body text then sources below.

import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/lib/portableText";
import styles from "./StackTrace.module.css";

const LABELS = {
  en: { title: "Stack Trace", source: "Source" },
  es: { title: "Stack Trace", source: "Fuente" },
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
            <div className={styles.itemBody}>
              {item.body ? (
                <PortableText
                  value={item.body}
                  components={portableTextComponents}
                />
              ) : (
                item.description && <p>{item.description}</p>
              )}
            </div>
            {item.sources && item.sources.length > 0 && (
              <div className={styles.itemSources}>
                <span className={styles.sourceLabel}>{labels.source}: </span>
                {item.sources.map((source, j) => (
                  <span key={j}>
                    {j > 0 && <span className={styles.sourceSep}> · </span>}
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                      >
                        {source.outlet || source.title || source.url}
                      </a>
                    ) : (
                      <span>{source.outlet || source.title}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
