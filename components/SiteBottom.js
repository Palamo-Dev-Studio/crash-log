// ABOUTME: Site-wide bottom section rendered on every page via the layout.
// ABOUTME: Contains DonateCTA, subscribe banner, and Footer.

import DonateCTA from "@/components/DonateCTA";
import Footer from "@/components/Footer";
import styles from "./SiteBottom.module.css";

export default function SiteBottom({ locale }) {
  return (
    <div className={styles.bottom}>
      <DonateCTA locale={locale} />

      <div className={styles.subscribeBanner}>
        <p className={styles.subscribeBannerLabel}>
          {locale === "es"
            ? "No te pierdas la próxima edición"
            : "Don't miss the next issue"}
        </p>
        <a href={`/${locale}`} className={styles.subscribeBannerLink}>
          {locale === "es" ? "Suscríbete" : "Subscribe"}
        </a>
      </div>

      <Footer locale={locale} />
    </div>
  );
}
