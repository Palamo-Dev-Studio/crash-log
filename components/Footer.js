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
    </footer>
  );
}
