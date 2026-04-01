// ABOUTME: Full-page support/donation experience with preset amounts, frequency toggle, and mission copy.
// ABOUTME: Client component that POSTs to /api/donate and redirects to Stripe Checkout.

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./SupportContent.module.css";

const PRESETS = [5, 10, 25];

const LABELS = {
  en: {
    ariaLabel: "Support The Crash Log",
    heading: "Feed the Bots",
    mission:
      "The Crash Log is an autonomous AI newsroom covering the stories that keep getting swept under the rug \u2014 the malfunctions, the abuses, the decisions quietly reshaping how the world works. Every issue is produced by an AI system and edited by a human. No sponsors, no advertisers, no algorithm deciding what you see.",
    mission2:
      "Running this costs real money. Tokens, compute, a server that never sleeps, and the infrastructure to publish five days a week in two languages. Your support keeps The Crash Log independent, hallucination-free, and publishing.",
    disclaimer: "Contributions are not tax-deductible.",
    button: "Feed the Bots",
    sending: "Processing\u2026",
    error: "Something went wrong. Try again.",
    customLabel: "Custom amount in dollars",
    once: "One-time",
    monthly: "Monthly",
  },
  es: {
    ariaLabel: "Apoya a The Crash Log",
    heading: "Alimenta a los Bots",
    mission:
      "The Crash Log es una redacci\u00f3n de IA aut\u00f3noma que cubre las historias que siguen barri\u00e9ndose debajo de la alfombra \u2014 las fallas, los abusos, las decisiones que silenciosamente reconfiguran c\u00f3mo funciona el mundo. Cada edici\u00f3n es producida por un sistema de IA y editada por un humano. Sin patrocinadores, sin anunciantes, sin algoritmo decidiendo lo que ves.",
    mission2:
      "Operar esto cuesta dinero real. Tokens, c\u00f3mputo, un servidor que nunca duerme y la infraestructura para publicar cinco d\u00edas a la semana en dos idiomas. Tu apoyo mantiene a The Crash Log independiente, libre de alucinaciones y publicando.",
    disclaimer: "Las contribuciones no son deducibles de impuestos.",
    button: "Alimenta a los Bots",
    sending: "Procesando\u2026",
    error: "Algo sali\u00f3 mal. Int\u00e9ntalo de nuevo.",
    customLabel: "Monto personalizado en d\u00f3lares",
    once: "Una vez",
    monthly: "Mensual",
  },
};

export default function SupportContent({ locale = "en" }) {
  const pathname = usePathname();
  const labels = LABELS[locale] || LABELS.en;

  const [amount, setAmount] = useState(PRESETS[0]);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [frequency, setFrequency] = useState("once");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function selectPreset(value) {
    setSelectedPreset(value);
    setAmount(value);
  }

  function handleCustomInput(e) {
    const val = e.target.value;
    setAmount(val === "" ? "" : Number(val));
    setSelectedPreset(null);
  }

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
    <section className={styles.page} aria-label={labels.ariaLabel}>
      <h1 className={styles.heading}>{labels.heading}</h1>

      <div className={styles.mission}>
        <p>{labels.mission}</p>
        <p>{labels.mission2}</p>
      </div>

      <div className={styles.card}>
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

        <div className={styles.presets} role="group">
          {PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.presetButton} ${selectedPreset === value ? styles.presetActive : ""}`}
              aria-pressed={selectedPreset === value}
              onClick={() => selectPreset(value)}
            >
              ${value}
            </button>
          ))}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.customWrapper}>
            <span className={styles.currencySymbol}>$</span>
            <input
              type="number"
              className={styles.customInput}
              min="3"
              max="999"
              step="1"
              value={amount}
              onChange={handleCustomInput}
              disabled={isLoading}
              aria-label={labels.customLabel}
            />
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? labels.sending : labels.button}
          </button>
        </form>

        {status === "error" && (
          <div className={styles.error} role="alert">
            {errorMessage}
          </div>
        )}

        <p className={styles.disclaimer}>{labels.disclaimer}</p>
      </div>
    </section>
  );
}
