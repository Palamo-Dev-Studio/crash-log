// ABOUTME: Env-gated Beehiiv recommendations widget slot.
// ABOUTME: Renders nothing until NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL is configured.

"use client";

const LABELS = {
  en: { heading: "Recommended by The Crash Log" },
  es: { heading: "Recomendado por The Crash Log" },
};

export default function BeehiivRecommendations({ locale = "en" }) {
  const url = process.env.NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL;

  if (!url) return null;

  const l = LABELS[locale] || LABELS.en;

  return (
    <div id="beehiiv-recommendations" data-url={url}>
      <p>{l.heading}</p>
    </div>
  );
}
