// ABOUTME: Shared Field Manual Open Graph template: cream card, stamp roundel, file-code chip, serif title.
// ABOUTME: Every opengraph-image route renders through renderOgImage; fonts fall back to the built-in face on failure.

import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/ogFonts";
import { SYMBOL_PATH, SYMBOL_ORIGIN } from "@/components/roundelSymbol";
import { LEGEND_PATH } from "@/lib/ogRoundelLegend";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Field Manual tokens (docs/reference/field-manual/SPEC.md); the -ink variants clear AA on cream.
const CREAM = "#F4ECDD";
const INK = "#2A2420";
const MUTED = "#5C5043";
const TERRA = "#A83F24";
const TERRA_INK = "#8F3219";
const TEAL_INK = "#17615D";

const SERIES_INK = {
  offTheRails: TERRA_INK,
  practical: TEAL_INK,
  nicosNotes: INK,
};

const SERIF = "Instrument Serif";
const MONO = "DM Mono";

export const OG_COPY = {
  en: {
    tagline: "Incident reports on AI · Read closely · What to do next",
    kicker: "Incident report",
  },
  es: {
    tagline: "Incidentes de IA · Lectura atenta · Qué hacer después",
    kicker: "Informe de incidentes",
  },
};

export const MAX_TITLE_LENGTH = 90;

export function clampTitle(title, max = MAX_TITLE_LENGTH) {
  const text = String(title ?? "").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

// Font size by title length; Instrument Serif is narrow, so these fit 1056px.
export function titleFontSize(length) {
  if (length <= 28) return 104;
  if (length <= 46) return 88;
  if (length <= 64) return 74;
  return 62;
}

// Satori has no text-wrap: balance, so lines are computed here. Greedy fill sets the
// line count, then a minimum-raggedness search evens the lines out. Width is measured
// in characters (Instrument Serif advances ~0.41em).
export function balanceLines(title, fontSize, maxWidthPx = 1056) {
  const words = String(title).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const maxChars = Math.max(8, Math.floor(maxWidthPx / (fontSize * 0.41)));

  let lineCount = 1;
  let used = 0;
  for (const word of words) {
    const needed = used === 0 ? word.length : used + 1 + word.length;
    if (used > 0 && needed > maxChars) {
      lineCount += 1;
      used = word.length;
    } else {
      used = needed;
    }
  }
  if (lineCount === 1) return [words.join(" ")];

  const lens = (from, to) =>
    words.slice(from, to).reduce((n, w) => n + w.length, 0) + (to - from - 1);
  const target = lens(0, words.length) / lineCount;
  const memo = new Map();
  // Best raggedness placing words[i..] on k lines, or null if no split fits.
  function best(i, k) {
    const key = `${i}:${k}`;
    if (memo.has(key)) return memo.get(key);
    let result = null;
    if (k === 1) {
      const len = lens(i, words.length);
      if (len <= maxChars) result = { cost: (len - target) ** 2, cut: [] };
    } else {
      for (let j = i + 1; j <= words.length - (k - 1); j++) {
        const len = lens(i, j);
        if (len > maxChars) break;
        const rest = best(j, k - 1);
        if (!rest) continue;
        const cost = (len - target) ** 2 + rest.cost;
        if (!result || cost < result.cost) {
          result = { cost, cut: [j, ...rest.cut] };
        }
      }
    }
    memo.set(key, result);
    return result;
  }

  for (let k = lineCount; k <= lineCount + 2; k++) {
    const plan = best(0, k);
    if (plan) {
      const cuts = [0, ...plan.cut, words.length];
      return cuts
        .slice(0, -1)
        .map((start, idx) => words.slice(start, cuts[idx + 1]).join(" "));
    }
  }
  // A single word longer than a line: let each word stand on its own line.
  return words;
}

// The stamp roundel as inline SVG: legend ring, inner ring, terracotta symbol.
// Satori supports neither SVG filters nor <text>, so the ink-texture filter is dropped
// and the legend is a pre-set glyph path (lib/ogRoundelLegend.js).
export function OgRoundel({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r="56.5"
        fill="none"
        stroke={INK}
        strokeWidth="4"
      />
      <path d={LEGEND_PATH} fill={INK} />
      <circle
        cx="60"
        cy="60"
        r="36"
        fill="none"
        stroke={INK}
        strokeWidth="1.8"
      />
      <path
        transform={`translate(60 60) scale(0.04436) ${SYMBOL_ORIGIN}`}
        fill={TERRA}
        d={SYMBOL_PATH}
      />
    </svg>
  );
}

function Chip({ children, color }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: 26,
        letterSpacing: "0.06em",
        color,
        border: `2px solid ${color}`,
        borderRadius: 3,
        padding: "5px 14px",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, color = MUTED, size = 22 }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: MONO,
        fontWeight: 400,
        fontSize: size,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  );
}

