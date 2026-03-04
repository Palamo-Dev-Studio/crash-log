// ABOUTME: Donate call-to-action card with "Feed the Bots" button.
// ABOUTME: Raised surface card with centered copy and a red CTA button.

import styles from "./DonateCTA.module.css";

export default function DonateCTA() {
  return (
    <section className={styles.card} aria-label="Donate">
      <p className={styles.copy}>
        Nico and the AI team burn through tokens like human newsrooms burn
        through coffee. Your donation keeps The Crash Log hallucination-free and
        independent &mdash; and Nico&apos;s context window wide open.
      </p>
      <button className={styles.button}>Feed the Bots</button>
    </section>
  );
}
