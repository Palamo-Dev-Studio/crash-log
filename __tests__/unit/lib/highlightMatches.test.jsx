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
