// ABOUTME: Unit tests for VerdictStamp: text, deterministic rotation range, the single shared SVG filter.
// ABOUTME: The CSS file is read to pin the filter id the stamp references and the mono/double-border spec.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import VerdictStamp, {
  StampFilter,
  STAMP_FILTER_ID,
  stampRotation,
} from "@/components/VerdictStamp";

describe("VerdictStamp", () => {
  it("renders the text", () => {
    render(<VerdictStamp text="HELD AT THE DOOR" index={0} />);
    expect(screen.getByText("HELD AT THE DOOR")).toBeInTheDocument();
  });

  it("renders nothing for empty text", () => {
    const { container } = render(<VerdictStamp text="" index={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("tilts deterministically within -3deg..+2deg and varies by index", () => {
    const rots = Array.from({ length: 12 }, (_, i) => stampRotation(i));
    expect(rots.every((r) => r >= -3 && r <= 2)).toBe(true);
    expect(new Set(rots).size).toBeGreaterThan(2);
    expect(stampRotation(1)).toBe(stampRotation(1));
    render(<VerdictStamp text="X" index={1} />);
    expect(screen.getByText("X").style.getPropertyValue("--rot")).toBe(
      `${stampRotation(1)}deg`
    );
  });

  it("StampFilter defines exactly one filter with the id the stylesheet references", () => {
    const { container } = render(<StampFilter />);
    const filters = container.querySelectorAll("filter");
    expect(filters).toHaveLength(1);
    expect(filters[0].id).toBe(STAMP_FILTER_ID);
    const css = readFileSync("components/VerdictStamp.module.css", "utf8");
    expect(css).toContain(`url(#${STAMP_FILTER_ID})`);
    expect(css).toContain("5px double var(--terra)");
    expect(css).toContain("letter-spacing: 0.09em");
    expect(css).toMatch(/white-space:\s*nowrap/);
  });
});
