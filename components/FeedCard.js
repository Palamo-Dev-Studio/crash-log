// ABOUTME: Unified feed card for the home page — renders an issue or column as a hero or standard card.
// ABOUTME: Handles the cover image, type badge, localized title/dek, and links to the correct route by type.

import Image from "next/image";
import Link from "next/link";
import { t } from "@/lib/locale";
import { urlFor } from "@/lib/sanity";
import styles from "./FeedCard.module.css";

const LABELS = {
  en: { issue: "Issue", column: "Nico’s Notes" },
  es: { issue: "Edición", column: "Notas de Nico" },
};

function formatDate(dateString, locale) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function FeedCard({ item, locale, variant = "standard" }) {
  if (!item) return null;

  const labels = LABELS[locale] || LABELS.en;
  const isColumn = item._type === "column";
  const isHero = variant === "hero";

  const href = isColumn
    ? `/${locale}/nico/${item.slug}`
    : `/${locale}/issue/${item.slug}`;

  const badgeLabel = isColumn ? labels.column : labels.issue;
  const num = String(item.number).padStart(3, "0");
  const title = t(item.title, locale);
  const dek = t(item.subtitle, locale) || t(item.metaDescription, locale);
  const date = formatDate(item.publishDate, locale);

  const imageWidth = isHero ? 1440 : 640;
  const imageHeight = isHero ? 810 : 360;
  const imageUrl = item.coverImage
    ? urlFor(item.coverImage)
        .width(imageWidth)
        .height(imageHeight)
        .format("webp")
        .url()
    : null;
  const alt = t(item.coverImageAlt, locale) || title || "";

  const TitleTag = isHero ? "h1" : "h2";

  return (
    <Link
      href={href}
      className={`${styles.card} ${isHero ? styles.hero : styles.standard}`}
    >
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            width={imageWidth}
            height={imageHeight}
            className={styles.image}
            priority={isHero}
            sizes={
              isHero
                ? "100vw"
                : "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            }
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>

      <div className={isHero ? styles.heroBody : styles.body}>
        <div className={styles.meta}>
          <span
            className={`${styles.badge} ${isColumn ? styles.badgeColumn : styles.badgeIssue}`}
          >
            {badgeLabel} #{num}
          </span>
          <span className={styles.date}>{date}</span>
        </div>

        <TitleTag className={isHero ? styles.heroTitle : styles.title}>
          {title}
        </TitleTag>

        {dek && <p className={isHero ? styles.heroDek : styles.dek}>{dek}</p>}
      </div>
    </Link>
  );
}
