// ABOUTME: Unit tests for lib/articleBody.js: heading slugs, unique anchor ids, TOC order, figure numbering.
// ABOUTME: Fixtures use duplicate and near-duplicate H2 text so a missing de-dup or a wrong slug rule fails.

import { describe, it, expect } from "vitest";
import { prepareArticleBody, slugifyHeading } from "@/lib/articleBody";

const h = (style, text, extra = {}) => ({
  _type: "block",
  style,
  children: [{ _type: "span", text }],
  ...extra,
});

describe("slugifyHeading", () => {
  it("lowercases, hyphenates and strips accents", () => {
    expect(slugifyHeading("What you need")).toBe("what-you-need");
    expect(slugifyHeading("¿Qué necesitas?")).toBe("que-necesitas");
    expect(slugifyHeading("Configuración")).toBe("configuracion");
    expect(slugifyHeading("Público objetivo")).toBe("publico-objetivo");
  });

  it("falls back for text with no letters or digits", () => {
    expect(slugifyHeading("???")).toBe("section");
    expect(slugifyHeading("")).toBe("section");
  });
});

describe("prepareArticleBody", () => {
  it("never hands out an id the page layout already uses", () => {
    const body = [h("h2", "Main content"), h("h2", "Main content")];
    const { toc } = prepareArticleBody(body, "en");
    expect(toc.map((t) => t.id)).toEqual(["main-content-2", "main-content-3"]);
  });

  it("lists every H2 in order, text and id, ignoring H3 and normal blocks", () => {
    const body = [
      h("normal", "intro"),
      h("h2", "What you need"),
      h("h3", "A sub-heading"),
      h("h2", "The workflow"),
    ];
    const { toc } = prepareArticleBody(body, "en");
    expect(toc).toEqual([
      { id: "what-you-need", text: "What you need" },
      { id: "the-workflow", text: "The workflow" },
    ]);
  });

  it("gives repeated and colliding headings unique ids", () => {
    const body = [
      h("h2", "Setup"),
      h("h2", "Setup"),
      h("h2", "Setup!"),
      h("h2", "Setup 2"),
    ];
    const { toc, blocks } = prepareArticleBody(body, "en");
    const ids = toc.map((e) => e.id);
    expect(ids).toEqual(["setup", "setup-2", "setup-3", "setup-2-2"]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(blocks.map((b) => b._tocId)).toEqual(ids);
  });

  it("is deterministic: the same body always yields the same ids", () => {
    const body = [h("h2", "Same"), h("h2", "Same")];
    expect(prepareArticleBody(body, "en").toc).toEqual(
      prepareArticleBody(body, "en").toc
    );
  });

  it("skips empty H2s and leaves them without an id", () => {
    const { toc, blocks } = prepareArticleBody(
      [h("h2", "   "), h("h2", "Real")],
      "en"
    );
    expect(toc).toEqual([{ id: "real", text: "Real" }]);
    expect(blocks[0]._tocId).toBeUndefined();
  });

  it("adds a replyAsk block to the TOC with its title, or the locale default", () => {
    const body = [
      h("h2", "One"),
      { _type: "replyAsk", title: "Send me yours" },
      { _type: "replyAsk" },
    ];
    expect(prepareArticleBody(body, "en").toc.map((e) => e.text)).toEqual([
      "One",
      "Send me yours",
      "Your turn",
    ]);
    expect(prepareArticleBody(body, "es").toc.at(-1).text).toBe("Tu turno");
  });

  it("numbers exhibits in document order", () => {
    const { blocks } = prepareArticleBody(
      [{ _type: "exhibit" }, h("normal", "x"), { _type: "exhibit" }],
      "en"
    );
    expect([blocks[0]._figNo, blocks[2]._figNo]).toEqual([1, 2]);
  });

  it("does not mutate the input and tolerates a missing body", () => {
    const body = [h("h2", "A")];
    prepareArticleBody(body, "en");
    expect(body[0]._tocId).toBeUndefined();
    expect(prepareArticleBody(null, "en")).toEqual({ blocks: [], toc: [] });
  });
});
