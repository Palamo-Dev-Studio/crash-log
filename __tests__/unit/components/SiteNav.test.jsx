// ABOUTME: Unit tests for SiteNav component.
// ABOUTME: Validates the six nav links, locale-prefixed hrefs, and active state per route segment.

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

const EN = [
  ["Latest", "/en"],
  ["Off the Rails", "/en/off-the-rails"],
  ["Practical", "/en/practical"],
  ["Nico\u2019s Notes", "/en/nico"],
  ["Archive", "/en/archive"],
  ["About", "/en/about"],
];

const ES = [
  ["Lo \u00faltimo", "/es"],
  ["Fuera de las v\u00edas", "/es/off-the-rails"],
  ["Pr\u00e1ctico", "/es/practical"],
  ["Notas de Nico", "/es/nico"],
  ["Archivo", "/es/archive"],
  ["Sobre", "/es/about"],
];

function activeLabels() {
  return screen
    .getAllByRole("link")
    .filter((a) => a.getAttribute("aria-current") === "page")
    .map((a) => a.textContent);
}

describe("SiteNav", () => {
  it("renders exactly six links", () => {
    render(<SiteNav locale="en" />);
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });

  it.each(EN)("EN link %s points to %s", (label, href) => {
    render(<SiteNav locale="en" />);
    expect(screen.getByText(label).closest("a")).toHaveAttribute("href", href);
  });

  it.each(ES)("ES link %s points to %s", (label, href) => {
    render(<SiteNav locale="es" />);
    expect(screen.getByText(label).closest("a")).toHaveAttribute("href", href);
  });

  it("does not link to Beats", () => {
    render(<SiteNav locale="en" />);
    expect(screen.queryByText("Beats")).toBeNull();
  });

  it("has no search input (search lives on the archive page)", () => {
    render(<SiteNav locale="en" />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it.each([
    [null, "Latest"],
    ["issue", "Off the Rails"],
    ["off-the-rails", "Off the Rails"],
    ["practical", "Practical"],
    ["nico", "Nico\u2019s Notes"],
    ["archive", "Archive"],
    ["about", "About"],
  ])("segment %s marks only %s active", (segment, label) => {
    mockSegment = segment;
    render(<SiteNav locale="en" />);
    expect(activeLabels()).toEqual([label]);
    expect(screen.getByText(label).closest("a").className).toContain("active");
  });

  it("marks nothing active on an unrelated segment", () => {
    mockSegment = "beats";
    render(<SiteNav locale="en" />);
    expect(activeLabels()).toEqual([]);
  });
});
