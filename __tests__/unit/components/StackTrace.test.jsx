// ABOUTME: Unit tests for StackTrace client component.
// ABOUTME: Validates null guard, toggle behavior, aria attributes, and item rendering.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    render(<StackTrace items={items} />);
    expect(screen.getByText("Stack Trace")).toBeInTheDocument();
  });

  it("starts expanded (aria-expanded=true)", () => {
    render(<StackTrace items={items} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses on click (aria-expanded=false)", async () => {
    const user = userEvent.setup();
    render(<StackTrace items={items} />);
    const button = screen.getByRole("button");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("hides items when collapsed", async () => {
    const user = userEvent.setup();
    render(<StackTrace items={items} />);
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText("TechCrunch")).not.toBeInTheDocument();
  });

  it("re-expands on second click", async () => {
    const user = userEvent.setup();
    render(<StackTrace items={items} />);
    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("TechCrunch")).toBeInTheDocument();
  });
});
