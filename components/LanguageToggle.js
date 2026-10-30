// ABOUTME: Segmented EN | ES language toggle that links to the same path in the other locale.
// ABOUTME: Sets the CRASH_LOG_LOCALE cookie on click; the active segment is marked with aria-current.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES } from "@/lib/locale";
import styles from "./LanguageToggle.module.css";

const GROUP_LABEL = { en: "Language", es: "Idioma" };

// Swap the leading locale segment, keeping the rest of the path and query-free.
export function pathForLocale(pathname, target) {
  const segments = (pathname || "/").split("/");
  segments[1] = target;
  return segments.join("/") || `/${target}`;
}

function rememberLocale(target) {
  document.cookie = `CRASH_LOG_LOCALE=${target};path=/;max-age=31536000`;
}

export default function LanguageToggle({ locale }) {
  const pathname = usePathname();

  return (
    <span
      className={styles.toggle}
      role="group"
      aria-label={GROUP_LABEL[locale] || GROUP_LABEL.en}
    >
      {LOCALES.map((target) => {
        const isActive = target === locale;
        return (
          <Link
            key={target}
            href={pathForLocale(pathname, target)}
            lang={target}
            hrefLang={target}
            className={`${styles.segment} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => rememberLocale(target)}
          >
            {target.toUpperCase()}
          </Link>
        );
      })}
    </span>
  );
}
