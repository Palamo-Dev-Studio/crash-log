// ABOUTME: Unit tests for Footer component.
// ABOUTME: Validates the series list, Elsewhere links, fine print, roundel, and absence of weekday copy.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Footer from "@/components/Footer";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";

const WEEKDAYS =
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|mon|tue|wed|thu|fri|sat|sun)\b/i;

describe("Footer", () => {
  it("renders a footer element", () => {
    render(<Footer locale="en" />);
    expect(document.querySelector("footer")).toBeInTheDocument();
  });

  it("renders the small roundel", () => {
    render(<Footer locale="en" />);
    const mark = screen.getByRole("img", { name: "Crash Log" });
    expect(mark.querySelector("textPath")).toBeNull();
  });

  it("renders the series list with colour-classed codes", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText("OTR").className).toContain("otr");
    expect(screen.getByText("FIX").className).toContain("fix");
    expect(screen.getByText("NOTE").className).toContain("note");
    expect(screen.getByText(/Off the Rails/)).toBeInTheDocument();
    expect(screen.getByText(/Practical/)).toBeInTheDocument();
    expect(screen.getByText(/Nico’s Notes/)).toBeInTheDocument();
  });

  it("renders Spanish series names and headings", () => {
    render(<Footer locale="es" />);
    expect(screen.getByText("Las series")).toBeInTheDocument();
    expect(screen.getByText(/Fuera de las vías/)).toBeInTheDocument();
    expect(screen.getByText("Más")).toBeInTheDocument();
  });

  it("renders Elsewhere links with locale-prefixed hrefs", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText("Archive").closest("a")).toHaveAttribute(
      "href",
      "/en/archive"
    );
    expect(screen.getByText("About").closest("a")).toHaveAttribute(
      "href",
      "/en/about"
    );
    expect(screen.getByText("Support the Log").closest("a")).toHaveAttribute(
      "href",
      "/en/support"
    );
    expect(screen.getByText("RSS").closest("a")).toHaveAttribute(
      "href",
      "/en/feed.xml"
    );
    expect(screen.getByText("Contact").closest("a")).toHaveAttribute(
      "href",
      "mailto:info@palamo.ai"
    );
  });

  it("renders the subscribe line linking to Substack", () => {
    render(<Footer locale="en" />);
    expect(
      screen.getByText(/New files every week\. Free\./)
    ).toBeInTheDocument();
    expect(screen.getByText("Subscribe").closest("a")).toHaveAttribute(
      "href",
      SUBSTACK_SUBSCRIBE_URL
    );
  });

  it("renders the copyright with the current year and Palamo credit", () => {
    render(<Footer locale="en" />);
    expect(
      screen.getByText(
        new RegExp(`© ${new Date().getFullYear()} The Crash Log`)
      )
    ).toBeInTheDocument();
    expect(screen.getByText("A Palamo publication")).toBeInTheDocument();
  });

  it("renders EN and ES links", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText("EN").closest("a")).toHaveAttribute("href", "/en");
    expect(screen.getByText("ES").closest("a")).toHaveAttribute("href", "/es");
  });

  it.each(["en", "es"])(
    "has no weekday names or MON/WED/FRI (%s)",
    (locale) => {
      const { container } = render(<Footer locale={locale} />);
      expect(container.textContent).not.toMatch(WEEKDAYS);
    }
  );

  it("weekday guard actually catches weekday copy", () => {
    expect("Mon / Wed / Fri").toMatch(WEEKDAYS);
    expect("viernes").toMatch(WEEKDAYS);
  });
});
