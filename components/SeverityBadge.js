// ABOUTME: Severity badge component that renders a styled label for a story section.
// ABOUTME: Color is driven by a colorKey prop (mapped to CSS tokens), not the label text.

import styles from "./SeverityBadge.module.css";

export default function SeverityBadge({ severity, colorKey = "error" }) {
  const className = styles[colorKey] || styles.error;
  return <span className={`${styles.badge} ${className}`}>{severity}</span>;
}
