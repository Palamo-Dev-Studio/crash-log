// ABOUTME: Unit tests for SiteNav component.
// ABOUTME: Validates nav link rendering, locale prefix, and active state.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

let mockSegment = null;

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: () => mockSegment,
}));

import SiteNav from "@/components/SiteNav";

describe("SiteNav", () => {
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
});
