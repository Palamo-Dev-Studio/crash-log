// ABOUTME: Unit tests for Footer component.
// ABOUTME: Validates footer renders copyright text and structure.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders a footer element", () => {
    render(<Footer />);
    expect(document.querySelector("footer")).toBeInTheDocument();
  });

  it("renders copyright year 2026", () => {
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders The Crash Log text", () => {
    render(<Footer />);
    expect(screen.getByText(/The Crash Log/)).toBeInTheDocument();
  });
});
