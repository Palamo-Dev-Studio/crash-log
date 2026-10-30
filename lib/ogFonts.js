// ABOUTME: Loads TTF/OTF font data for next/og ImageResponse generators (Satori cannot parse WOFF/WOFF2).
// ABOUTME: Resolves the font file through the Google Fonts CSS API, which serves TrueType to non-browser user agents.

// Accepts quoted or unquoted URLs, either quote style around the format, and any
// preceding sources (e.g. local(...)); a url() followed by woff/woff2 never matches.
const CSS_SOURCE_PATTERN =
  /url\(\s*['"]?([^'")\s]+)['"]?\s*\)\s*format\(\s*['"](opentype|truetype)['"]\s*\)/;

const FETCH_TIMEOUT_MS = 5000;

export async function loadGoogleFont(family, weight) {
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
    { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
  );
  if (!cssRes.ok) {
    throw new Error(
      `Font CSS fetch failed for ${family} ${weight}: ${cssRes.status}`
    );
  }
  const css = await cssRes.text();
  const match = css.match(CSS_SOURCE_PATTERN);
  if (!match) {
    throw new Error(`No TTF/OTF source for ${family} ${weight}`);
  }
  const fontRes = await fetch(match[1], {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!fontRes.ok) {
    throw new Error(
      `Font fetch failed: ${fontRes.status} ${fontRes.statusText}`
    );
  }
  return fontRes.arrayBuffer();
}

let fontsPromise = null;

// Test hook: forget the cached load.
export function resetOgFontCache() {
  fontsPromise = null;
}

// Returns [serif, mono regular, mono medium]: Instrument Serif 400 for titles and
// DM Mono 400/500 for kickers and meta, the trio every Field Manual OG image renders with.
// The load is shared across calls; a failed load is dropped so the next call retries.
export function loadOgFonts() {
  if (!fontsPromise) {
    const pending = Promise.all([
      loadGoogleFont("Instrument+Serif", 400),
      loadGoogleFont("DM+Mono", 400),
      loadGoogleFont("DM+Mono", 500),
    ]);
    fontsPromise = pending;
    pending.catch(() => {
      if (fontsPromise === pending) fontsPromise = null;
    });
  }
  return fontsPromise;
}
