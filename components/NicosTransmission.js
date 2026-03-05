// ABOUTME: Nico's Transmission editorial intro card with red left border.
// ABOUTME: Renders the managing editor's intro text with signature line.

import styles from "./NicosTransmission.module.css";

const LABELS = {
  en: { title: "Nico\u2019s Transmission" },
  es: { title: "La Transmisión de Nico" },
};

export default function NicosTransmission({ locale, children, signature }) {
  const labels = LABELS[locale] || LABELS.en;

  return (
    <aside className={styles.transmission} aria-label={labels.title}>
      <div className={styles.label}>{labels.title}</div>
      <div className={styles.body}>{children}</div>
      {signature && <div className={styles.sig}>{signature}</div>}
    </aside>
  );
}
