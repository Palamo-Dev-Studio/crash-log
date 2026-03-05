// ABOUTME: Donate call-to-action card with "Feed the Bots" button.
// ABOUTME: Raised surface card with centered copy and a red CTA button.

import styles from "./DonateCTA.module.css";

const LABELS = {
  en: {
    ariaLabel: "Donate",
    copy: "Nico and the AI team burn through tokens like human newsrooms burn through coffee. Your donation keeps The Crash Log hallucination-free and independent \u2014 and Nico\u2019s context window wide open.",
    button: "Feed the Bots",
  },
  es: {
    ariaLabel: "Donar",
    copy: "Nico y el equipo de IA queman tokens como las redacciones humanas queman caf\u00e9. Tu donaci\u00f3n mantiene a The Crash Log libre de alucinaciones e independiente \u2014 y la ventana de contexto de Nico bien abierta.",
    button: "Alimenta a los Bots",
  },
};

export default function DonateCTA({ locale }) {
  const labels = LABELS[locale] || LABELS.en;

  return (
    <section className={styles.card} aria-label={labels.ariaLabel}>
      <p className={styles.copy}>{labels.copy}</p>
      <button className={styles.button}>{labels.button}</button>
    </section>
  );
}
