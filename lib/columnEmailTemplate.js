// ABOUTME: Email template builder for Nico's Notes column Beehiiv newsletter drafts.
// ABOUTME: Generates complete HTML emails from Sanity column data with inline styles.

import { portableTextToHtml } from "@/lib/portableTextToHtml";
import { urlFor } from "@/lib/sanity";
import { t } from "@/lib/locale";
import { escapeHtml } from "@/lib/htmlUtils";

const LABELS = {
  en: {
    columnPrefix: "Nico\u2019s Notes",
    signature: "\u2014 Nico",
    viewInBrowser: "View in browser",
    unsubscribe: "Unsubscribe",
    footer:
      "You\u2019re receiving this because you subscribed to The Crash Log.",
  },
  es: {
    columnPrefix: "Notas de Nico",
    signature: "\u2014 Nico",
    viewInBrowser: "Ver en el navegador",
    unsubscribe: "Cancelar suscripci\u00F3n",
    footer: "Recibes esto porque te suscribiste a The Crash Log.",
  },
};

export function buildColumnEmailSubject(column, locale = "en") {
  const l = LABELS[locale] || LABELS.en;
  const num = String(column.columnNumber).padStart(3, "0");
  const title = t(column.title, locale);
  return `${l.columnPrefix} #${num}: ${title}`;
}

export function buildColumnEmailHtml(column, locale = "en") {
  const l = LABELS[locale] || LABELS.en;
  const num = String(column.columnNumber).padStart(3, "0");
  const title = escapeHtml(t(column.title, locale));
  const subtitle = escapeHtml(t(column.subtitle, locale));
  const slug = column.slug;
  const browserUrl = `https://crashlog.ai/${locale}/nico/${slug}`;

  let coverImageHtml = "";
  if (column.coverImage?.asset) {
    const coverUrl = urlFor(column.coverImage).width(720).format("jpg").url();
    const coverAlt = escapeHtml(
      t(column.coverImageAlt, locale) || "Cover image"
    );
    coverImageHtml = `
      <tr><td style="padding: 0 28px 32px;">
        <img src="${coverUrl}" alt="${coverAlt}" width="720" style="width: 100%; height: auto; border-radius: 4px; border: 1px solid #333338;" />
      </td></tr>`;
  }

  const bodyHtml = portableTextToHtml(t(column.body, locale));

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${buildColumnEmailSubject(column, locale)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background: #0A0A0A; color: #c8cdd6; font-family: 'Source Serif 4', Georgia, serif; font-size: 16.5px; line-height: 1.72;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0A0A0A;">
    <tr><td align="center">
      <table width="720" cellpadding="0" cellspacing="0" style="max-width: 720px; width: 100%;">

        <!-- View in browser -->
        <tr><td style="padding: 16px 28px 0; text-align: center;">
          <a href="${browserUrl}" style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #6b6b72; text-decoration: underline;">${l.viewInBrowser}</a>
        </td></tr>

        <!-- Header -->
        <tr><td style="padding: 32px 28px 24px;">
          <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: #e8ecf2; letter-spacing: -0.02em; text-transform: uppercase; margin: 0; line-height: 1;">
            THE CRASH LOG
          </h1>
          <p style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #6b6b72; margin: 7px 0 0;">
            AI &amp; Tech Gone Off the Rails
          </p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding: 0 28px;"><hr style="border: none; border-top: 1px solid #333338;" /></td></tr>

        <!-- Column meta -->
        <tr><td style="padding: 32px 28px 0;">
          <p style="font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #e8453e; margin: 0 0 20px;">
            ${l.columnPrefix} #${num} &middot; ${column.publishDate ? column.publishDate.slice(0, 10) : ""}
          </p>
          <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #e8ecf2; line-height: 1.12; letter-spacing: -0.02em; margin: 0 0 16px;">
            ${title}
          </h2>
          ${subtitle ? `<p style="font-family: 'Source Serif 4', Georgia, serif; font-size: 18px; color: #c8cdd6; line-height: 1.65; margin: 0 0 32px;">${subtitle}</p>` : ""}
        </td></tr>

        <!-- Cover image -->
        ${coverImageHtml}

        <!-- Body -->
        <tr><td style="padding: 0 28px 32px;">
          <div style="font-family: 'Source Serif 4', Georgia, serif; font-size: 17px; color: #c8cdd6; line-height: 1.8;">
            ${bodyHtml}
          </div>
        </td></tr>

        <!-- Signature -->
        <tr><td style="padding: 0 28px 48px;">
          <p style="font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #e8453e;">
            ${l.signature}
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding: 32px 28px; border-top: 1px solid #333338; text-align: center;">
          <p style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #6b6b72; margin: 0 0 8px;">
            ${l.footer}
          </p>
          <a href="{unsubscribe_url}" style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #30c8e8; text-decoration: underline;">${l.unsubscribe}</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
