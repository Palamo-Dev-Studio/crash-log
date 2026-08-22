// ABOUTME: Unit tests for the highlightMatches helper.
// ABOUTME: Validates <mark> wrapping for matched substrings, case-insensitivity, and no-query passthrough.

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { highlightMatches } from "@/lib/highlightMatches";

function renderNodes(nodes) {
  return render(<div>{nodes}</div>);
}

describe("highlightMatches", () => {
  it("returns null for empty text", () => {
    expect(highlightMatches("", "x")).toBe(null);
  });

  it("returns text unchanged when query is empty", () => {
    expect(highlightMatches("hello", "")).toBe("hello");
    expect(highlightMatches("hello", "   ")).toBe("hello");
  });

  it("wraps a matched token in <mark>", () => {
    const { container } = renderNodes(
      highlightMatches("Forty Minutes of Exposure", "minutes")
    );
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark.textContent).toBe("Minutes");
  });

  it("is case-insensitive", () => {
    const { container } = renderNodes(
      highlightMatches("Perplexity sued", "PERPLEXITY")
    );
    expect(container.querySelector("mark").textContent).toBe("Perplexity");
  });

  it("highlights multiple tokens", () => {
    const { container } = renderNodes(
      highlightMatches("Oracle and Perplexity", "oracle perplexity")
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe("Oracle");
    expect(marks[1].textContent).toBe("Perplexity");
  });

  it("escapes regex metacharacters in tokens", () => {
    const { container } = renderNodes(
      highlightMatches("Foo (bar) baz", "(bar)")
    );
    expect(container.querySelector("mark").textContent).toBe("(bar)");
  });
});

describe("highlightMatches diacritic folding", () => {
  it("highlights an accented title when the query is unaccented", () => {
    const { container } = renderNodes(
      highlightMatches("Una Crítica del Modelo", "critica")
    );
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    // The rendered mark preserves the ORIGINAL accented characters — folding is only
    // for matching, never for display.
    expect(mark.textContent).toBe("Crítica");
  });

  it("highlights an unaccented title when the query is accented (reverse direction)", () => {
    const { container } = renderNodes(
      highlightMatches("Una critica del modelo", "crítica")
    );
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark.textContent).toBe("critica");
  });

  it("matches año/ano in both directions", () => {
    const foldedQuery = renderNodes(highlightMatches("El año pasado", "ano"));
    expect(foldedQuery.container.querySelector("mark").textContent).toBe("año");

    const foldedText = renderNodes(highlightMatches("El ano pasado", "año"));
    expect(foldedText.container.querySelector("mark").textContent).toBe("ano");
  });

  it("highlights multiple accented tokens without corrupting surrounding text", () => {
    const { container } = renderNodes(
      highlightMatches("Opinión y Crítica del año", "opinion critica ano")
    );
    const marks = Array.from(container.querySelectorAll("mark")).map(
      (m) => m.textContent
    );
    expect(marks).toEqual(["Opinión", "Crítica", "año"]);
    // The un-marked connective text must survive untouched.
    expect(container.textContent).toBe("Opinión y Crítica del año");
  });

  it("English-only text is unaffected by the fold (control)", () => {
    const { container } = renderNodes(
      highlightMatches("Perplexity sued by publishers", "perplexity")
    );
    expect(container.querySelector("mark").textContent).toBe("Perplexity");
  });
});

describe("highlightMatches astral character safety (UTF-16 surrogate pairs)", () => {
  // Built from code points rather than literal glyphs in source, so the exact
  // codepoint under test is unambiguous and immune to any editor/tool transcoding of
  // astral characters. U+1F680 ROCKET and U+1F525 FIRE are each a single Unicode
  // code point that occupies TWO UTF-16 code units -- the exact shape that desyncs a
  // code-point-indexed fold map from `pattern.exec()`'s UTF-16-unit offsets.
  const rocket = String.fromCodePoint(0x1f680);
  const fire = String.fromCodePoint(0x1f525);

  it("does not drop or corrupt characters after a leading astral character (regression)", () => {
    const text = `${rocket}${fire} Crítica del año`;
    const { container } = renderNodes(highlightMatches(text, "critica ano"));

    // The full original text must render intact, including the final character --
    // the bug this guards against silently dropped it.
    expect(container.textContent).toBe(text);

    const marks = Array.from(container.querySelectorAll("mark")).map(
      (m) => m.textContent
    );
    expect(marks).toEqual(["Crítica", "año"]);
  });

  it("highlights correctly with a single leading astral character", () => {
    const text = `${rocket} Perplexity sued`;
    const { container } = renderNodes(highlightMatches(text, "perplexity"));
    expect(container.textContent).toBe(text);
    expect(container.querySelector("mark").textContent).toBe("Perplexity");
  });

  it("the same text without a leading astral character is unaffected (control)", () => {
    const text = "Crítica del año";
    const { container } = renderNodes(highlightMatches(text, "critica ano"));
    expect(container.textContent).toBe(text);
  });
});

describe("highlightMatches fold-cluster duplicate guard", () => {
  it("does not duplicate a character when two tokens each match disjoint parts of its multi-character fold", () => {
    // U+D55C (Hangul syllable "han") NFD-decomposes into three jamo -- initial
    // U+1112, vowel U+1161, final U+11AB -- none of them a combining mark, so
    // normalize() keeps all three. Searching for the initial and final jamo as
    // separate tokens matches two disjoint parts of the SAME original character's
    // folded output; without the end<=cursor guard this re-slices and duplicates it.
    const han = String.fromCodePoint(0xd55c);
    const initial = String.fromCodePoint(0x1112);
    const finalJamo = String.fromCodePoint(0x11ab);

    const { container } = renderNodes(
      highlightMatches(han, `${initial} ${finalJamo}`)
    );
    expect(container.textContent).toBe(han);
  });
});
