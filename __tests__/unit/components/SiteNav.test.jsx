// ABOUTME: Unit tests for SiteNav component.
// ABOUTME: Validates nav link rendering, locale prefix, and active state.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import SiteNav from "@/components/SiteNav";

describe("SiteNav", () => {
  it("renders 4 navigation links", () => {
    render(<SiteNav locale="en" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
  });

  it("renders Latest, Archive, Beats, About links", () => {
    render(<SiteNav locale="en" />);
    expect(screen.getByText("Latest")).toBeInTheDocument();
    expect(screen.getByText("Archive")).toBeInTheDocument();
    expect(screen.getByText("Beats")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders Spanish nav labels for es locale", () => {
    render(<SiteNav locale="es" />);
    expect(screen.getByText("Último")).toBeInTheDocument();
    expect(screen.getByText("Archivo")).toBeInTheDocument();
    expect(screen.getByText("Beats")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("prefixes links with en locale", () => {
    render(<SiteNav locale="en" />);
    expect(screen.getByText("Latest").closest("a")).toHaveAttribute(
      "href",
      "/en"
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

  it("applies active class to Latest when no activeSegment", () => {
    render(<SiteNav locale="en" activeSegment={undefined} />);
    const latest = screen.getByText("Latest").closest("a");
    expect(latest.className).toContain("active");
  });

  it("applies active class to Archive when activeSegment is archive", () => {
    render(<SiteNav locale="en" activeSegment="archive" />);
    const archive = screen.getByText("Archive").closest("a");
    expect(archive.className).toContain("active");
  });

  it("does not apply active class to non-active links", () => {
    render(<SiteNav locale="en" activeSegment="archive" />);
    const latest = screen.getByText("Latest").closest("a");
    expect(latest.className).not.toContain("active");
  });
});
