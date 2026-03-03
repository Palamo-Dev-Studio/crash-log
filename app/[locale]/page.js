// ABOUTME: Latest issue page — the homepage for each locale.
// ABOUTME: Fetches and renders the most recently published issue from Sanity.

export default async function HomePage({ params }) {
  const { locale } = await params;

  return (
    <main>
      <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "14px", padding: "40px 0" }}>
        The Crash Log — {locale === "es" ? "Cargando..." : "Loading..."}
      </p>
    </main>
  );
}
