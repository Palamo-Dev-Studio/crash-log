// ABOUTME: Unit tests for the OG template helpers: title clamping, size tiers and balanced line wrapping.
// ABOUTME: Also pins the roundel to satori-safe SVG (no <text>, no filter) and the elements the cards must contain.

import { describe, it, expect, vi } from "vitest";
import { isValidElement } from "react";

vi.mock("next/og", () => ({ ImageResponse: class {} }));
vi.mock("@/lib/ogFonts", () => ({ loadOgFonts: vi.fn() }));

import {
  balanceLines,
  fitTitle,
  TITLE_BOX,
  TITLE_LINE_HEIGHT,
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

  it("backs up to the last space when the cut lands mid-word", () => {
    // Index 89 falls inside the second word, so the cut must retreat to the space at 70.
    const out = clampTitle(`${"x".repeat(70)} ${"y".repeat(50)}`);
    expect(out).toBe(`${"x".repeat(70)}…`);
  });

  it("hard-cuts mid-word when the last space is too early to keep", () => {
    // The only space sits at index 3, well before 60% of the limit, so the cut
    // must fall mid-word rather than back at that space.
    const out = clampTitle(`abc ${"x".repeat(200)}`);
    expect(out).toBe(`abc ${"x".repeat(MAX_TITLE_LENGTH - 5)}…`);
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

  it("hard-breaks a word too long for any line and never drops characters", () => {
    const lines = balanceLines(`ab ${"c".repeat(100)} de`, 104);
    expect(lines.join("").replace(/ /g, "")).toBe(`ab${"c".repeat(100)}de`);
    lines.forEach((l) => expect(l.length).toBeLessThanOrEqual(25));
    expect(lines.length).toBeLessThan(8);
  });

  it("returns no lines for an empty title", () => {
    expect(balanceLines("   ", 88)).toEqual([]);
  });

  it("terminates on a 200-word input", () => {
    const title = Array.from({ length: 200 }, (_, i) => `w${i}`).join(" ");
    expect(balanceLines(title, 62).join(" ")).toBe(title);
  });
});

describe("fitTitle", () => {
  const widthOf = (line, size) => line.length * size * 0.41;

  it.each([
    ["a 40-char single word", "x".repeat(40), 104],
    ["a no-space 120-char title", "y".repeat(120), 62],
    ["a long word among short ones", `Why ${"z".repeat(50)} matters`, 88],
  ])("keeps %s inside the title box", (_label, title, start) => {
    const { lines, fontSize } = fitTitle(title, start);
    expect(lines.join("")).toBe(title.replace(/\s+/g, ""));
    expect(lines.length * fontSize * TITLE_LINE_HEIGHT).toBeLessThanOrEqual(
      TITLE_BOX.height
    );
    lines.forEach((l) =>
      expect(widthOf(l, fontSize)).toBeLessThanOrEqual(TITLE_BOX.width)
    );
  });

  it("shrinks a 40-char single word to one line instead of hard-breaking it at 104px", () => {
    const word = "x".repeat(40);
    const { lines, fontSize } = fitTitle(word, 104);
    expect(lines).toEqual([word]);
    expect(fontSize).toBeLessThan(104);
    // Control: at the starting size the word does not fit one line, so only shrinking keeps it whole.
    expect(balanceLines(word, 104, TITLE_BOX.width).length).toBeGreaterThan(1);
  });

  it("does not wrap an over-long word word-per-line and leaves a normal title's size alone", () => {
    expect(balanceLines(`a ${"q".repeat(60)} b c d`, 104).length).toBeLessThan(
      5
    );
    const normal = fitTitle("Check the Backups", 104);
    expect(normal.fontSize).toBe(104);
    expect(normal.lines).toEqual(["Check the Backups"]);
  });

  it("TitleCard lays a no-space title out as box-sized lines", () => {
    const lineEls = collect(TitleCard({ title: "w".repeat(120) })).filter(
      (n) => typeof n === "object" && n.props.style?.lineHeight === 1.06
    );
    expect(lineEls.length).toBeGreaterThan(0);
    const { fontSize } = lineEls[0].props.style;
    expect(lineEls.length * fontSize * TITLE_LINE_HEIGHT).toBeLessThanOrEqual(
      TITLE_BOX.height
    );
    lineEls.forEach((el) =>
      expect(el.props.children.length * fontSize * 0.41).toBeLessThanOrEqual(
        TITLE_BOX.width
      )
    );
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
    // The footer also reads "The Crash Log", so pin the serif wordmark element itself.
    const wordmark = collect(SiteCard({ locale: "en" })).find(
      (n) =>
        typeof n === "object" &&
        n.props.style?.fontFamily === "Instrument Serif"
    );
    expect(wordmark.props.children).toBe("The Crash Log");
    expect(wordmark.props.style.fontSize).toBeLessThanOrEqual(128);
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
