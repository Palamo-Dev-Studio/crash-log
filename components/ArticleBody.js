// ABOUTME: Article body renderer: Portable Text with the Practical custom blocks (steps, exhibit, callout, pull quote, code, reply ask).
// ABOUTME: Expects blocks from prepareArticleBody (heading ids, figure numbers); outbound links get ?ref=crashlog.ai via withRef.

import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";
import { withRef } from "@/lib/series";
import { safeExternalHref } from "@/lib/safeHref";
import { ARTICLE_LABELS } from "@/lib/articleLabels";
import styles from "./ArticleBody.module.css";

// Only mailto/http(s) become a button; anything else (javascript:, data:) is dropped.
export function safeButtonHref(url) {
  return withRef(safeExternalHref(url));
}

function buildComponents(locale) {
  const labels = ARTICLE_LABELS[locale] || ARTICLE_LABELS.en;

  return {
    block: {
      normal: ({ children }) => <p>{children}</p>,
      h2: ({ children, value }) => <h2 id={value?._tocId}>{children}</h2>,
      h3: ({ children }) => <h3>{children}</h3>,
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    },
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      code: ({ children }) => <code>{children}</code>,
      link: ({ value, children }) => {
        const href = safeExternalHref(value?.href, { allowRelative: true });
        if (!href) return <>{children}</>;
        const external = /^https?:/i.test(href);
        return (
          <a
            href={external ? withRef(href) : href}
            {...(external && { target: "_blank", rel: "noopener noreferrer" })}
          >
            {children}
          </a>
        );
      },
    },
    types: {
      image: ({ value }) => {
        if (!value?.asset) return null;
        return (
          <figure className={styles.figure}>
            <Image
              src={urlFor(value).width(1200).format("webp").url()}
              alt={value.alt || ""}
              width={720}
              height={405}
              style={{ width: "100%", height: "auto" }}
            />
          </figure>
        );
      },

      steps: ({ value }) => (
        <ol className={styles.steps}>
          {(value?.items || []).map((item, i) => (
            <li key={item._key || i}>
              {item.title && <strong>{item.title}</strong>}
              {item.title && item.text ? " " : null}
              {item.text}
            </li>
          ))}
        </ol>
      ),

      exhibit: ({ value }) => (
        <figure className={styles.figure}>
          <div className={styles.shot}>
            <div className={styles.shotBar}>
              <span>{value.label || labels.exhibitDefault}</span>
              {value.tag && <span>{value.tag}</span>}
            </div>
            <div className={styles.shotBody}>
              {value.image?.asset && (
                <Image
                  src={urlFor(value.image).width(1000).format("webp").url()}
                  alt={value.image.alt || ""}
                  width={600}
                  height={338}
                  style={{ width: "100%", height: "auto" }}
                />
              )}
              {value.from && <div className={styles.from}>{value.from}</div>}
              {(value.rows || []).map((row, i) => (
                <div className={styles.shotRow} key={row._key || i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {row.lead && <b>{row.lead}</b>}
                    {row.lead && row.text ? " " : null}
                    {row.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {value.caption && (
            <figcaption className={styles.caption}>
              {labels.figure} {value._figNo} · {value.caption}
            </figcaption>
          )}
        </figure>
      ),

      callout: ({ value }) => (
        <aside className={styles.callout}>
          <p className={styles.calloutTitle}>
            {value.title || labels.calloutDefault}
          </p>
          {value.text && <p>{value.text}</p>}
        </aside>
      ),

      pullQuote: ({ value }) => (
        <blockquote className={styles.pull}>{value.text}</blockquote>
      ),

      codeBlock: ({ value }) => (
        <div className={styles.termWrap}>
          <pre
            className={styles.term}
            tabIndex={0}
            data-language={value.language || undefined}
          >
            <code>{value.code}</code>
          </pre>
        </div>
      ),

      replyAsk: ({ value }) => {
        const href = safeButtonHref(value.buttonUrl);
        return (
          <section className={styles.turn}>
            <h2 id={value._tocId}>{value.title || labels.replyDefault}</h2>
            {value.text && <p>{value.text}</p>}
            {href && value.buttonLabel && (
              <a className={styles.turnButton} href={href}>
                {value.buttonLabel}
              </a>
            )}
          </section>
        );
      },
    },
  };
}

export default function ArticleBody({ blocks, locale }) {
  return (
    <div className={styles.prose}>
      <PortableText value={blocks} components={buildComponents(locale)} />
    </div>
  );
}
