// ABOUTME: Nico's Transmission editorial intro card with red left border.
// ABOUTME: Renders the managing editor's intro text with signature line.

import styles from "./NicosTransmission.module.css";

export default function NicosTransmission({ children, signature }) {
  return (
    <aside className={styles.transmission} aria-label="Nico's Transmission">
      <div className={styles.label}>Nico&apos;s Transmission</div>
      <div className={styles.body}>{children}</div>
      {signature && <div className={styles.sig}>{signature}</div>}
    </aside>
  );
}
