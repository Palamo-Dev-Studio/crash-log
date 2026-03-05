// ABOUTME: Site header with masthead wordmark, tagline, and subscribe form.
// ABOUTME: Accepts a children slot for LanguageToggle or other header actions.

import Link from "next/link";
import Image from "next/image";
import SubscribeForm from "./SubscribeForm";
import styles from "./Header.module.css";

const LABELS = {
  en: { tagline: "AI & Tech Gone Off the Rails" },
  es: { tagline: "IA y Tecnología Descarriladas" },
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
              width={36}
              height={36}
              className={styles.logo}
            />
            <span className={styles.wordmarkText}>The Crash Log</span>
          </Link>
          <div className={styles.tagline}>{labels.tagline}</div>
        </div>
        <div className={styles.actions}>
          {children}
          <SubscribeForm locale={locale} />
        </div>
      </div>
    </header>
  );
}
