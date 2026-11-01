// ABOUTME: Site masthead: roundel, wordmark with blinking cursor, tagline, language toggle, Support box and Subscribe link.
// ABOUTME: Accepts a children slot (the LanguageToggle) rendered first in the tools group.

import Link from "next/link";
import Roundel from "./Roundel";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";
import { TAGLINE } from "@/lib/tagline";
import styles from "./Header.module.css";

// Placeholder copy (SPEC): tweak the strings here.
const LABELS = {
  en: {
    tagline: TAGLINE.en,
    taglineShort: "Incident reports on AI",
    support: "Support",
    subscribe: "Subscribe",
  },
  es: {
    tagline: TAGLINE.es,
    taglineShort: "Incidentes de IA",
    support: "Apoyar",
    subscribe: "Suscríbete",
  },
};

export default function Header({ locale, children }) {
  const labels = LABELS[locale] || LABELS.en;

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <Link href={`/${locale}`} className={styles.brand}>
          <Roundel size={72} className={styles.markLarge} decorative />
          {/* Decorative twin of the large mark, shown on mobile in its place. */}
          <span className={styles.markSmall} aria-hidden="true">
            <Roundel size={44} decorative />
          </span>
          <span>
            <span className={styles.name}>
              The Crash Log
              <span className={styles.cursor} aria-hidden="true" />
            </span>
            <span className={styles.tag}>
              <span className={styles.tagFull}>{labels.tagline}</span>
              <span className={styles.tagShort}>{labels.taglineShort}</span>
            </span>
          </span>
        </Link>
        <div className={styles.tools}>
          {children}
          <Link href={`/${locale}/support`} className={styles.support}>
            {labels.support}
          </Link>
          <a href={SUBSTACK_SUBSCRIBE_URL} className={styles.subscribe}>
            {labels.subscribe}
          </a>
        </div>
      </div>
    </header>
  );
}
