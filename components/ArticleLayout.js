// ABOUTME: Shared article template for Practical posts and Nico's Notes: kicker, H1, dek, byline, optional sticky TOC, body.
// ABOUTME: The TOC column exists only when the body has two or more H2s; without it the 68ch prose column centres on the page.

import FileChip, { seriesName } from "@/components/FileChip";
import ArticleBody from "@/components/ArticleBody";
import FallbackBanner from "@/components/FallbackBanner";
import { prepareArticleBody } from "@/lib/articleBody";
import { ARTICLE_LABELS } from "@/lib/articleLabels";
import { formatDate } from "@/lib/formatDate";
import { getByline, getCredit, getSeries } from "@/lib/series";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";
import styles from "./ArticleLayout.module.css";

export default function ArticleLayout({
  doc,
  locale,
  title,
  subtitle,
  body,
  minutes,
  showFallback = false,
  showSubscribe = false,
}) {
  const labels = ARTICLE_LABELS[locale] || ARTICLE_LABELS.en;
  const series = getSeries(doc);
  const byline = getByline(doc, locale);
  const credit = getCredit(doc, locale);
  const { blocks, toc } = prepareArticleBody(body, locale);
  const showToc = toc.length >= 2;
  const date = formatDate(doc.publishDate, locale, "short");

  return (
    <main className={`${styles.art} ${showToc ? "" : styles.noToc}`.trim()}>
      {showToc && (
        <aside className={styles.meta} aria-label={labels.toc}>
          <nav className={styles.toc}>
            <div className={styles.tocLabel}>{labels.toc}</div>
            <ol>
              {toc.map(({ id, text }) => (
                <li key={id}>
                  <a href={`#${id}`}>{text}</a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      )}

      <article className={styles.body}>
        <header className={styles.head}>
          <div className={styles.kicker}>
            <FileChip doc={doc} />
            <span className={styles.segs}>
              {series && (
                <span className={styles.seg}>{seriesName(series, locale)}</span>
              )}
              {date && <span className={styles.seg}>{date}</span>}
              {minutes && (
                <span className={styles.seg}>{labels.minRead(minutes)}</span>
              )}
            </span>
          </div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.dek}>{subtitle}</p>}
          {byline && (
            <div className={styles.byline}>
              <span className={styles.avatar} aria-hidden="true">
                {byline.trim().charAt(0).toUpperCase()}
              </span>
              <span className={styles.bylineText}>
                <span>
                  {labels.byPrefix} <strong>{byline}</strong>
                </span>
                {credit && <span className={styles.credit}>{credit}</span>}
              </span>
            </div>
          )}
        </header>

        {showFallback && <FallbackBanner />}

        <ArticleBody blocks={blocks} locale={locale} />

        {showSubscribe && (
          <div className={styles.sub}>
            <p>{labels.subscribeLine}</p>
            <a className={styles.subButton} href={SUBSTACK_SUBSCRIBE_URL}>
              {labels.subscribe}
            </a>
          </div>
        )}
      </article>
    </main>
  );
}
