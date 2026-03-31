// ABOUTME: Site footer with copyright, build credit, and utility links.
// ABOUTME: Centered mono text in muted colors.

import styles from "./Footer.module.css";

const LABELS = {
  en: { credit: "Built with OpenClaw \u00b7 Edited by Humans" },
  es: { credit: "Hecho con OpenClaw \u00b7 Editado por Humanos" },
};

export default function Footer({ locale }) {
  const labels = LABELS[locale] || LABELS.en;

  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        &copy; 2026 The Crash Log &middot; {labels.credit}
      </p>
      <p className={styles.social}>
        <a
          href="https://x.com/crashLogNews"
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        <span className={styles.separator}>&middot;</span>
        <a
          href="https://www.instagram.com/crashlognews"
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <span className={styles.separator}>&middot;</span>
        <a
          href={`/${locale}/feed.xml`}
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          RSS
        </a>
      </p>
      <p className={styles.social}>
        <a
          href="https://www.palamostudio.com"
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Palamo Studio
        </a>
      </p>
    </footer>
  );
}
