// ABOUTME: Unit tests for the About page bodies: fallback copy and two-person masthead, Sanity masthead, no weekday headings.
// ABOUTME: Covers the About fallback and Sanity bodies.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />,
}));
vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: () => ({ height: () => ({ url: () => "https://cdn.test/a.png" }) }),
  }),
}));

import { FallbackAbout, SanityAbout } from "@/components/AboutSections";

const WEEKDAYS = [
  ...new Set(
    ["en", "es"].flatMap((l) =>
      Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(l, { weekday: "long", timeZone: "UTC" }).format(
          new Date(Date.UTC(2024, 0, 1 + i))
        )
      )
    )
  ),
];

describe("FallbackAbout", () => {
  it.each([
    ["en", "The Crash Log reads AI's failures closely"],
    ["es", "The Crash Log lee de cerca las fallas de la IA"],
  ])("renders the approved lead as the H1 [%s]", (locale, lead) => {
    render(<FallbackAbout locale={locale} about={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(lead);
  });

  it("shows exactly two masthead cards: Hector and Nico", () => {
    render(<FallbackAbout locale="en" about={null} />);
    const names = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(names).toEqual(["Hector Luis Alamo", "Nico"]);
  });

  it.each(["Scoop", "Root", "Gabo", "Lupe", "Nico von Bot"])(
    "does not mention retired masthead member %s",
    (name) => {
      const { container } = render(<FallbackAbout locale="en" about={null} />);
      expect(container.textContent).not.toContain(name);
    }
  );

  it("borrows the Sanity avatar by name when one exists", () => {
    const about = {
      masthead: [
        { name: "Hector Luis Alamo", avatar: { asset: { _ref: "x" } } },
      ],
    };
    render(<FallbackAbout locale="en" about={about} />);
    expect(screen.getByAltText("Hector Luis Alamo")).toBeInTheDocument();
    expect(screen.queryByAltText("Nico")).not.toBeInTheDocument();
  });

  it("keeps info@palamo.ai as the mailto contact", () => {
    render(<FallbackAbout locale="es" about={null} />);
    expect(
      screen.getByRole("link", { name: "info@palamo.ai" })
    ).toHaveAttribute("href", "mailto:info@palamo.ai");
  });

  it.each(["en", "es"])("has no weekday in any heading [%s]", (locale) => {
    render(<FallbackAbout locale={locale} about={null} />);
    for (const h of screen.getAllByRole("heading")) {
      for (const day of WEEKDAYS)
        expect(h.textContent).not.toMatch(new RegExp(day, "i"));
    }
  });
});

describe("SanityAbout", () => {
  it("renders one card per masthead entry it is given", () => {
    const about = {
      masthead: [
        { _id: "1", name: "Hector Luis Alamo", agentType: "human" },
        { _id: "2", name: "Nico von Bot", agentType: "lead_agent" },
      ],
    };
    render(<SanityAbout about={about} locale="en" />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("omits the masthead section when nobody is listed", () => {
    render(<SanityAbout about={{ masthead: [] }} locale="en" />);
    expect(screen.queryByText("Masthead")).not.toBeInTheDocument();
  });
});
