// ABOUTME: Email template builder for Beehiiv newsletter drafts.
// ABOUTME: Generates complete HTML emails from Sanity issue data with inline styles.

import { portableTextToHtml } from "@/lib/portableTextToHtml";
import { urlFor } from "@/lib/sanity";
import { t } from "@/lib/locale";
import { getStoryColorKey } from "@/lib/storyColors";
import { escapeHtml, sanitizeHref } from "@/lib/htmlUtils";

const SEVERITY_COLORS = {
  error: { text: "#e8453e", glow: "rgba(232, 69, 62, 0.12)" },
  override: { text: "#e8a030", glow: "rgba(232, 160, 48, 0.12)" },
  warning: { text: "#e8c832", glow: "rgba(232, 200, 50, 0.12)" },
  critical: { text: "#c43030", glow: "rgba(196, 48, 48, 0.15)" },
  breach: { text: "#30c8e8", glow: "rgba(48, 200, 232, 0.12)" },
};

const LABELS = {
  en: {
    issuePrefix: "Issue",
    nicosTransmission: "Nico\u2019s Transmission",
    signature: "\u2014 Nico",
    stackTrace: "Stack Trace",
    viewInBrowser: "View in browser",
    unsubscribe: "Unsubscribe",
    footer:
      "You\u2019re receiving this because you subscribed to The Crash Log.",
  },
  es: {
    issuePrefix: "Edici\u00F3n",
    nicosTransmission: "Transmisi\u00F3n de Nico",
    signature: "\u2014 Nico",
    stackTrace: "Stack Trace",
    viewInBrowser: "Ver en el navegador",
    unsubscribe: "Cancelar suscripci\u00F3n",
    footer: "Recibes esto porque te suscribiste a The Crash Log.",
  },
};

export function buildEmailSubject(issue, locale = "en") {
  const num = String(issue.issueNumber).padStart(3, "0");
  const title = t(issue.title, locale);
  return `The Crash Log #${num}: ${title}`;
}

