// ABOUTME: Unit tests for DonateCTA component.
// ABOUTME: Validates donate card renders copy text and button.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DonateCTA from "@/components/DonateCTA";

describe("DonateCTA", () => {
  it("renders the Feed the Bots button", () => {
    render(<DonateCTA />);
    expect(screen.getByText("Feed the Bots")).toBeInTheDocument();
  });

  it("renders as a section with aria-label", () => {
    render(<DonateCTA />);
    expect(screen.getByLabelText("Donate")).toBeInTheDocument();
  });

  it("renders copy text about Nico", () => {
    render(<DonateCTA />);
    expect(screen.getByText(/Nico and the AI team/)).toBeInTheDocument();
  });
});
