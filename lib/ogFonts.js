// ABOUTME: Loads TTF/OTF font data for next/og ImageResponse generators (Satori cannot parse WOFF/WOFF2).
// ABOUTME: Resolves the font file through the Google Fonts CSS API, which serves TrueType to non-browser user agents.

const CSS_SOURCE_PATTERN = /src: url\((.+?)\) format\('(opentype|truetype)'\)/;

export async function loadGoogleFont(family, weight) {
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`
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
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(
      `Font fetch failed: ${fontRes.status} ${fontRes.statusText}`
    );
  }
  return fontRes.arrayBuffer();
}

// Returns [bold, regular] Inter data, the pair every OG generator renders with.
export function loadInterFonts() {
  return Promise.all([
    loadGoogleFont("Inter", 700),
    loadGoogleFont("Inter", 400),
  ]);
}
