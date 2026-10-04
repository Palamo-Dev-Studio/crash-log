// ABOUTME: Client-side subscribe form that expands inline from a trigger button.
// ABOUTME: On valid submit, navigates the browser to Substack's subscribe page with the email pre-filled.

"use client";

import { useState } from "react";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";
import styles from "./SubscribeForm.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LABELS = {
  en: {
    subscribe: "Subscribe",
    placeholder: "your@email.com",
    submit: "Go",
    error: "Enter a valid email address.",
    emailLabel: "Email",
    close: "Close subscribe form",
  },
  es: {
    subscribe: "Suscríbete",
    placeholder: "tu@correo.com",
    submit: "Ir",
    error: "Ingresa un correo electrónico válido.",
    emailLabel: "Correo electrónico",
    close: "Cerrar formulario de suscripción",
  },
};

export default function SubscribeForm({ locale = "en" }) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  const l = LABELS[locale] || LABELS.en;

  if (!expanded) {
    return (
      <button className={styles.trigger} onClick={() => setExpanded(true)}>
        {l.subscribe}
      </button>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Belt-and-braces: <input type="email"> already strips leading/trailing
    // whitespace at the DOM level (WHATWG value sanitization algorithm), so
    // `email` never actually arrives padded via this input in any browser or
    // in jsdom — verified directly against a raw jsdom input element. This
    // .trim() can't be exercised by a UI-driven test for that reason.
    const trimmed = email.trim();

    if (!EMAIL_REGEX.test(trimmed)) {
      setError(true);
      return;
    }

    setError(false);
    window.location.href = `${SUBSTACK_SUBSCRIBE_URL}?email=${encodeURIComponent(trimmed)}`;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input
        type="email"
        className={styles.input}
        placeholder={l.placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label={l.emailLabel}
      />
      <button type="submit" className={styles.submit}>
        {l.submit}
      </button>
      <button
        type="button"
        className={styles.close}
        onClick={() => {
          setExpanded(false);
          setError(false);
        }}
        aria-label={l.close}
      >
        &times;
      </button>
      {error && (
        <div className={styles.error} role="alert">
          {l.error}
        </div>
      )}
    </form>
  );
}
