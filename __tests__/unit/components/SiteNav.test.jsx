// ABOUTME: Unit tests for SiteNav component.
// ABOUTME: Validates nav link rendering, locale prefix, and active state.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

let mockSegment = null;
const mockPush = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: () => mockSegment,
  useRouter: () => ({ push: mockPush }),
}));

import SiteNav from "@/components/SiteNav";

describe("SiteNav", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("renders 5 navigation links", () => {
    render(<SiteNav locale="en" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  it("renders Latest, Nico\u2019s Notes, Archive, Beats, About links", () => {
    render(<SiteNav locale="en" />);
    expect(screen.getByText("Latest")).toBeInTheDocument();
    expect(screen.getByText("Nico\u2019s Notes")).toBeInTheDocument();
    expect(screen.getByText("Archive")).toBeInTheDocument();
    expect(screen.getByText("Beats")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders Spanish nav labels for es locale", () => {
    render(<SiteNav locale="es" />);
    expect(screen.getByText("Último")).toBeInTheDocument();
    expect(screen.getByText("Notas de Nico")).toBeInTheDocument();
    expect(screen.getByText("Archivo")).toBeInTheDocument();
    expect(screen.getByText("Temas")).toBeInTheDocument();
    expect(screen.getByText("Sobre")).toBeInTheDocument();
  });

  it("prefixes links with en locale", () => {
    render(<SiteNav locale="en" />);
    expect(screen.getByText("Latest").closest("a")).toHaveAttribute(
      "href",
      "/en"
    );
    expect(screen.getByText("Nico\u2019s Notes").closest("a")).toHaveAttribute(
      "href",
      "/en/nico"
    );
    expect(screen.getByText("Archive").closest("a")).toHaveAttribute(
      "href",
      "/en/archive"
    );
    expect(screen.getByText("Beats").closest("a")).toHaveAttribute(
      "href",
      "/en/beats"
    );
    expect(screen.getByText("About").closest("a")).toHaveAttribute(
      "href",
      "/en/about"
    );
  });

  it("prefixes links with es locale", () => {
    render(<SiteNav locale="es" />);
    expect(screen.getByText("Último").closest("a")).toHaveAttribute(
      "href",
      "/es"
    );
    expect(screen.getByText("Archivo").closest("a")).toHaveAttribute(
      "href",
      "/es/archive"
    );
  });

  it("applies active class to Latest when no segment", () => {
    mockSegment = null;
    render(<SiteNav locale="en" />);
    const latest = screen.getByText("Latest").closest("a");
    expect(latest.className).toContain("active");
  });

  it("applies active class to Archive when segment is archive", () => {
    mockSegment = "archive";
    render(<SiteNav locale="en" />);
    const archive = screen.getByText("Archive").closest("a");
    expect(archive.className).toContain("active");
  });

  it("does not apply active class to non-active links", () => {
    mockSegment = "archive";
    render(<SiteNav locale="en" />);
    const latest = screen.getByText("Latest").closest("a");
    expect(latest.className).not.toContain("active");
  });

  it("applies active class to About when segment is about", () => {
    mockSegment = "about";
    render(<SiteNav locale="en" />);
    const about = screen.getByText("About").closest("a");
    expect(about.className).toContain("active");
    const latest = screen.getByText("Latest").closest("a");
    expect(latest.className).not.toContain("active");
  });

  it("applies active class to Nico\u2019s Notes when segment is nico", () => {
    mockSegment = "nico";
    render(<SiteNav locale="en" />);
    const nico = screen.getByText("Nico\u2019s Notes").closest("a");
    expect(nico.className).toContain("active");
    const latest = screen.getByText("Latest").closest("a");
    expect(latest.className).not.toContain("active");
  });

  describe("search input", () => {
    it("renders a search input with an English aria-label", () => {
      render(<SiteNav locale="en" />);
      expect(screen.getByLabelText("Search the archive")).toBeInTheDocument();
    });

    it("renders a search input with a Spanish aria-label", () => {
      render(<SiteNav locale="es" />);
      expect(screen.getByLabelText("Buscar en el archivo")).toBeInTheDocument();
    });

    it("navigates to /{locale}/archive?q=<query> on submit", () => {
      render(<SiteNav locale="en" />);
      const input = screen.getByLabelText("Search the archive");
      fireEvent.change(input, { target: { value: "perplexity" } });
      fireEvent.submit(input.closest("form"));
      expect(mockPush).toHaveBeenCalledWith("/en/archive?q=perplexity");
    });

    it("encodes special characters in the query", () => {
      render(<SiteNav locale="en" />);
      const input = screen.getByLabelText("Search the archive");
      fireEvent.change(input, { target: { value: "a\u00f1o & modelo" } });
      fireEvent.submit(input.closest("form"));
      expect(mockPush).toHaveBeenCalledWith(
        `/en/archive?q=${encodeURIComponent("a\u00f1o & modelo")}`
      );
    });

    it("navigates to the plain archive path when the query is empty", () => {
      render(<SiteNav locale="en" />);
      const input = screen.getByLabelText("Search the archive");
      fireEvent.submit(input.closest("form"));
      expect(mockPush).toHaveBeenCalledWith("/en/archive");
    });

    it("trims whitespace-only queries to the plain archive path", () => {
      render(<SiteNav locale="en" />);
      const input = screen.getByLabelText("Search the archive");
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.submit(input.closest("form"));
      expect(mockPush).toHaveBeenCalledWith("/en/archive");
    });

    it("preserves the es locale prefix on submit", () => {
      render(<SiteNav locale="es" />);
      const input = screen.getByLabelText("Buscar en el archivo");
      fireEvent.change(input, { target: { value: "modelo" } });
      fireEvent.submit(input.closest("form"));
      expect(mockPush).toHaveBeenCalledWith("/es/archive?q=modelo");
    });
  });
});
