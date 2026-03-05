// ABOUTME: Unit tests for DonateCTA component.
// ABOUTME: Validates donate card renders copy text and button.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DonateCTA from "@/components/DonateCTA";

describe("DonateCTA", () => {
  it("renders the Feed the Bots button", () => {
    render(<DonateCTA locale="en" />);
    expect(screen.getByText("Feed the Bots")).toBeInTheDocument();
  });

  it("renders as a section with aria-label", () => {
    render(<DonateCTA locale="en" />);
    expect(screen.getByLabelText("Donate")).toBeInTheDocument();
  });

  it("renders copy text about Nico", () => {
    render(<DonateCTA locale="en" />);
    expect(screen.getByText(/Nico and the AI team/)).toBeInTheDocument();
  });

  it("renders Spanish button text for es locale", () => {
    render(<DonateCTA locale="es" />);
    expect(screen.getByText("Alimenta a los Bots")).toBeInTheDocument();
  });

  it("renders Spanish aria-label for es locale", () => {
    render(<DonateCTA locale="es" />);
    expect(screen.getByLabelText("Donar")).toBeInTheDocument();
  });

  it("renders Spanish copy for es locale", () => {
    render(<DonateCTA locale="es" />);
    expect(screen.getByText(/Nico y el equipo de IA/)).toBeInTheDocument();
  });
});
