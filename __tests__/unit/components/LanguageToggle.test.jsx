// ABOUTME: Unit tests for LanguageToggle client component.
// ABOUTME: Validates the EN | ES segments, aria-current, and path-preserving hrefs.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

let mockPathname = "/en/archive";
let mockSearch = "";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

import LanguageToggle, { pathForLocale } from "@/components/LanguageToggle";

describe("pathForLocale", () => {
  it("swaps the locale and keeps the rest of the path", () => {
    expect(pathForLocale("/en/issue/foo", "es")).toBe("/es/issue/foo");
  });

  it("handles the locale root", () => {
    expect(pathForLocale("/en", "es")).toBe("/es");
  });
});

describe("LanguageToggle", () => {
  beforeEach(() => {
    mockSearch = "";
  });

  it("renders EN and ES links in a labelled group", () => {
    mockPathname = "/en/archive";
    render(<LanguageToggle locale="en" />);
    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("ES")).toBeInTheDocument();
  });

  it("marks EN current and not ES when locale is en", () => {
    render(<LanguageToggle locale="en" />);
    expect(screen.getByText("EN")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("ES")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("EN").className).toContain("active");
    expect(screen.getByText("ES").className).not.toContain("active");
  });

  it("marks ES current when locale is es", () => {
    mockPathname = "/es/archive";
    render(<LanguageToggle locale="es" />);
    expect(screen.getByText("ES")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("EN")).not.toHaveAttribute("aria-current");
  });

  it("builds the other locale's href for the current path", () => {
    mockPathname = "/en/archive";
    render(<LanguageToggle locale="en" />);
    expect(screen.getByText("ES")).toHaveAttribute("href", "/es/archive");
  });

  it("builds the English href from a Spanish path", () => {
    mockPathname = "/es/issue/some-slug";
    render(<LanguageToggle locale="es" />);
    expect(screen.getByText("EN")).toHaveAttribute(
      "href",
      "/en/issue/some-slug"
    );
  });

  it("sets the locale cookie when a segment is clicked", () => {
    mockPathname = "/en/archive";
    render(<LanguageToggle locale="en" />);
    fireEvent.click(screen.getByText("ES"));
    expect(document.cookie).toContain("CRASH_LOG_LOCALE=es");
  });

  it("keeps the query string in the other locale's href", () => {
    mockPathname = "/en/archive";
    mockSearch = "q=x";
    render(<LanguageToggle locale="en" />);
    expect(screen.getByText("ES")).toHaveAttribute("href", "/es/archive?q=x");
  });

  it("keeps a multi-param query intact", () => {
    mockPathname = "/es/archive";
    mockSearch = "q=a%20b&tag=ai";
    render(<LanguageToggle locale="es" />);
    expect(screen.getByText("EN")).toHaveAttribute(
      "href",
      "/en/archive?q=a+b&tag=ai"
    );
  });

  it("adds no ? when there is no query", () => {
    mockPathname = "/en/archive";
    render(<LanguageToggle locale="en" />);
    expect(screen.getByText("ES").getAttribute("href")).not.toContain("?");
  });
});
