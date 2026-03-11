// ABOUTME: Site header with masthead wordmark, tagline, fund button, and subscribe form.
// ABOUTME: Accepts a children slot for LanguageToggle or other header actions.

import Link from "next/link";
import Image from "next/image";
import SubscribeForm from "./SubscribeForm";
import styles from "./Header.module.css";

const LABELS = {
  en: { tagline: "AI & Tech Gone Off the Rails", fund: "Fund" },
  es: { tagline: "IA y Tecnología Descarriladas", fund: "Apoya" },
};

export default function Header({ locale, children }) {
  const labels = LABELS[locale] || LABELS.en;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div>
          <Link href={`/${locale}`} className={styles.wordmark}>
            <Image
              src="/logo-circle.webp"
              alt=""
              width={54}
              height={54}
              className={styles.logo}
            />
            <span className={styles.wordmarkText}>The Crash Log</span>
          </Link>
          <div className={styles.tagline}>{labels.tagline}</div>
        </div>
        <div className={styles.actions}>
          {children}
          <Link href={`/${locale}/support`} className={styles.fundButton}>
            {labels.fund}
          </Link>
          <SubscribeForm locale={locale} />
        </div>
      </div>
    </header>
  );
}
