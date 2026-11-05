// ABOUTME: Magazine body for a series index: the newest file as a lead story, then a card grid of the rest.
// ABOUTME: With one file it shows only the lead; the lead cover loads eagerly (it can be the LCP element), grid covers lazily.

import FileCard from "@/components/FileCard";
import FileCardGrid from "@/components/FileCardGrid";
import styles from "./FileMagazine.module.css";

export default function FileMagazine({ docs, locale }) {
  if (!docs || docs.length === 0) return null;
  const [lead, ...rest] = docs;
  return (
    <>
      <div className={styles.lead}>
        <FileCard doc={lead} locale={locale} variant="lead" priority />
      </div>
      <FileCardGrid docs={rest} locale={locale} />
    </>
  );
}
