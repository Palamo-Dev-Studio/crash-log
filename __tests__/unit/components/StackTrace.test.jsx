// ABOUTME: Unit tests for StackTrace component.
// ABOUTME: Validates null guard, label rendering, and item rendering.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StackTrace from "@/components/StackTrace";

describe("StackTrace", () => {
  const items = [
    { title: "TechCrunch", description: "AI hiring is up 40%" },
    { title: "Wired", description: "Robots replace warehouse workers" },
  ];

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

  it("renders items when provided", () => {
    render(<StackTrace items={items} />);
    expect(screen.getByText("TechCrunch")).toBeInTheDocument();
    expect(screen.getByText("AI hiring is up 40%")).toBeInTheDocument();
  });

  it("renders Stack Trace label", () => {
    render(<StackTrace locale="en" items={items} />);
    expect(screen.getByText("Stack Trace")).toBeInTheDocument();
  });

  it("renders Stack Trace label for es locale", () => {
    render(<StackTrace locale="es" items={items} />);
    expect(screen.getByText("Stack Trace")).toBeInTheDocument();
  });

  it("always shows all items", () => {
    render(<StackTrace items={items} />);
    expect(screen.getByText("TechCrunch")).toBeInTheDocument();
    expect(screen.getByText("Wired")).toBeInTheDocument();
    expect(
      screen.getByText("Robots replace warehouse workers")
    ).toBeInTheDocument();
  });

  it("does not render a toggle button", () => {
    render(<StackTrace items={items} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders item title as link when url is provided", () => {
    const itemsWithUrl = [
      {
        title: "TechCrunch",
        description: "AI hiring is up 40%",
        url: "https://techcrunch.com/article",
      },
    ];
    render(<StackTrace items={itemsWithUrl} />);
    const link = screen.getByRole("link", { name: "TechCrunch" });
    expect(link).toHaveAttribute("href", "https://techcrunch.com/article");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders item title as plain text when url is not provided", () => {
    render(<StackTrace items={items} />);
    expect(screen.getByText("TechCrunch")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "TechCrunch" })
    ).not.toBeInTheDocument();
  });
});
