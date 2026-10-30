// ABOUTME: Guards the OG font loader: Satori (next/og) cannot parse WOFF/WOFF2, so only TTF/OTF may be requested.
// ABOUTME: Also scans every image-route generator for hardcoded .woff/.woff2 font URLs.

import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { loadGoogleFont, loadOgFonts } from "@/lib/ogFonts";

const TTF_CSS = `@font-face {
  font-family: 'Inter';
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/inter/v20/bold.ttf) format('truetype');
}`;
const WOFF2_CSS = `@font-face {
  font-family: 'Inter';
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/inter/v20/bold.woff2) format('woff2');
}`;

function stubFetch(css, fontStatus = 200) {
  const calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      calls.push(String(url));
      if (String(url).startsWith("https://fonts.googleapis.com/")) {
        return { ok: true, status: 200, text: async () => css };
      }
      return {
        ok: fontStatus === 200,
        status: fontStatus,
        statusText: "x",
        arrayBuffer: async () => new ArrayBuffer(8),
      };
    })
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe("loadGoogleFont", () => {
  it("fetches the TrueType file named in the CSS and returns its bytes", async () => {
    const calls = stubFetch(TTF_CSS);
    const data = await loadGoogleFont("Inter", 700);
    expect(data.byteLength).toBe(8);
    expect(calls).toContain("https://fonts.gstatic.com/s/inter/v20/bold.ttf");
  });

  it("rejects, without requesting a font file, when the CSS offers only woff2", async () => {
    const calls = stubFetch(WOFF2_CSS);
    await expect(loadGoogleFont("Inter", 700)).rejects.toThrow(
      /No TTF\/OTF source/
    );
    expect(calls.some((u) => u.endsWith(".woff2"))).toBe(false);
  });

  const FONT_URL = "https://fonts.gstatic.com/s/inter/v20/bold.ttf";
  const cssWith = (src) => `@font-face {
  font-family: 'Inter';
  font-weight: 700;
  src: ${src};
}`;

  it.each([
    ["unquoted", `url(${FONT_URL}) format('truetype')`],
    ["single-quoted", `url('${FONT_URL}') format('truetype')`],
    ["double-quoted", `url("${FONT_URL}") format("truetype")`],
    [
      "after a local() source with extra whitespace",
      `local('Inter Bold'), local("Inter-Bold"),  url( "${FONT_URL}" )   format( 'opentype' )`,
    ],
  ])("extracts a %s source URL without its quotes", async (_label, src) => {
    const calls = stubFetch(cssWith(src));
    await loadGoogleFont("Inter", 700);
    expect(calls).toContain(FONT_URL);
  });

  it("picks the TrueType file when a woff2 source is listed before it", async () => {
    const calls = stubFetch(
      cssWith(
        `url(https://fonts.gstatic.com/s/inter/v20/bold.woff2) format('woff2'), url('${FONT_URL}') format('truetype')`
      )
    );
    await loadGoogleFont("Inter", 700);
    expect(calls).toContain(FONT_URL);
    expect(calls.some((u) => u.endsWith(".woff2"))).toBe(false);
  });

  it("rejects a quoted woff2-only source", async () => {
    stubFetch(
      cssWith(
        `url("https://fonts.gstatic.com/s/inter/v20/bold.woff2") format("woff2")`
      )
    );
    await expect(loadGoogleFont("Inter", 700)).rejects.toThrow(
      /No TTF\/OTF source/
    );
  });

  it("rejects when the font file request fails", async () => {
    stubFetch(TTF_CSS, 500);
    await expect(loadGoogleFont("Inter", 700)).rejects.toThrow(
      /Font fetch failed: 500/
    );
  });
});

describe("loadOgFonts", () => {
  it("requests Instrument Serif 400, then DM Mono 400 and 500", async () => {
    const calls = stubFetch(TTF_CSS);
    const fonts = await loadOgFonts();
    expect(fonts).toHaveLength(3);
    fonts.forEach((f) => expect(f.byteLength).toBe(8));
    const css = calls.filter((u) => u.startsWith("https://fonts.googleapis"));
    expect(css).toEqual([
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400",
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400",
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@500",
    ]);
  });

  it("rejects when any one font cannot be loaded, so callers fall back", async () => {
    stubFetch(WOFF2_CSS);
    await expect(loadOgFonts()).rejects.toThrow(/No TTF\/OTF source/);
  });
});

describe("image-route generators", () => {
  const APP_ROOT = path.resolve(import.meta.dirname, "../../../app");

  function collect(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collect(full);
      return /^(opengraph|twitter)-image\.js$/.test(entry.name) ? [full] : [];
    });
  }

  it("never hardcode a .woff or .woff2 font URL", () => {
    const files = collect(APP_ROOT);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(fs.readFileSync(file, "utf8"), file).not.toMatch(/\.woff2?\b/);
    }
  });
});
