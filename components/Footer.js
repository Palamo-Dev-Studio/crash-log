// ABOUTME: Site footer with copyright, build credit, and utility links.
// ABOUTME: Centered mono text in muted colors.

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        &copy; 2026 The Crash Log &middot; Built with OpenClaw &middot; Edited
        by Humans
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
      </p>
    </footer>
  );
}
