// ABOUTME: Article section component with severity badge, headline, tags, and body text.
// ABOUTME: Color is driven by a colorKey prop that maps to CSS severity tokens.

import Link from "next/link";
import SeverityBadge from "./SeverityBadge";
import styles from "./StoryBlock.module.css";

export default function StoryBlock({
  severity,
  headline,
  tags,
  category,
  locale,
  colorKey = "error",
  children,
}) {
  const severityColor = `var(--severity-${colorKey})`;

  return (
    <article
      className={styles.section}
      style={{ "--severity-color": severityColor }}
    >
      <SeverityBadge severity={severity} colorKey={colorKey} />
      <h2 className={styles.title}>{headline}</h2>
      {tags && (
        <div className={styles.tags}>
          {tags.map((tag, i) => (
            <span key={i}>
              {i > 0 && <span className={styles.tagSep}>/</span>}
              {tag}
            </span>
          ))}
          {category?.slug?.current && locale && (
            <>
              <span className={styles.tagSep}>·</span>
              <Link
                href={`/${locale}/beat/${category.slug.current}`}
                className={styles.beatLink}
              >
                {category.name ? (typeof category.name === "object" ? (category.name[locale] || category.name.en) : category.name) : ""}
              </Link>
            </>
          )}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </article>
  );
}
