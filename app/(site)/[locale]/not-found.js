// ABOUTME: Branded 404 page with locale-aware text and site navigation links.
// ABOUTME: Uses existing Footer for consistency, adds noindex robots directive.

import Link from "next/link";

export const metadata = {
  title: "404 — Page Not Found",
  robots: { index: false, follow: false },
};

const LABELS = {
  en: {
    title: "404",
    heading: "Page not found",
    message:
      "The page you're looking for doesn't exist, was removed, or the URL is wrong.",
    home: "Go to latest issue",
    archive: "Browse the archive",
  },
  es: {
    title: "404",
    heading: "Página no encontrada",
    message:
      "La página que buscas no existe, fue eliminada o la URL es incorrecta.",
    home: "Ir a la última edición",
    archive: "Explorar el archivo",
  },
};

export default function NotFound({ params }) {
  const locale = params?.locale || "en";
  const labels = LABELS[locale] || LABELS.en;

  return (
    <main
      style={{
        textAlign: "center",
        padding: "80px 0 40px",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "72px",
          fontWeight: 700,
          color: "var(--severity-error)",
          lineHeight: 1,
          marginBottom: "16px",
        }}
      >
        {labels.title}
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "24px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "16px",
        }}
      >
        {labels.heading}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "16px",
          color: "var(--text-tertiary)",
          lineHeight: 1.6,
          marginBottom: "32px",
        }}
      >
        {labels.message}
      </p>
      <nav
        style={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        <Link
          href={`/${locale}`}
          style={{ color: "var(--severity-error)", textDecoration: "none" }}
        >
          {labels.home}
        </Link>
        <Link
          href={`/${locale}/archive`}
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          {labels.archive}
        </Link>
      </nav>
    </main>
  );
}
