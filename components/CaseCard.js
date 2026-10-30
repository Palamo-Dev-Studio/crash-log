// ABOUTME: One Off the Rails case card: case number, verdict stamp, headline, image + credit, summary, source line, read link.
// ABOUTME: The case number links to the full file below the grid when `fileId` is set; the read link goes to the source URL with ?ref.

import Image from "next/image";
import VerdictStamp from "@/components/VerdictStamp";
import { t } from "@/lib/locale";
import { urlFor } from "@/lib/sanity";
import { withRef } from "@/lib/series";
import { caseNumber, OTR_LABELS } from "@/lib/offTheRailsLabels";
import { getCaseSummary, getSourceInfo, getVerdict } from "@/lib/caseCard";
import styles from "./CaseCard.module.css";

const IMAGE_WIDTH = 900;
const IMAGE_HEIGHT = 506;

export default function CaseCard({ story, index, locale, fileId }) {
  const labels = OTR_LABELS[locale] || OTR_LABELS.en;
  const headlineId = `case-headline-${caseNumber(index)}`;
  const number = `${labels.caseWord} ${caseNumber(index)}`;
  const summary = getCaseSummary(story, locale);
  const source = getSourceInfo(story);
  const imageUrl = story.image
    ? urlFor(story.image)
        .width(IMAGE_WIDTH)
        .height(IMAGE_HEIGHT)
        .format("webp")
        .url()
    : null;

  return (
    <article className={styles.case}>
      <div className={styles.top}>
        {fileId ? (
          <a href={`#${fileId}`} className={styles.number}>
            {number}
          </a>
        ) : (
          <span className={styles.number}>{number}</span>
        )}
        <VerdictStamp text={getVerdict(story, locale)} index={index} />
      </div>
      <h2 id={headlineId} className={styles.headline}>
        {t(story.headline, locale)}
      </h2>
      {imageUrl && (
        <figure className={styles.figure}>
          <Image
            src={imageUrl}
            alt={t(story.imageAlt, locale) || ""}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            className={styles.image}
            sizes="(max-width: 980px) 100vw, 550px"
          />
          {story.imageCredit && (
            <figcaption className={styles.credit}>
              {story.imageCredit}
            </figcaption>
          )}
        </figure>
      )}
      {summary && <p className={styles.summary}>{summary}</p>}
      {source && (
        <div className={styles.source}>
          <span className={`${styles.seg} ${styles.label}`}>
            {labels.source}
          </span>
          <span className={styles.seg}>
            <b>{source.outlet}</b>
            {source.extra > 0 && ` +${source.extra}`}
          </span>
        </div>
      )}
      {source?.url && (
        <a
          href={withRef(source.url)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.read}
          aria-describedby={headlineId}
        >
          {labels.readFile} <span aria-hidden="true">→</span>
        </a>
      )}
    </article>
  );
}
