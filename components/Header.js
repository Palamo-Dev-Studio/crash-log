// ABOUTME: Site header with masthead wordmark, tagline, and subscribe form.
// ABOUTME: Accepts a children slot for LanguageToggle or other header actions.

import Link from "next/link";
import SubscribeForm from "./SubscribeForm";
import styles from "./Header.module.css";

export default function Header({ locale, children }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div>
          <Link href={`/${locale}`} className={styles.wordmark}>
            The Crash Log
          </Link>
          <div className={styles.tagline}>AI &amp; Tech Gone Off the Rails</div>
        </div>
        <div className={styles.actions}>
          {children}
          <SubscribeForm locale={locale} />
        </div>
      </div>
    </header>
  );
}