function DoubleRule() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", height: 3, backgroundColor: INK }} />
      <div style={{ display: "flex", height: 1, backgroundColor: INK }} />
    </div>
  );
}

function Frame({ children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: CREAM,
        padding: "52px 72px 44px",
        justifyContent: "space-between",
      }}
    >
      {children}
    </div>
  );
}

function Footer({ meta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <DoubleRule />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Label color={INK}>The Crash Log</Label>
        <div style={{ display: "flex", gap: 28 }}>
          {meta.map((item) => (
            <Label key={item}>{item}</Label>
          ))}
          <Label>crashlog.ai</Label>
        </div>
      </div>
    </div>
  );
}

// Default site card: roundel, wordmark, a static stand-in for the blinking bar, and the tagline.
export function SiteCard({ locale }) {
  const copy = OG_COPY[locale] || OG_COPY.en;
  return (
    <Frame>
      <Label color={TERRA_INK}>{copy.kicker}</Label>
      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        <OgRoundel size={240} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                fontFamily: SERIF,
                fontSize: 128,
                lineHeight: 1,
                color: INK,
              }}
            >
              The Crash Log
            </div>
            <div
              style={{
                display: "flex",
                width: 22,
                height: 84,
                marginLeft: 14,
                backgroundColor: TERRA,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: MONO,
              fontSize: 21,
              color: MUTED,
              whiteSpace: "nowrap",
            }}
          >
            {copy.tagline}
          </div>
        </div>
      </div>
      <Footer meta={[]} />
    </Frame>
  );
}

// Per-file and per-page card. `code` (OTR-027) renders as a chip in the series colour;
// pages and indexes pass only `kicker`.
export function TitleCard({ series, code, kicker, title, meta = [] }) {
  const ink = SERIES_INK[series] || INK;
  const text = clampTitle(title);
  const fontSize = titleFontSize(text.length);
  const lines = balanceLines(text, fontSize);
  return (
    <Frame>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {code ? <Chip color={ink}>{code}</Chip> : null}
          {kicker ? <Label color={ink}>{kicker}</Label> : null}
        </div>
        <OgRoundel size={132} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              fontFamily: SERIF,
              fontSize,
              lineHeight: 1.06,
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </div>
        ))}
      </div>
      <Footer meta={meta} />
    </Frame>
  );
}

// Builds the ImageResponse for `element`. If the fonts cannot be loaded the image is
// still rendered, without a fonts option, in ImageResponse's built-in face.
export async function renderOgImage(element) {
  const fonts = await loadOgFonts().catch(() => null);
  return new ImageResponse(element, {
    ...OG_SIZE,
    ...(fonts
      ? {
          fonts: [
            { name: SERIF, data: fonts[0], style: "normal", weight: 400 },
            { name: MONO, data: fonts[1], style: "normal", weight: 400 },
            { name: MONO, data: fonts[2], style: "normal", weight: 500 },
          ],
        }
      : {}),
  });
}
