// ABOUTME: Unit tests for the 404 not-found page component.
// ABOUTME: Validates locale-aware text rendering and navigation links.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "@/app/(site)/[locale]/not-found";

describe("NotFound", () => {
  it("renders 404 heading", () => {
    render(<NotFound params={{ locale: "en" }} />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders English text by default", () => {
    render(<NotFound params={{ locale: "en" }} />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText("Go to latest issue")).toBeInTheDocument();
    expect(screen.getByText("Browse the archive")).toBeInTheDocument();
  });

  it("renders Spanish text for es locale", () => {
    render(<NotFound params={{ locale: "es" }} />);
    expect(screen.getByText("Página no encontrada")).toBeInTheDocument();
    expect(screen.getByText("Ir a la última edición")).toBeInTheDocument();
    expect(screen.getByText("Explorar el archivo")).toBeInTheDocument();
  });

  it("renders h1 heading", () => {
    render(<NotFound params={{ locale: "en" }} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Page not found");
  });

  it("renders navigation links with correct paths", () => {
    render(<NotFound params={{ locale: "en" }} />);
    const homeLink = screen.getByText("Go to latest issue");
    const archiveLink = screen.getByText("Browse the archive");
    expect(homeLink.closest("a")).toHaveAttribute("href", "/en");
    expect(archiveLink.closest("a")).toHaveAttribute("href", "/en/archive");
  });

  it("falls back to English when no params provided", () => {
    render(<NotFound />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });
});
