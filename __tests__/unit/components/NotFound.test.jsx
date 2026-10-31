// ABOUTME: Unit tests for the branded 404 page and the locale catch-all that feeds it.
// ABOUTME: Validates the kicker, locale resolution (params or URL), nav links and that the catch-all calls notFound().

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { setMockPathname, resetMocks } from "../../mocks/next-navigation";

vi.mock("next/navigation", async () => ({
  ...(await import("../../mocks/next-navigation")),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import NotFound from "@/app/(site)/[locale]/not-found";
import CatchAll from "@/app/(site)/[locale]/[...rest]/page";
import { notFound } from "next/navigation";

describe("NotFound", () => {
  beforeEach(() => resetMocks());

  it("renders the mono FILE NOT FOUND kicker", () => {
    render(<NotFound params={{ locale: "en" }} />);
    expect(screen.getByText(/404 · File not found/)).toBeInTheDocument();
  });

  it("renders English text and links", () => {
    render(<NotFound params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "That page isn't in the file."
    );
    expect(screen.getByText("Latest").closest("a")).toHaveAttribute(
      "href",
      "/en"
    );
    expect(screen.getByText("Archive").closest("a")).toHaveAttribute(
      "href",
      "/en/archive"
    );
  });

  it("renders Spanish text for the es locale", () => {
    render(<NotFound params={{ locale: "es" }} />);
    expect(screen.getByText(/Archivo no encontrado/)).toBeInTheDocument();
    expect(screen.getByText("Lo último").closest("a")).toHaveAttribute(
      "href",
      "/es"
    );
    expect(screen.getByText("Archivo").closest("a")).toHaveAttribute(
      "href",
      "/es/archive"
    );
  });

  it("takes the locale from the URL when no params arrive (Next gives not-found none)", () => {
    setMockPathname("/es/nonexistent");
    render(<NotFound />);
    expect(screen.getByText("Archivo").closest("a")).toHaveAttribute(
      "href",
      "/es/archive"
    );
  });

  it("falls back to English for an unknown locale in the URL", () => {
    setMockPathname("/xx/nope");
    render(<NotFound />);
    expect(screen.getByText("Latest").closest("a")).toHaveAttribute(
      "href",
      "/en"
    );
  });
});

describe("catch-all route", () => {
  it("calls notFound() so the branded 404 renders", () => {
    expect(() => CatchAll()).toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
