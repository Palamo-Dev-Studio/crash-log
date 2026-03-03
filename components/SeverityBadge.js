// ABOUTME: Severity badge component that renders a styled label based on severity level.
// ABOUTME: Maps severity enum values to design tokens for color, background, and border.

import styles from "./SeverityBadge.module.css";

const SEVERITY_MAP = {
  ERROR: "error",
  OVERRIDE: "override",
  TERMINATE: "terminate",
  WARNING: "warning",
  CRITICAL: "critical",
  BREACH: "breach",
};

export default function SeverityBadge({ severity }) {
  const className = SEVERITY_MAP[severity] || "error";
  return (
    <span className={`${styles.badge} ${styles[className]}`}>
      {severity}
    </span>
  );
}
