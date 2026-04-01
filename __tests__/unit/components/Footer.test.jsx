// ABOUTME: Unit tests for Footer component.
// ABOUTME: Validates footer renders copyright text and structure.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders a footer element", () => {
    render(<Footer locale="en" />);
    expect(document.querySelector("footer")).toBeInTheDocument();
  });

  it("renders copyright year 2026", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders The Crash Log text", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText(/The Crash Log/)).toBeInTheDocument();
  });

  it("renders English credit text", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText(/Built with Claude Code/)).toBeInTheDocument();
    expect(screen.getByText(/Edited by Humans/)).toBeInTheDocument();
  });

  it("renders Spanish credit text for es locale", () => {
    render(<Footer locale="es" />);
    expect(screen.getByText(/Hecho con Claude Code/)).toBeInTheDocument();
    expect(screen.getByText(/Editado por Humanos/)).toBeInTheDocument();
  });

  it("renders X link pointing to @crashLogNews", () => {
    render(<Footer locale="en" />);
    const link = screen.getByText("X");
    expect(link).toHaveAttribute("href", "https://x.com/crashLogNews");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders Instagram link pointing to @crashlognews", () => {
    render(<Footer locale="en" />);
    const link = screen.getByText("Instagram");
    expect(link).toHaveAttribute(
      "href",
      "https://www.instagram.com/crashlognews"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
