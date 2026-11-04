// ABOUTME: Responsive grid of FileCard cards: 3 columns from 1024px, 2 on tablet, 1 on phone; the "trio" layout is 3 columns, then 1.
// ABOUTME: Renders nothing for an empty list, so a series with a single file shows only its lead.

import FileCard from "@/components/FileCard";
import styles from "./FileCardGrid.module.css";

export default function FileCardGrid({ docs, locale, layout = "grid" }) {
  if (!docs || docs.length === 0) return null;
  return (
    <div
      className={`${styles.grid} ${layout === "trio" ? styles.trio : ""}`.trim()}
      data-file-grid
    >
      {docs.map((doc) => (
        <FileCard key={doc._id} doc={doc} locale={locale} layout={layout} />
      ))}
    </div>
  );
}
