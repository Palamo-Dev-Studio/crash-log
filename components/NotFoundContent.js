// ABOUTME: Branded 404 body: mono "FILE NOT FOUND" kicker, serif line, links to Latest and Archive.
// ABOUTME: Client component because not-found pages receive no route params; the locale comes from the prop or the URL.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";
import styles from "./NotFoundContent.module.css";

const LABELS = {
  en: {
    kicker: "404 · File not found",
    heading: "That page isn't in the file.",
    message:
      "It doesn't exist, was removed, or the URL is wrong. Start from the latest files or search the archive.",
    home: "Latest",
    archive: "Archive",
  },
  es: {
    kicker: "404 · Archivo no encontrado",
    heading: "Esa página no está en el archivo.",
    message:
      "No existe, fue eliminada o la URL es incorrecta. Empieza por lo último o busca en el archivo.",
    home: "Lo último",
    archive: "Archivo",
  },
};

function localeFromPath(pathname) {
  const first = (pathname || "").split("/")[1];
  return LOCALES.includes(first) ? first : DEFAULT_LOCALE;
}

export default function NotFoundContent({ locale }) {
  const pathname = usePathname();
  const lang = LOCALES.includes(locale) ? locale : localeFromPath(pathname);
  const labels = LABELS[lang];

  return (
    <main className={styles.page}>
      <p className={styles.kicker}>{labels.kicker}</p>
      <h1 className={styles.heading}>{labels.heading}</h1>
      <p className={styles.message}>{labels.message}</p>
      <nav className={styles.links}>
        <Link href={`/${lang}`} className={styles.primary}>
          {labels.home}
        </Link>
        <Link href={`/${lang}/archive`} className={styles.secondary}>
          {labels.archive}
        </Link>
      </nav>
    </main>
  );
}
