// ABOUTME: Donate call-to-action card with amount input and "Feed the Bots" button.
// ABOUTME: Client component that POSTs to /api/donate and redirects to Stripe Checkout.

"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./DonateCTA.module.css";

const LABELS = {
  en: {
    ariaLabel: "Donate",
    copy: "Nico and the AI team burn through tokens like human newsrooms burn through coffee. Your donation keeps The Crash Log hallucination-free and independent \u2014 and Nico\u2019s context window wide open.",
    disclaimer: "Contributions are not tax-deductible.",
    button: "Feed the Bots",
    sending: "Processing\u2026",
    error: "Something went wrong. Try again.",
    thanks: "Thank you for your donation!",
    amountLabel: "Donation amount in dollars",
    closeToast: "Close",
    once: "One-time",
    monthly: "Monthly",
  },
  es: {
    ariaLabel: "Donar",
    copy: "Nico y el equipo de IA queman tokens como las redacciones humanas queman caf\u00e9. Tu donaci\u00f3n mantiene a The Crash Log libre de alucinaciones e independiente \u2014 y la ventana de contexto de Nico bien abierta.",
    disclaimer: "Las contribuciones no son deducibles de impuestos.",
    button: "Alimenta a los Bots",
    sending: "Procesando\u2026",
    error: "Algo sali\u00f3 mal. Int\u00e9ntalo de nuevo.",
    thanks: "\u00a1Gracias por tu donaci\u00f3n!",
    amountLabel: "Monto de donaci\u00f3n en d\u00f3lares",
    closeToast: "Cerrar",
    once: "Una vez",
    monthly: "Mensual",
  },
};

export default function DonateCTA({ locale = "en" }) {
  const enabled = process.env.NEXT_PUBLIC_DONATIONS_ENABLED === "true";

  if (!enabled) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <DonateCTAInner locale={locale} />
    </Suspense>
  );
}

function DonateCTAInner({ locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";

  const [showToast, setShowToast] = useState(donated);
  const [amount, setAmount] = useState("5");
  const [frequency, setFrequency] = useState("once");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const labels = LABELS[locale] || LABELS.en;

  function dismissToast() {
    setShowToast(false);
    router.replace(pathname, { scroll: false });
  }

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(dismissToast, 10000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  async function handleSubmit(e) {
    e.preventDefault();

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 3) {
      setErrorMessage(labels.error);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount * 100,
          locale,
          returnPath: pathname,
          frequency,
        }),
      });

      if (!response.ok) {
        setErrorMessage(labels.error);
        setStatus("error");
        return;
      }

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.error || labels.error);
        setStatus("error");
      }
    } catch {
      setErrorMessage(labels.error);
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <>
      {showToast && (
        <div className={styles.toastOverlay} role="status" aria-live="polite">
          <div className={styles.toast}>
            <p className={styles.thanks}>{labels.thanks}</p>
            <button
              className={styles.toastClose}
              onClick={dismissToast}
              aria-label={labels.closeToast}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <section className={styles.card} aria-label={labels.ariaLabel}>
        <p className={styles.copy}>{labels.copy}</p>
        <p className={styles.disclaimer}>{labels.disclaimer}</p>
        <div className={styles.frequencyToggle} role="group">
          <button
            type="button"
            className={`${styles.freqButton} ${frequency === "once" ? styles.freqActive : ""}`}
            aria-pressed={frequency === "once"}
            onClick={() => setFrequency("once")}
          >
            {labels.once}
          </button>
          <button
            type="button"
            className={`${styles.freqButton} ${frequency === "monthly" ? styles.freqActive : ""}`}
            aria-pressed={frequency === "monthly"}
            onClick={() => setFrequency("monthly")}
          >
            {labels.monthly}
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.amountWrapper}>
            <span className={styles.currencySymbol}>$</span>
            <input
              type="number"
              className={styles.amountInput}
              min="3"
              max="999"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              aria-label={labels.amountLabel}
            />
          </div>
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? labels.sending : labels.button}
          </button>
        </form>
        {status === "error" && (
          <div className={styles.error} role="alert">
            {errorMessage}
          </div>
        )}
      </section>
    </>
  );
}
