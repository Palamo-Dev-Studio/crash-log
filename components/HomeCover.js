// ABOUTME: Home cover hero: the newest file of any series with a feathered illustration, code chip, byline, H1, dek and read cue.
// ABOUTME: The whole hero links to the file; with no cover image the text block stands alone.

import Image from "next/image";
import Link from "next/link";
import FileChip, { seriesName } from "@/components/FileChip";
import { t } from "@/lib/locale";
import { urlFor } from "@/lib/sanity";
import { formatDate } from "@/lib/formatDate";
import { getByline, getSeries } from "@/lib/series";
import { getReadingMinutes } from "@/lib/readingTime";
import { HOME_LABELS, fileHref } from "@/lib/homeLabels";
import styles from "./HomeCover.module.css";

const IMAGE_WIDTH = 1100;
const IMAGE_HEIGHT = 635;

export default function HomeCover({ doc, locale }) {
  if (!doc) return null;

  const labels = HOME_LABELS[locale] || HOME_LABELS.en;
  const title = t(doc.title, locale);
  const dek = t(doc.subtitle, locale) || t(doc.metaDescription, locale);
  const minutes = getReadingMinutes(doc, locale);
  const byline = getByline(doc, locale);

  const imageUrl = doc.coverImage
    ? urlFor(doc.coverImage)
        .width(IMAGE_WIDTH)
        .height(IMAGE_HEIGHT)
        .format("webp")
        .url()
    : null;
  const alt = t(doc.coverImageAlt, locale) || "";

  return (
    <article className={styles.cover}>
      <Link href={fileHref(doc, locale)} className={styles.link}>
        {imageUrl && (
          <div className={styles.art}>
            <Image
              src={imageUrl}
              alt={alt}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              className={styles.image}
              priority
              sizes="(max-width: 980px) 100vw, 740px"
            />
          </div>
        )}
        <div className={styles.metaRow}>
          <FileChip doc={doc} />
          <span className={styles.segs}>
            <span className={styles.seg}>
              {seriesName(getSeries(doc), locale)}
            </span>
            {byline && (
              <span className={styles.seg}>
                {labels.byPrefix} {byline}
              </span>
            )}
            <span className={styles.seg}>
              {formatDate(doc.publishDate, locale, "long")}
            </span>
            {minutes && (
              <span className={styles.seg}>{labels.minRead(minutes)}</span>
            )}
          </span>
        </div>
        <h1 className={styles.title}>{title}</h1>
        {dek && <p className={styles.dek}>{dek}</p>}
        <span className={styles.cue}>{labels.readFile} →</span>
      </Link>
    </article>
  );
}
