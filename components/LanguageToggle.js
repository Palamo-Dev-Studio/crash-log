// ABOUTME: Segmented EN | ES language toggle that links to the same path in the other locale.
// ABOUTME: Sets the CRASH_LOG_LOCALE cookie on click; the active segment is marked with aria-current.

"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALES } from "@/lib/locale";
import styles from "./LanguageToggle.module.css";

const GROUP_LABEL = { en: "Language", es: "Idioma" };

// Swap the leading locale segment, keeping the rest of the path (the query is appended separately).
export function pathForLocale(pathname, target) {
  const segments = (pathname || "/").split("/");
  segments[1] = target;
  return segments.join("/") || `/${target}`;
}

function rememberLocale(target) {
  document.cookie = `CRASH_LOG_LOCALE=${target};path=/;max-age=31536000`;
}

// useSearchParams needs a Suspense boundary so static pages are not forced
// dynamic; the fallback is the same toggle without the query string.
export default function LanguageToggle({ locale }) {
  return (
    <Suspense fallback={<Toggle locale={locale} search="" />}>
      <ToggleWithQuery locale={locale} />
    </Suspense>
  );
}

function ToggleWithQuery({ locale }) {
  const search = useSearchParams().toString();
  return <Toggle locale={locale} search={search} />;
}

function Toggle({ locale, search }) {
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
            href={`${pathForLocale(pathname, target)}${search ? `?${search}` : ""}`}
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
