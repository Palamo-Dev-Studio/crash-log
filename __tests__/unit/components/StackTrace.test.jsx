// ABOUTME: Unit tests for StackTrace component.
// ABOUTME: Validates null guard, label rendering, rich text body, and source link rendering.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: function () {
      return this;
    },
    height: function () {
      return this;
    },
    format: function () {
      return this;
    },
    url: () => "https://cdn.sanity.io/test.webp",
  }),
}));

import StackTrace from "@/components/StackTrace";

const makeBlock = (text) => ({
  _type: "block",
  _key: `k-${text.slice(0, 5)}`,
  children: [{ _type: "span", text }],
});

const items = [
  {
    body: [makeBlock("AI hiring is up 40%")],
    sources: [{ outlet: "TechCrunch", url: "https://techcrunch.com/article" }],
  },
  {
    body: [makeBlock("Robots replace warehouse workers")],
    sources: [
      { outlet: "Wired", url: "https://wired.com/article" },
      { outlet: "Reuters", url: "https://reuters.com/article" },
    ],
  },
];

describe("StackTrace", () => {
  it("returns null for empty items array", () => {
    const { container } = render(<StackTrace items={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when items is null", () => {
    const { container } = render(<StackTrace items={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when items is undefined", () => {
    const { container } = render(<StackTrace />);
    expect(container.innerHTML).toBe("");
  });

  it("renders body text when provided", () => {
    render(<StackTrace items={items} />);
    expect(screen.getByText("AI hiring is up 40%")).toBeInTheDocument();
    expect(
      screen.getByText("Robots replace warehouse workers")
    ).toBeInTheDocument();
  });

  it("renders Stack Trace label", () => {
    render(<StackTrace locale="en" items={items} />);
    expect(screen.getByText("Stack Trace")).toBeInTheDocument();
  });

  it("renders Stack Trace label for es locale", () => {
    render(<StackTrace locale="es" items={items} />);
    expect(screen.getByText("Stack Trace")).toBeInTheDocument();
  });

  it("renders source links underneath body text", () => {
    render(<StackTrace locale="en" items={items} />);
    const link = screen.getByRole("link", { name: "TechCrunch" });
    expect(link).toHaveAttribute("href", "https://techcrunch.com/article");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders multiple source links for a single item", () => {
    render(<StackTrace locale="en" items={items} />);
    expect(screen.getByRole("link", { name: "Wired" })).toHaveAttribute(
      "href",
      "https://wired.com/article"
    );
    expect(screen.getByRole("link", { name: "Reuters" })).toHaveAttribute(
      "href",
      "https://reuters.com/article"
    );
  });

  it("renders Source label in English", () => {
    render(<StackTrace locale="en" items={items} />);
    expect(screen.getAllByText(/Source:/).length).toBeGreaterThan(0);
  });

  it("renders Fuente label in Spanish", () => {
    render(<StackTrace locale="es" items={items} />);
    expect(screen.getAllByText(/Fuente:/).length).toBeGreaterThan(0);
  });

  it("renders items without sources gracefully", () => {
    const itemsNoSources = [
      { body: [makeBlock("No sources here")], sources: [] },
    ];
    render(<StackTrace locale="en" items={itemsNoSources} />);
    expect(screen.getByText("No sources here")).toBeInTheDocument();
    expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
  });

  it("falls back to description prop for plain text items", () => {
    const legacyItems = [{ description: "Legacy plain text item" }];
    render(<StackTrace locale="en" items={legacyItems} />);
    expect(screen.getByText("Legacy plain text item")).toBeInTheDocument();
  });

  it("does not render a toggle button", () => {
    render(<StackTrace items={items} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