export function buildEmailHtml(issue, locale = "en") {
  const l = LABELS[locale] || LABELS.en;
  const num = String(issue.issueNumber).padStart(3, "0");
  const title = escapeHtml(t(issue.title, locale));
  const subtitle = escapeHtml(t(issue.subtitle, locale));
  const slug = issue.slug;
  const browserUrl = `https://crashlog.ai/${locale}/issue/${slug}`;

  let coverImageHtml = "";
  if (issue.coverImage?.asset) {
    const coverUrl = urlFor(issue.coverImage).width(720).format("jpg").url();
    const coverAlt = escapeHtml(
      t(issue.coverImageAlt, locale) || "Cover image"
    );
    coverImageHtml = `
      <tr><td style="padding: 0 28px 32px;">
        <img src="${coverUrl}" alt="${coverAlt}" width="720" style="width: 100%; height: auto; border-radius: 4px; border: 1px solid #333338;" />
      </td></tr>`;
  }

  const nicosBody = portableTextToHtml(t(issue.nicosTransmission, locale));
  let nicosHtml = "";
  if (nicosBody) {
    nicosHtml = `
      <tr><td style="padding: 0 28px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1E1E22; border: 1px solid #2a2a30; border-left: 3px solid #e8453e; border-radius: 4px;">
          <tr><td style="padding: 32px 36px;">
            <p style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #e8453e; margin: 0 0 16px;">
              \u2014\u2014 ${l.nicosTransmission}
            </p>
            <div style="font-family: 'Source Serif 4', Georgia, serif; font-size: 17px; color: #c8cdd6; line-height: 1.8;">
              ${nicosBody}
            </div>
            <p style="font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #6b6b72; margin: 16px 0 0;">
              ${l.signature}
            </p>
          </td></tr>
        </table>
      </td></tr>`;
  }

  const stories = (issue.stories || []).filter(Boolean);
  let storiesHtml = "";
  stories.forEach((story, index) => {
    const colorKey = getStoryColorKey(index);
    const colors = SEVERITY_COLORS[colorKey] || SEVERITY_COLORS.error;
    const severity = escapeHtml(t(story.severity, locale) || story.severity);
    const headline = escapeHtml(t(story.headline, locale));
    const bodyHtml = portableTextToHtml(t(story.body, locale));
    const categoryName = story.category
      ? escapeHtml(t(story.category.name, locale))
      : "";

    const sourcesHtml = (story.sources || [])
      .map((src) => {
        const outlet = escapeHtml(
          t(src.sourceOutlet, locale) || src.sourceOutlet
        );
        const url = src.url;
        if (url) {
          return `<a href="${sanitizeHref(url)}" target="_blank" rel="noopener noreferrer" style="color: #30c8e8; text-decoration: underline; font-family: 'IBM Plex Mono', monospace; font-size: 12px;">${outlet}</a>`;
        }
        return `<span style="font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #6b6b72;">${outlet}</span>`;
      })
      .join('<span style="color: #333338; margin: 0 6px;">|</span>');

    const divider =
      index > 0
        ? '<tr><td style="padding: 0 28px 40px;"><hr style="border: none; border-top: 1px solid #333338;" /></td></tr>'
        : "";

    storiesHtml += `
      ${divider}
      <tr><td style="padding: 0 28px 48px;">
        <span style="display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; border-radius: 3px; color: ${colors.text}; border: 1.5px solid ${colors.text}; background: ${colors.glow}; margin-bottom: 12px;">
          ${severity}
        </span>
        <h2 style="font-family: 'IBM Plex Mono', monospace; font-size: 17px; font-weight: 600; line-height: 1.4; margin: 12px 0 8px; color: #e8ecf2;">
          <span style="color: ${colors.text};">${headline}</span>
        </h2>
        ${categoryName ? `<p style="font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #6b6b72; margin-bottom: 16px;">${categoryName}</p>` : ""}
        <div style="font-family: 'Source Serif 4', Georgia, serif; font-size: 16.5px; color: #c8cdd6; line-height: 1.78;">
          ${bodyHtml}
        </div>
        ${sourcesHtml ? `<p style="margin-top: 16px;">${sourcesHtml}</p>` : ""}
      </td></tr>`;
  });

  const stackTrace = issue.stackTrace || [];
  let stackTraceHtml = "";
  if (stackTrace.length > 0) {
    const items = stackTrace
      .map((hit) => {
        const text = escapeHtml(t(hit.text, locale) || hit.text);
        const outlet = escapeHtml(hit.sourceOutlet || "");
        const url = hit.sourceUrl || "";
        const sourceLink = url
          ? `<a href="${sanitizeHref(url)}" target="_blank" rel="noopener noreferrer" style="color: #30c8e8; text-decoration: underline;">${outlet}</a>`
          : outlet;
        return `
          <tr><td style="padding: 12px 0; border-bottom: 1px solid #2a2a30;">
            <p style="font-family: 'Source Serif 4', Georgia, serif; font-size: 15px; color: #c8cdd6; line-height: 1.6; margin: 0 0 4px;">${text}</p>
            ${sourceLink ? `<p style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #6b6b72; margin: 0;">${sourceLink}</p>` : ""}
          </td></tr>`;
      })
      .join("");

    stackTraceHtml = `
      <tr><td style="padding: 0 28px 48px;">
        <p style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #e8453e; margin-bottom: 16px;">
          ${l.stackTrace}
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${items}
        </table>
      </td></tr>`;
  }

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${buildEmailSubject(issue, locale)}</title>
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

        <!-- Issue meta -->
        <tr><td style="padding: 32px 28px 0;">
          <p style="font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #6b6b72; margin: 0 0 20px;">
            ${l.issuePrefix} #${num} &middot; ${issue.publishDate || ""}
          </p>
          <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #e8ecf2; line-height: 1.12; letter-spacing: -0.02em; margin: 0 0 16px;">
            ${title}
          </h2>
          ${subtitle ? `<p style="font-family: 'Source Serif 4', Georgia, serif; font-size: 18px; color: #c8cdd6; line-height: 1.65; margin: 0 0 32px;">${subtitle}</p>` : ""}
        </td></tr>

        <!-- Cover image -->
        ${coverImageHtml}

        <!-- Nico's Transmission -->
        ${nicosHtml}

        <!-- Stories -->
        ${storiesHtml}

        <!-- Stack Trace -->
        ${stackTraceHtml}

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
