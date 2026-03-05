// ABOUTME: Bilingual thank-you page content shown after newsletter subscription.
// ABOUTME: Displays confirmation badge, heading, description, CTA link, and dormant Beehiiv slot.

import Link from "next/link";
import BeehiivRecommendations from "@/components/BeehiivRecommendations";
import styles from "./ThankYouContent.module.css";

const LABELS = {
  en: {
    badge: "SUBSCRIPTION CONFIRMED",
    heading: "You\u2019re In.",
    description:
      "Thanks for subscribing to The Crash Log \u2014 a bilingual newsletter about AI and tech gone off the rails. New issues land in your inbox as they publish. No spam, no fluff, just the failures that matter.",
    cta: "Read the Latest Issue",
    followLabel: "Follow the Fallout",
  },
  es: {
    badge: "SUSCRIPCI\u00D3N CONFIRMADA",
    heading: "\u00A1Listo!",
    description:
      "Gracias por suscribirte a The Crash Log \u2014 un bolet\u00EDn biling\u00FCe sobre la IA y la tecnolog\u00EDa descarrilada. Las nuevas ediciones llegan a tu bandeja de entrada cuando se publican. Sin spam, sin relleno, solo las fallas que importan.",
    cta: "Leer la \u00DAltima Edici\u00F3n",
    followLabel: "Sigue el Desastre",
  },
};

export default function ThankYouContent({ locale = "en" }) {
  const l = LABELS[locale] || LABELS.en;

  return (
    <div className={styles.container}>
      <p className={styles.badge}>{l.badge}</p>
      <h1 className={styles.heading}>{l.heading}</h1>
      <p className={styles.description}>{l.description}</p>
      <Link href={`/${locale}`} className={styles.cta}>
        {l.cta}
      </Link>
      <div className={styles.socialSection}>
        <p className={styles.followLabel}>{l.followLabel}</p>
        <div className={styles.socialButtons}>
          <a
            href="https://x.com/crashLogNews"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
          >
            X
          </a>
          <a
            href="https://instagram.com/crashlognews"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
          >
            Instagram
          </a>
        </div>
      </div>
      <div className={styles.recommendations}>
        <BeehiivRecommendations locale={locale} />
      </div>
    </div>
  );
}
