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
    expect(names).toEqual(["Hector Luis Alamo", "Nico von Bot"]);
  });

  it.each(["Scoop", "Root", "Gabo", "Lupe"])(
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
    expect(screen.queryByAltText("Nico von Bot")).not.toBeInTheDocument();
  });

  it("borrows Nico's avatar from the 'Nico von Bot' agent document", () => {
    const about = {
      masthead: [{ name: "Nico von Bot", avatar: { asset: { _ref: "n" } } }],
    };
    render(<FallbackAbout locale="en" about={about} />);
    expect(screen.getByAltText("Nico von Bot")).toBeInTheDocument();
    expect(screen.queryByAltText("Hector Luis Alamo")).not.toBeInTheDocument();
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

const blk = (text, style = "normal") => ({
  _type: "block",
  _key: `${style}-${text}`,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: "s", text, marks: [] }],
});
const field = (...blocks) => ({ en: blocks });
const people = [
  { _id: "1", name: "Hector Luis Alamo", agentType: "human" },
  { _id: "2", name: "Nico von Bot", agentType: "lead_agent" },
];

describe("SanityAbout structured fields", () => {
  it("renders workflow and contact preambles ahead of that field's sections", () => {
    const about = {
      introParagraph: field(blk("Lead line."), blk("Intro H2", "h2")),
      workflowSection: field(
        blk("Workflow preamble text."),
        blk("Workflow H2", "h2"),
        blk("Workflow body.")
      ),
      contactCTA: field(
        blk("Contact preamble text."),
        blk("Contact H2", "h2"),
        blk("Contact body.")
      ),
      masthead: [],
    };
    const { container } = render(<SanityAbout about={about} locale="en" />);
    const text = container.textContent;
    for (const s of ["Workflow preamble text.", "Contact preamble text."])
      expect(text).toContain(s);
    const at = (s) => text.indexOf(s);
    expect(at("Intro H2")).toBeLessThan(at("Workflow preamble text."));
    expect(at("Workflow preamble text.")).toBeLessThan(at("Workflow H2"));
    expect(at("Workflow body.")).toBeLessThan(at("Contact preamble text."));
    expect(at("Contact preamble text.")).toBeLessThan(at("Contact H2"));
  });

  it("puts the cards at the end when the workflow field has no H2", () => {
    const about = {
      introParagraph: field(blk("Lead line."), blk("Intro H2", "h2")),
      workflowSection: field(blk("Plain workflow prose.")),
      contactCTA: field(blk("Contact H2", "h2"), blk("Contact body.")),
      masthead: people,
    };
    render(<SanityAbout about={about} locale="en" />);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)
    ).toEqual(["Hector Luis Alamo", "Nico von Bot"]);
    expect(screen.getByTestId("masthead")).toBeInTheDocument();
  });

  it("falls back to the page title as H1 when the intro opens with an H2", () => {
    const about = {
      introParagraph: field(blk("First H2", "h2"), blk("Body.")),
      masthead: [],
    };
    render(<SanityAbout about={about} locale="en" />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("About");
    expect(
      screen.getByRole("heading", { level: 2, name: "First H2" })
    ).toBeInTheDocument();
  });
});
