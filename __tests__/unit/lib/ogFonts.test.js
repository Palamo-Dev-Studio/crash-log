// ABOUTME: Guards the OG font loader: Satori (next/og) cannot parse WOFF/WOFF2, so only TTF/OTF may be requested.
// ABOUTME: Also scans every image-route generator for hardcoded .woff/.woff2 font URLs.

import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { loadGoogleFont, loadInterFonts } from "@/lib/ogFonts";

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

  it("rejects when the font file request fails", async () => {
    stubFetch(TTF_CSS, 500);
    await expect(loadGoogleFont("Inter", 700)).rejects.toThrow(
      /Font fetch failed: 500/
    );
  });
});

describe("loadInterFonts", () => {
  it("requests Inter 700 then 400", async () => {
    const calls = stubFetch(TTF_CSS);
    const [bold, regular] = await loadInterFonts();
    expect(bold.byteLength).toBe(8);
    expect(regular.byteLength).toBe(8);
    expect(calls.filter((u) => u.includes("wght@700"))).toHaveLength(1);
    expect(calls.filter((u) => u.includes("wght@400"))).toHaveLength(1);
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
