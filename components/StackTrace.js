// ABOUTME: Collapsible Stack Trace section with a list of trace items.
// ABOUTME: Toggle triangle, "STACK TRACE" label, and items with left border.

"use client";

import { useState } from "react";
import styles from "./StackTrace.module.css";

export default function StackTrace({ items }) {
  const [open, setOpen] = useState(true);

  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <button
        className={styles.header}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={`${styles.triangle} ${open ? styles.open : ""}`}>
          &#9660;
        </span>
        <span className={styles.label}>Stack Trace</span>
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
