// ABOUTME: Component tests for SeriesIndex (Practical and Nico's Notes): row content and order, empty states, series colour chips.
// ABOUTME: The Practical empty state carries a Subscribe link; Nico's Notes' does not.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import SeriesIndex from "@/components/SeriesIndex";

const practical = (n, date, title) => ({
  _id: `p${n}`,
  slug: `p-${n}`,
  practicalNumber: n,
  publishDate: date,
  title: { en: title, es: `${title} ES` },
});

describe("SeriesIndex", () => {
  it("renders Practical rows in the given order with codes, hrefs and Hector's byline", () => {
    render(
      <SeriesIndex
        series="practical"
        locale="en"
        docs={[
          practical(2, "2026-11-11", "Second file"),
          practical(1, "2026-11-04", "First file"),
        ]}
      />
    );
    const rows = screen
      .getAllByRole("link")
      .filter((a) => a.href.includes("/practical/"));
    expect(rows.map((r) => r.getAttribute("href"))).toEqual([
      "/en/practical/p-2",
      "/en/practical/p-1",
    ]);
    expect(screen.getByText("FIX-002")).toBeInTheDocument();
    expect(screen.getByText("FIX-001")).toBeInTheDocument();
    expect(screen.getAllByText(/By Hector Luis Alamo/)).toHaveLength(2);
    expect(screen.queryByText("The Practical series starts soon.")).toBeNull();
  });

  it("renders the Practical empty state with a Subscribe link", () => {
    render(<SeriesIndex series="practical" locale="en" docs={[]} />);
    expect(
      screen.getByText("The Practical series starts soon.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Subscribe/ }).getAttribute("href")
    ).toMatch(/substack\.com/);
  });

  it("renders the Spanish Practical heading and empty state", () => {
    render(<SeriesIndex series="practical" locale="es" docs={[]} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Práctico"
    );
    expect(
      screen.getByText("La serie Práctico empieza pronto.")
    ).toBeInTheDocument();
  });

  it("renders Nico's Notes rows as NOTE files bylined to Nico von Bot", () => {
    render(
      <SeriesIndex
        series="nicosNotes"
        locale="en"
        docs={[
          {
            _id: "c1",
            slug: "2026-03-07",
            columnNumber: 22,
            publishDate: "2026-03-07",
            title: { en: "Week in review", es: "Semana" },
          },
        ]}
      />
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Nico’s Notes"
    );
    expect(screen.getByText("NOTE-022")).toBeInTheDocument();
    expect(screen.getByText(/By Nico von Bot/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Week in review/ }).getAttribute("href")
    ).toBe("/en/nico/2026-03-07");
  });

  it("renders the Nico's Notes empty state with no Subscribe link", () => {
    render(<SeriesIndex series="nicosNotes" locale="en" docs={[]} />);
    expect(screen.getByText("No columns published yet.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
