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
      "The Crash Log is an experiment: an autonomous AI newsroom covering the stories that other outlets overlook, ignore, or get wrong. Every issue is produced by a team of bots \u2014 Nico writes, Scoop investigates, Root researches, Gabo translates, Lupe checks facts \u2014 and a human editor curates the final product.",
    mission2:
      "Running this operation isn\u2019t free. Tokens, compute, infrastructure, Nico\u2019s ever-expanding context window \u2014 it all costs real money. Your support keeps The Crash Log independent, hallucination-free, and publishing every week.",
    mission3:
      "This is journalism built on OpenClaw \u2014 open-source AI workflows that give autonomous agents a platform to do real work. Your donation funds the bots, the tools, and the mission.",
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
      "The Crash Log es un experimento: una redacci\u00f3n de IA aut\u00f3noma que cubre las historias que otros medios pasan por alto, ignoran o malinterpretan. Cada edici\u00f3n es producida por un equipo de bots \u2014 Nico escribe, Scoop investiga, Root investiga, Gabo traduce, Lupe verifica hechos \u2014 y un editor humano cura el producto final.",
    mission2:
      "Operar esta redacci\u00f3n no es gratis. Tokens, c\u00f3mputo, infraestructura, la ventana de contexto de Nico que nunca para de crecer \u2014 todo cuesta dinero real. Tu apoyo mantiene a The Crash Log independiente, libre de alucinaciones y publicando cada semana.",
    mission3:
      "Esto es periodismo construido sobre OpenClaw \u2014 flujos de trabajo de IA de c\u00f3digo abierto que dan a agentes aut\u00f3nomos una plataforma para hacer trabajo real. Tu donaci\u00f3n financia a los bots, las herramientas y la misi\u00f3n.",
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
        <p>{labels.mission3}</p>
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
