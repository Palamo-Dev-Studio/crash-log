// ABOUTME: Site footer: roundel + blurb, the series list with file codes, Elsewhere links, Follow links, fine print.
// ABOUTME: Replaces the old DonateCTA + subscribe banner + footer stack (SiteBottom).

import Link from "next/link";
import Roundel from "./Roundel";
import { SERIES_COLOR_KEYS } from "@/lib/series";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";
import { BLUESKY_URL, INSTAGRAM_URL, TIKTOK_URL } from "@/lib/social";
import styles from "./Footer.module.css";

const CONTACT_EMAIL = "info@palamo.ai";
const PALAMO_URL = "https://palamo.ai";

// Placeholder copy (SPEC): tweak the strings here.
const LABELS = {
  en: {
    blurb:
      "Incident reports on AI, read closely, with what to do next. Written for people who run things.",
    subscribeLine: "New files every week. Free.",
    subscribe: "Subscribe",
    seriesHeading: "The series",
    elsewhereHeading: "Elsewhere",
    followHeading: "Follow",
    series: {
      offTheRails: "Off the Rails",
      practical: "Practical",
      nicosNotes: "Nico’s Notes",
    },
    archive: "Archive",
    about: "About",
    support: "Support the Log",
    contact: "Contact",
    publication: "A Palamo publication",
    languages: "Languages",
  },
  es: {
    blurb:
      "Informes de incidentes de IA, leídos con atención, y qué hacer después. Para quienes dirigen un negocio.",
    subscribeLine: "Archivos nuevos cada semana. Gratis.",
    subscribe: "Suscr\u00edbete",
    seriesHeading: "Las series",
    elsewhereHeading: "Más",
    followHeading: "Síguenos",
    series: {
      offTheRails: "Fuera de las vías",
      practical: "Práctico",
      nicosNotes: "Notas de Nico",
    },
    archive: "Archivo",
    about: "Sobre",
    support: "Apoya el Log",
    contact: "Contacto",
    publication: "Una publicación de Palamo",
    languages: "Idiomas",
  },
};

const SERIES_LIST = [
  { key: "offTheRails", code: "OTR" },
  { key: "practical", code: "FIX" },
  { key: "nicosNotes", code: "NOTE" },
];

export default function Footer({ locale, tiktokUrl = TIKTOK_URL }) {
  const labels = LABELS[locale] || LABELS.en;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.foot}>
      <div className={styles.rule}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Roundel size={22} className={styles.mark} />
            <div>
              <p className={styles.blurb}>{labels.blurb}</p>
              <p className={styles.subscribe}>
                {labels.subscribeLine}{" "}
                <a
                  href={SUBSTACK_SUBSCRIBE_URL}
                  className={styles.subscribeLink}
                >
                  {labels.subscribe}
                </a>
              </p>
            </div>
          </div>
          <div>
            <h2 className={styles.heading}>{labels.seriesHeading}</h2>
            <ul className={styles.list}>
              {SERIES_LIST.map(({ key, code }) => (
                <li key={key}>
                  <b
                    className={`${styles.code} ${styles[SERIES_COLOR_KEYS[key]]}`}
                  >
                    {code}
                  </b>
                  {labels.series[key]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={styles.heading}>{labels.elsewhereHeading}</h2>
            <ul className={styles.list}>
              <li>
                <Link href={`/${locale}/archive`}>{labels.archive}</Link>
              </li>
              <li>
                <Link href={`/${locale}/about`}>{labels.about}</Link>
              </li>
              <li>
                <Link href={`/${locale}/support`}>{labels.support}</Link>
              </li>
              <li>
                <a href={`/${locale}/feed.xml`}>RSS</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>{labels.contact}</a>
              </li>
              <li>
                <a href={PALAMO_URL} rel="noopener noreferrer">
                  {labels.publication}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className={styles.heading}>{labels.followHeading}</h2>
            <ul className={styles.list}>
              <li>
                <a href={BLUESKY_URL} rel="noopener noreferrer">
                  Bluesky
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              {tiktokUrl && (
                <li>
                  <a href={tiktokUrl} rel="noopener noreferrer">
                    TikTok
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className={styles.fine}>
          <span className={styles.segs}>
            <span className={styles.seg}>&copy; {year} The Crash Log</span>
          </span>
          <span role="group" aria-label={labels.languages}>
            <Link href="/en" hrefLang="en" lang="en">
              EN
            </Link>
            {" · "}
            <Link href="/es" hrefLang="es" lang="es">
              ES
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
