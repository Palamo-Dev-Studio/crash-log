// ABOUTME: Banner shown when a Spanish translation is not available for the current content.
// ABOUTME: Displays "Versión en español próximamente" in muted mono styling.

import styles from "./FallbackBanner.module.css";

export default function FallbackBanner() {
  return (
    <div className={styles.banner}>
      <span className={styles.icon} aria-hidden="true">
        &#9888;
      </span>
      Versi&oacute;n en espa&ntilde;ol pr&oacute;ximamente
    </div>
  );
}
