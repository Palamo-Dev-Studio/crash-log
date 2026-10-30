// ABOUTME: Thank-you toast shown when Stripe returns a donor to any page with ?donated=true.
// ABOUTME: Auto-dismisses after 10s and cleans the param from the URL; gated by NEXT_PUBLIC_DONATIONS_ENABLED.

"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./DonationThanks.module.css";

const AUTO_DISMISS_MS = 10000;

const LABELS = {
  en: {
    thanks: "Thank you for your donation!",
    close: "Close",
  },
  es: {
    thanks: "¡Gracias por tu donación!",
    close: "Cerrar",
  },
};

export default function DonationThanks({ locale = "en" }) {
  if (process.env.NEXT_PUBLIC_DONATIONS_ENABLED !== "true") {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <DonationThanksInner locale={locale} />
    </Suspense>
  );
}

function DonationThanksInner({ locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";

  const [open, setOpen] = useState(donated);
  const labels = LABELS[locale] || LABELS.en;

  useEffect(() => {
    if (donated) setOpen(true);
  }, [donated]);

  function dismiss() {
    setOpen(false);
    router.replace(pathname, { scroll: false });
  }

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.toast}>
        <p className={styles.thanks}>{labels.thanks}</p>
        <button
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label={labels.close}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
