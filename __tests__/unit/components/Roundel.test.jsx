// ABOUTME: Unit tests for the Roundel component's simple and stamp variants.
// ABOUTME: Covers the size threshold, accessible name, symbol colour and per-instance filter ids.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Roundel from "@/components/Roundel";

describe("Roundel", () => {
  describe.each([16, 32])("simple variant at %ipx", (size) => {
    it("has no ring legend text", () => {
      const { container } = render(<Roundel size={size} />);
      expect(container.textContent).not.toContain("CRASH LOG");
      expect(container.textContent).not.toContain("FILED");
      expect(container.querySelector("text")).toBeNull();
    });

    it("has no ink filter", () => {
      const { container } = render(<Roundel size={size} />);
      expect(container.querySelector("filter")).toBeNull();
    });

    it("draws the symbol in terra-ink", () => {
      const { container } = render(<Roundel size={size} />);
      expect(container.querySelector("path").getAttribute("fill")).toBe(
        "var(--terra-ink)"
      );
    });

    it("renders at the requested size", () => {
      const { container } = render(<Roundel size={size} />);
      const svg = container.querySelector("svg");
      expect(svg.getAttribute("width")).toBe(String(size));
      expect(svg.getAttribute("height")).toBe(String(size));
    });
  });

  describe.each([48, 180])("stamp variant at %ipx", (size) => {
    it("contains the CRASH LOG and FILED ring legend", () => {
      const { container } = render(<Roundel size={size} />);
      expect(container.textContent).toContain("CRASH LOG");
      expect(container.textContent).toContain("FILED");
    });

    it("has the ink texture filter and applies it", () => {
      const { container } = render(<Roundel size={size} />);
      const filter = container.querySelector("filter");
      expect(filter).not.toBeNull();
      expect(
        container.querySelector(`[filter="url(#${filter.id})"]`)
      ).not.toBeNull();
    });

    it("draws the symbol in terra", () => {
      const { container } = render(<Roundel size={size} />);
      const symbol = [...container.querySelectorAll("path")].find(
        (p) => p.getAttribute("fill") === "var(--terra)"
      );
      expect(symbol).toBeDefined();
    });

    it("has a thin inner ring in addition to the outer ring", () => {
      const { container } = render(<Roundel size={size} />);
      expect(container.querySelectorAll("circle")).toHaveLength(2);
    });
  });

  it("switches from simple to stamp at 48px, not before", () => {
    const small = render(<Roundel size={47} />);
    expect(small.container.querySelector("text")).toBeNull();
    small.unmount();
    const large = render(<Roundel size={48} />);
    expect(large.container.querySelector("text")).not.toBeNull();
  });

  it.each([16, 32, 48, 180])("is named 'Crash Log' at %ipx", (size) => {
    render(<Roundel size={size} />);
    expect(screen.getByRole("img", { name: "Crash Log" })).toBeInTheDocument();
  });

  it("gives two stamp instances distinct filter and arc ids", () => {
    const { container } = render(
      <>
        <Roundel size={72} />
        <Roundel size={72} />
      </>
    );
    const filterIds = [...container.querySelectorAll("filter")].map(
      (f) => f.id
    );
    const arcIds = [...container.querySelectorAll("defs path")].map(
      (p) => p.id
    );
    expect(filterIds).toHaveLength(2);
    expect(new Set(filterIds).size).toBe(2);
    expect(new Set(arcIds).size).toBe(2);
    filterIds.forEach((id) => expect(id).not.toMatch(/:/));
  });

  it("points each stamp's textPath at its own arc", () => {
    const { container } = render(
      <>
        <Roundel size={72} />
        <Roundel size={72} />
      </>
    );
    container.querySelectorAll("svg").forEach((svg) => {
      const arc = svg.querySelector("defs path").id;
      expect(svg.querySelector("textPath").getAttribute("href")).toBe(
        `#${arc}`
      );
    });
  });

  it("passes className through to the svg", () => {
    const { container } = render(<Roundel size={72} className="mark-lg" />);
    expect(container.querySelector("svg")).toHaveClass("mark-lg");
  });
});
