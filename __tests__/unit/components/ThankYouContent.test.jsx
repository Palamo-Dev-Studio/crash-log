// ABOUTME: Unit tests for the ThankYouContent server component.
// ABOUTME: Validates bilingual labels, heading structure, CTA links, social buttons, and BeehiivRecommendations slot.

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

    it("renders the description with gratitude", () => {
      render(<ThankYouContent locale="en" />);
      expect(
        screen.getByText(/Thanks for subscribing to The Crash Log/)
      ).toBeInTheDocument();
    });

    it("renders CTA link pointing to /en", () => {
      render(<ThankYouContent locale="en" />);
      const link = screen.getByRole("link", { name: "Read the Latest Issue" });
      expect(link).toHaveAttribute("href", "/en");
    });

    it("renders the follow label", () => {
      render(<ThankYouContent locale="en" />);
      expect(screen.getByText("Follow the Fallout")).toBeInTheDocument();
    });

    it("renders X social button linking to the correct URL", () => {
      render(<ThankYouContent locale="en" />);
      const xLink = screen.getByRole("link", { name: "X" });
      expect(xLink).toHaveAttribute("href", "https://x.com/crashLogNews");
      expect(xLink).toHaveAttribute("target", "_blank");
      expect(xLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders Instagram social button linking to the correct URL", () => {
      render(<ThankYouContent locale="en" />);
      const igLink = screen.getByRole("link", { name: "Instagram" });
      expect(igLink).toHaveAttribute(
        "href",
        "https://instagram.com/crashlognews"
      );
      expect(igLink).toHaveAttribute("target", "_blank");
      expect(igLink).toHaveAttribute("rel", "noopener noreferrer");
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

    it("renders the Spanish description with gratitude", () => {
      render(<ThankYouContent locale="es" />);
      expect(
        screen.getByText(/Gracias por suscribirte a The Crash Log/)
      ).toBeInTheDocument();
    });

    it("renders CTA link pointing to /es", () => {
      render(<ThankYouContent locale="es" />);
      const link = screen.getByRole("link", {
        name: "Leer la \u00DAltima Edici\u00F3n",
      });
      expect(link).toHaveAttribute("href", "/es");
    });

    it("renders the Spanish follow label", () => {
      render(<ThankYouContent locale="es" />);
      expect(screen.getByText("Sigue el Desastre")).toBeInTheDocument();
    });
  });

  it("defaults to English when locale is not provided", () => {
    render(<ThankYouContent />);
    expect(screen.getByText("SUBSCRIPTION CONFIRMED")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Read the Latest Issue" })
    ).toHaveAttribute("href", "/en");
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
