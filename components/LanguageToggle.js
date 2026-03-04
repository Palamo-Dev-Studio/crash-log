// ABOUTME: Client-side language toggle button for switching between EN and ES.
// ABOUTME: Sets the CRASH_LOG_LOCALE cookie and navigates to the equivalent page in the other locale.

"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./LanguageToggle.module.css";

export default function LanguageToggle({ locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const otherLocale = locale === "en" ? "es" : "en";

  function handleToggle() {
    document.cookie = `CRASH_LOG_LOCALE=${otherLocale};path=/;max-age=31536000`;
    const segments = pathname.split("/");
    segments[1] = otherLocale;
    router.push(segments.join("/"));
  }

  return (
    <button
      className={styles.toggle}
      onClick={handleToggle}
      aria-label={locale === "en" ? "Cambiar a español" : "Switch to English"}
    >
      <span className={locale === "en" ? styles.active : styles.inactive}>
        EN
      </span>
      <span className={styles.separator}>/</span>
      <span className={locale === "es" ? styles.active : styles.inactive}>
        ES
      </span>
    </button>
  );
}
