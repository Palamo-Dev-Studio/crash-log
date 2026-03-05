// ABOUTME: Client-side subscribe form that expands inline from a trigger button.
// ABOUTME: Posts to /api/subscribe and shows success/error feedback with bilingual labels.

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./SubscribeForm.module.css";

const LABELS = {
  en: {
    subscribe: "Subscribe",
    placeholder: "your@email.com",
    submit: "Go",
    sending: "Sending\u2026",
    success: "You\u2019re in!",
    alreadySubscribed: "Already subscribed!",
    error: "Something went wrong. Try again.",
    emailLabel: "Email",
    close: "Close subscribe form",
  },
  es: {
    subscribe: "Suscribirse",
    placeholder: "tu@correo.com",
    submit: "Ir",
    sending: "Enviando\u2026",
    success: "\u00A1Listo!",
    alreadySubscribed: "\u00A1Ya est\u00E1s suscrito!",
    error: "Algo sali\u00F3 mal. Int\u00E9ntalo de nuevo.",
    emailLabel: "Correo electr\u00F3nico",
    close: "Cerrar formulario de suscripci\u00F3n",
  },
};

export default function SubscribeForm({ locale = "en" }) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const router = useRouter();
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    if (status === "success" && !alreadySubscribed) {
      redirectTimerRef.current = setTimeout(() => {
        router.push(`/${locale}/subscribe/thank-you`);
      }, 1500);
    }
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [status, alreadySubscribed, locale, router]);

  const l = LABELS[locale] || LABELS.en;

  if (status === "success") {
    return (
      <div className={styles.result} role="status">
        {alreadySubscribed ? l.alreadySubscribed : l.success}
      </div>
    );
  }

  if (!expanded) {
    return (
      <button className={styles.trigger} onClick={() => setExpanded(true)}>
        {l.subscribe}
      </button>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setAlreadySubscribed(!!data.alreadySubscribed);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="email"
        className={styles.input}
        placeholder={l.placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
        required
        aria-label={l.emailLabel}
      />
      <button
        type="submit"
        className={styles.submit}
        disabled={status === "loading"}
      >
        {status === "loading" ? l.sending : l.submit}
      </button>
      <button
        type="button"
        className={styles.close}
        onClick={() => {
          setExpanded(false);
          setStatus("idle");
        }}
        aria-label={l.close}
      >
        &times;
      </button>
      {status === "error" && (
        <div className={styles.error} role="alert">
          {l.error}
        </div>
      )}
    </form>
  );
}
