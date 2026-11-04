// ABOUTME: Magazine card for one file: 16:9 cover, code and date, serif title, subtitle and byline; the whole card is one link.
// ABOUTME: The "lead" variant is the large first story of a series index; the "card" variant fills the grid and the home "Recent files".

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import FileChip from "@/components/FileChip";
import { t } from "@/lib/locale";
import { urlFor } from "@/lib/sanity";
import { formatDate } from "@/lib/formatDate";
import { keepDashAttached } from "@/lib/keepDashAttached";
import { getByline, hasDefaultByline } from "@/lib/series";
import { HOME_LABELS, fileHref } from "@/lib/homeLabels";
import styles from "./FileCard.module.css";

// Lead and card images keep the 16:9 ratio of the Sanity covers.
const SIZES = {
  lead: {
    width: 1200,
    height: 675,
    sizes: "(max-width: 1099px) 100vw, 680px",
  },
  card: {
    width: 1200,
    height: 675,
    sizes: "(max-width: 699px) 100vw, (max-width: 1023px) 50vw, 360px",
  },
};

// The home trio is one column below 1024px, so its cards are full width there.
const TRIO_SIZES = "(max-width: 1023px) 100vw, 360px";

export default function FileCard({
  doc,
  locale,
  variant = "card",
  priority = false,
  layout = "grid",
}) {
  const titleId = useId();
  const labels = HOME_LABELS[locale] || HOME_LABELS.en;
  const { width, height, sizes: variantSizes } = SIZES[variant] || SIZES.card;
  const sizes =
    variant === "card" && layout === "trio" ? TRIO_SIZES : variantSizes;
  const showByline = variant === "lead" || !hasDefaultByline(doc);

  const imageUrl = doc.coverImage?.asset
    ? urlFor(doc.coverImage).width(width).height(height).format("webp").url()
    : null;
  const alt = t(doc.coverImageAlt, locale) || "";
  const subtitle = keepDashAttached(t(doc.subtitle, locale));

  const bylineText = `${labels.byPrefix} ${getByline(doc, locale)}`;

  return (
    <article className={`${styles.card} ${styles[variant] || ""}`.trim()}>
      <Link
        href={fileHref(doc, locale)}
        className={styles.link}
        aria-labelledby={titleId}
      >
        {imageUrl && (
          <div className={styles.art}>
            <Image
              src={imageUrl}
              alt={alt}
              width={width}
              height={height}
              className={styles.image}
              sizes={sizes}
              {...(priority ? { preload: true, fetchPriority: "high" } : {})}
            />
          </div>
        )}
        <div className={styles.body}>
          <div className={styles.meta}>
            <FileChip
              doc={doc}
              variant={variant === "lead" ? "chip" : "plain"}
            />
            <span>{formatDate(doc.publishDate, locale, "short")}</span>
            {/* The lead's byline sits in the mono meta row, above the title: the subtitle below it re-wraps
                when its late-loading font arrives, and nothing under the subtitle may move with it (CLS). */}
            {variant === "lead" && <span>{bylineText}</span>}
          </div>
          <h3 id={titleId} className={styles.title}>
            {t(doc.title, locale)}
          </h3>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}
          {variant !== "lead" && showByline && (
            <p className={styles.by}>{bylineText}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
