// ABOUTME: Unit tests for the ThankYouContent server component.
// ABOUTME: Validates bilingual labels, heading structure, CTA links, and BeehiivRecommendations slot.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ThankYouContent from "@/components/ThankYouContent";

vi.mock("@/components/BeehiivRecommendations", () => ({
  default: ({ locale }) => (
    <div data-testid="beehiiv-recommendations" data-locale={locale} />
  ),
}));

describe("ThankYouContent", () => {
  describe("English (default)", () => {
    it("renders the confirmation badge", () => {
      render(<ThankYouContent locale="en" />);
      expect(screen.getByText("SUBSCRIPTION CONFIRMED")).toBeInTheDocument();
    });

    it("renders the heading", () => {
      render(<ThankYouContent locale="en" />);
      expect(
        screen.getByRole("heading", { level: 1, name: "You\u2019re In." })
      ).toBeInTheDocument();
    });

    it("renders the description", () => {
      render(<ThankYouContent locale="en" />);
      expect(
        screen.getByText(/You just subscribed to The Crash Log/)
      ).toBeInTheDocument();
    });

    it("renders CTA link pointing to /en", () => {
      render(<ThankYouContent locale="en" />);
      const link = screen.getByRole("link", { name: "Read the Latest Issue" });
      expect(link).toHaveAttribute("href", "/en");
    });
  });

  describe("Spanish", () => {
    it("renders the Spanish badge", () => {
      render(<ThankYouContent locale="es" />);
      expect(
        screen.getByText("SUSCRIPCI\u00D3N CONFIRMADA")
      ).toBeInTheDocument();
    });

    it("renders the Spanish heading", () => {
      render(<ThankYouContent locale="es" />);
      expect(
        screen.getByRole("heading", { level: 1, name: "\u00A1Listo!" })
      ).toBeInTheDocument();
    });

    it("renders the Spanish description", () => {
      render(<ThankYouContent locale="es" />);
      expect(
        screen.getByText(/Te suscribiste a The Crash Log/)
      ).toBeInTheDocument();
    });

    it("renders CTA link pointing to /es", () => {
      render(<ThankYouContent locale="es" />);
      const link = screen.getByRole("link", {
        name: "Leer la \u00DAltima Edici\u00F3n",
      });
      expect(link).toHaveAttribute("href", "/es");
    });
  });

  it("defaults to English when locale is not provided", () => {
    render(<ThankYouContent />);
    expect(screen.getByText("SUBSCRIPTION CONFIRMED")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/en");
  });

  it("has a single h1 element", () => {
    render(<ThankYouContent locale="en" />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
  });

  it("renders BeehiivRecommendations slot", () => {
    render(<ThankYouContent locale="en" />);
    expect(screen.getByTestId("beehiiv-recommendations")).toBeInTheDocument();
  });

  it("passes locale to BeehiivRecommendations", () => {
    render(<ThankYouContent locale="es" />);
    expect(screen.getByTestId("beehiiv-recommendations")).toHaveAttribute(
      "data-locale",
      "es"
    );
  });
});
