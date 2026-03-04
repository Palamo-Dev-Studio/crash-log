// ABOUTME: Unit tests for FallbackBanner component.
// ABOUTME: Validates Spanish fallback warning renders correctly.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FallbackBanner from "@/components/FallbackBanner";

describe("FallbackBanner", () => {
  it("renders the Spanish warning text", () => {
    render(<FallbackBanner />);
    expect(
      screen.getByText(/Versión en español próximamente/)
    ).toBeInTheDocument();
  });

  it("renders warning icon with aria-hidden", () => {
    render(<FallbackBanner />);
    const icon = document.querySelector("[aria-hidden='true']");
    expect(icon).toBeInTheDocument();
  });
});
