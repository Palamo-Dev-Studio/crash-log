// ABOUTME: Unit tests for the OG template helpers: title clamping, size tiers and balanced line wrapping.
// ABOUTME: Also pins the roundel to satori-safe SVG (no <text>, no filter) and the elements the cards must contain.

import { describe, it, expect, vi } from "vitest";
import { isValidElement } from "react";

vi.mock("next/og", () => ({ ImageResponse: class {} }));
vi.mock("@/lib/ogFonts", () => ({ loadOgFonts: vi.fn() }));

import {
  balanceLines,
  clampTitle,
  titleFontSize,
  MAX_TITLE_LENGTH,
  OgRoundel,
  SiteCard,
  TitleCard,
} from "@/lib/ogTemplate";

function collect(node, out = []) {
  if (node == null || typeof node === "boolean") return out;
  if (typeof node === "string" || typeof node === "number") {
    out.push(String(node));
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => collect(n, out));
    return out;
  }
  if (isValidElement(node)) {
    if (typeof node.type === "function")
      return collect(node.type(node.props), out);
    out.push(node);
    collect(node.props.children, out);
  }
  return out;
}

const texts = (el) => collect(el).filter((n) => typeof n === "string");
const tags = (el) =>
  collect(el)
    .filter((n) => typeof n === "object")
    .map((n) => n.type);

describe("clampTitle", () => {
  it("leaves short titles alone and trims whitespace", () => {
    expect(clampTitle("  Short title ")).toBe("Short title");
  });

  it("cuts long titles at a word boundary with an ellipsis within the limit", () => {
    const long = "word ".repeat(60);
    const out = clampTitle(long);
    expect(out.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/wor…$/);
  });

  it("handles missing titles", () => {
    expect(clampTitle(undefined)).toBe("");
  });
});

describe("titleFontSize", () => {
  it("steps down as titles get longer", () => {
    const sizes = [10, 40, 60, 90].map(titleFontSize);
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
    expect(new Set(sizes).size).toBe(4);
  });
});

describe("balanceLines", () => {
  it("keeps a short title on one line", () => {
    expect(balanceLines("Check the Backups", 104)).toEqual([
      "Check the Backups",
    ]);
  });

  it("never drops or reorders words", () => {
    const title =
      "How to keep an AI agent from quietly deleting your customer records";
    const lines = balanceLines(title, 62);
    expect(lines.join(" ")).toBe(title);
  });

  it("wraps long titles into lines that each fit and are near-even in length", () => {
    const title =
      "How to keep an AI agent from quietly deleting your customer records";
    const size = 74;
    const lines = balanceLines(title, size);
    const maxChars = Math.floor(1056 / (size * 0.41));
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach((l) => expect(l.length).toBeLessThanOrEqual(maxChars));
    const lens = lines.map((l) => l.length);
    expect(Math.max(...lens) - Math.min(...lens)).toBeLessThanOrEqual(12);
  });

  it("does not leave a lone short word on the last line", () => {
    const lines = balanceLines(
      "Why every owner should read the vendor terms twice",
      88
    );
    expect(lines[lines.length - 1].split(" ").length).toBeGreaterThan(1);
  });

  it("puts an over-long single word on its own line instead of hanging", () => {
    const lines = balanceLines(
      "Supercalifragilisticexpialidocious-and-more words",
      104
    );
    expect(lines.join(" ")).toContain(
      "Supercalifragilisticexpialidocious-and-more"
    );
  });

  it("returns no lines for an empty title", () => {
    expect(balanceLines("   ", 88)).toEqual([]);
  });

  it("stays fast on adversarial input", () => {
    const title = Array.from({ length: 200 }, (_, i) => `w${i}`).join(" ");
    const start = performance.now();
    balanceLines(title, 62);
    expect(performance.now() - start).toBeLessThan(50);
  });
});

describe("OgRoundel", () => {
  it("uses only satori-safe SVG: paths and circles, no text or filter", () => {
    const used = new Set(tags(OgRoundel({ size: 100 })));
    expect(used.has("text")).toBe(false);
    expect(used.has("textPath")).toBe(false);
    expect(used.has("filter")).toBe(false);
    expect(used.has("path")).toBe(true);
    expect(used.has("circle")).toBe(true);
  });
});

describe("cards", () => {
  it("TitleCard shows the chip code, series kicker, title lines and meta", () => {
    const all = texts(
      TitleCard({
        series: "offTheRails",
        code: "OTR-027",
        kicker: "Off the Rails",
        title: "Cutting Humans Out of the Loop",
        meta: ["3 CASES", "June 11, 2026"],
      })
    );
    [
      "OTR-027",
      "Off the Rails",
      "3 CASES",
      "June 11, 2026",
      "crashlog.ai",
    ].forEach((s) => expect(all).toContain(s));
    expect(all.join(" ")).toContain("Cutting Humans");
  });

  it("TitleCard omits the chip when there is no code", () => {
    const all = texts(TitleCard({ title: "About" }));
    expect(all).toContain("About");
    expect(all.some((s) => /^[A-Z]+-\d{3}$/.test(s))).toBe(false);
  });

  it("TitleCard clamps over-long titles", () => {
    const all = texts(TitleCard({ title: "word ".repeat(80) })).join(" ");
    expect(all).toContain("…");
  });

  it("uses cream background and series ink colours", () => {
    const frame = TitleCard({
      series: "practical",
      code: "FIX-001",
      title: "T",
    });
    const json = JSON.stringify(
      collect(frame)
        .filter((n) => typeof n === "object")
        .map((n) => n.props.style)
    );
    expect(json).toContain("#F4ECDD");
    expect(json).toContain("#17615D");
  });

  it("SiteCard carries the wordmark and the locale tagline", () => {
    expect(texts(SiteCard({ locale: "en" }))).toContain("Crash Log");
    expect(texts(SiteCard({ locale: "en" })).join(" ")).toContain(
      "Incident reports on AI"
    );
    expect(texts(SiteCard({ locale: "es" })).join(" ")).toContain(
      "Incidentes de IA"
    );
    expect(texts(SiteCard({ locale: "xx" })).join(" ")).toContain(
      "Incident reports on AI"
    );
  });
});
