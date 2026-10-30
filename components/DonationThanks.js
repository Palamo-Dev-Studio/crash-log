// ABOUTME: Thank-you toast shown when Stripe returns a donor to any page with ?donated=true.
// ABOUTME: Stays until closed, then cleans the param from the URL; gated by NEXT_PUBLIC_DONATIONS_ENABLED.

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./DonationThanks.module.css";

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

  // The live region is in the server HTML and stays mounted; the toast is
  // inserted into it after hydration, so screen readers announce the change.
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <Suspense fallback={null}>
        <DonationThanksInner locale={locale} />
      </Suspense>
    </div>
  );
}

function DonationThanksInner({ locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";

  const [open, setOpen] = useState(donated);
  const [mounted, setMounted] = useState(false);
  const previousFocus = useRef(null);
  const labels = LABELS[locale] || LABELS.en;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (donated) setOpen(true);
  }, [donated]);

  // Remember what had focus before the toast appeared, so Close can hand it back.
  useEffect(() => {
    if (open && mounted) {
      const active = document.activeElement;
      previousFocus.current =
        active && active !== document.body ? active : null;
    }
  }, [open, mounted]);

  function dismiss() {
    setOpen(false);
    router.replace(pathname, { scroll: false });
  }

  // The Close button unmounts with the toast, so focus would fall to <body>:
  // return it to where it was, else to the skip-link target.
  function closeAndRestoreFocus() {
    const prior = previousFocus.current;
    dismiss();
    const target =
      prior && prior.isConnected
        ? prior
        : document.getElementById("main-content");
    target?.focus();
  }

  if (!open || !mounted) return null;

  return (
    <div className={styles.toast}>
      <p className={styles.thanks}>{labels.thanks}</p>
      <button
        type="button"
        className={styles.close}
        onClick={closeAndRestoreFocus}
        aria-label={labels.close}
      >
        &times;
      </button>
    </div>
  );
}
