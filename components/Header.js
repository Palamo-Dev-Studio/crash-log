// ABOUTME: Site masthead: roundel, wordmark with blinking cursor, tagline, language toggle, Support and Subscribe.
// ABOUTME: Accepts a children slot (the LanguageToggle) rendered first in the tools group.

import Link from "next/link";
import Roundel from "./Roundel";
import SubscribeForm from "./SubscribeForm";
import styles from "./Header.module.css";

// Placeholder copy (SPEC): tweak the strings here.
const LABELS = {
  en: {
    tagline: "Incident reports on AI · Read closely · What to do next",
    taglineShort: "Incident reports on AI",
    support: "Support",
  },
  es: {
    tagline: "Incidentes de IA · Lectura atenta · Qué hacer después",
    taglineShort: "Incidentes de IA",
    support: "Apoyar",
  },
};

export default function Header({ locale, children }) {
  const labels = LABELS[locale] || LABELS.en;

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <Link href={`/${locale}`} className={styles.brand}>
          <Roundel size={72} className={styles.markLarge} />
          {/* Decorative twin of the large mark, shown on mobile in its place. */}
          <span className={styles.markSmall} aria-hidden="true">
            <Roundel size={44} />
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
          <SubscribeForm locale={locale} />
        </div>
      </div>
    </header>
  );
}
