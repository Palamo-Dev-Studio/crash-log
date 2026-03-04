// ABOUTME: Unit tests for LanguageToggle client component.
// ABOUTME: Validates EN/ES rendering, active class, and aria labels.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/archive",
  useRouter: () => ({ push: mockPush }),
}));

import LanguageToggle from "@/components/LanguageToggle";

describe("LanguageToggle", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("renders EN and ES text", () => {
    render(<LanguageToggle locale="en" />);
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("ES")).toBeInTheDocument();
  });

  it("renders / separator", () => {
    render(<LanguageToggle locale="en" />);
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("applies active class to EN when locale is en", () => {
    render(<LanguageToggle locale="en" />);
    const en = screen.getByText("EN");
    expect(en.className).toContain("active");
  });

  it("applies active class to ES when locale is es", () => {
    render(<LanguageToggle locale="es" />);
    const es = screen.getByText("ES");
    expect(es.className).toContain("active");
  });

  it("applies inactive class to ES when locale is en", () => {
    render(<LanguageToggle locale="en" />);
    const es = screen.getByText("ES");
    expect(es.className).toContain("inactive");
  });

  it("has correct aria-label for en locale", () => {
    render(<LanguageToggle locale="en" />);
    expect(screen.getByLabelText("Cambiar a español")).toBeInTheDocument();
  });

  it("has correct aria-label for es locale", () => {
    render(<LanguageToggle locale="es" />);
    expect(screen.getByLabelText("Switch to English")).toBeInTheDocument();
  });
});
