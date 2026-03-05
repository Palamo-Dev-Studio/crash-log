// ABOUTME: Collapsible Stack Trace section with a list of trace items.
// ABOUTME: Toggle triangle, "STACK TRACE" label, and items with left border.

"use client";

import { useState } from "react";
import styles from "./StackTrace.module.css";

const LABELS = {
  en: { title: "Stack Trace" },
  es: { title: "Stack Trace" },
};

export default function StackTrace({ locale, items }) {
  const [open, setOpen] = useState(true);
  const labels = LABELS[locale] || LABELS.en;

  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <button
        className={styles.header}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={`${styles.triangle} ${open ? styles.open : ""}`}>
          &#9654;
        </span>
        <span className={styles.label}>{labels.title}</span>
      </button>
      {open && (
        <div className={styles.items}>
          {items.map((item, i) => (
            <div key={i} className={styles.item}>
              <div className={styles.itemTitle}>{item.title}</div>
              <div className={styles.itemDesc}>{item.description}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
