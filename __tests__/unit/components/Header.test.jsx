// ABOUTME: Unit tests for Header component.
// ABOUTME: Validates roundel, wordmark, blinking cursor, tagline, tools (toggle slot, Support, Subscribe).

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/SubscribeForm", () => ({
  default: ({ locale }) => (
    <div data-testid="subscribe-form" data-locale={locale} />
  ),
}));

import Header from "@/components/Header";

describe("Header", () => {
  it("renders The Crash Log wordmark", () => {
    render(<Header locale="en" />);
    expect(screen.getByText("The Crash Log")).toBeInTheDocument();
  });

  it("renders the roundel with the accessible name Crash Log, once", () => {
    render(<Header locale="en" />);
    const marks = screen.getAllByRole("img", { name: "Crash Log" });
    expect(marks).toHaveLength(1);
  });

  it("renders the stamp roundel at masthead size (ring legend present)", () => {
    const { container } = render(<Header locale="en" />);
    expect(container.querySelector("textPath")).not.toBeNull();
  });

  it("renders a decorative small mark hidden from assistive tech", () => {
    const { container } = render(<Header locale="en" />);
    const hidden = container.querySelector('span[aria-hidden="true"] svg');
    expect(hidden).not.toBeNull();
  });

  it("renders the blinking cursor as an aria-hidden element after the wordmark", () => {
    render(<Header locale="en" />);
    const name = screen.getByText("The Crash Log");
    const cursor = name.querySelector('[aria-hidden="true"]');
    expect(cursor).not.toBeNull();
    expect(cursor.className).toContain("cursor");
  });

  it("no longer uses the old logo image", () => {
    const { container } = render(<Header locale="en" />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders the English tagline", () => {
    render(<Header locale="en" />);
    expect(
      screen.getByText(/Incident reports on AI · Read closely/)
    ).toBeInTheDocument();
  });

  it("renders the Spanish tagline for es locale", () => {
    render(<Header locale="es" />);
    expect(
      screen.getByText(/Incidentes de IA · Lectura atenta/)
    ).toBeInTheDocument();
  });

  it("renders SubscribeForm with locale", () => {
    render(<Header locale="en" />);
    const form = screen.getByTestId("subscribe-form");
    expect(form).toHaveAttribute("data-locale", "en");
  });

  it("wordmark links to locale home", () => {
    render(<Header locale="es" />);
    expect(screen.getByText("The Crash Log").closest("a")).toHaveAttribute(
      "href",
      "/es"
    );
  });

  it("renders children first in the tools group", () => {
    render(
      <Header locale="en">
        <button>Toggle</button>
      </Header>
    );
    const tools = screen.getByText("Toggle").parentElement;
    expect(tools.firstElementChild).toBe(screen.getByText("Toggle"));
  });

  it("renders a Support link to the support page", () => {
    render(<Header locale="en" />);
    expect(screen.getByText("Support").closest("a")).toHaveAttribute(
      "href",
      "/en/support"
    );
  });

  it("renders Apoyar for the Spanish locale", () => {
    render(<Header locale="es" />);
    expect(screen.getByText("Apoyar").closest("a")).toHaveAttribute(
      "href",
      "/es/support"
    );
  });

  it("does not render the old Fund button", () => {
    render(<Header locale="en" />);
    expect(screen.queryByText("Fund")).toBeNull();
  });

  it("orders tools: Support before Subscribe", () => {
    render(<Header locale="en" />);
    const subscribe = screen.getByTestId("subscribe-form");
    const kids = Array.from(subscribe.parentElement.children);
    const supportIdx = kids.findIndex((el) => el.textContent === "Support");
    expect(supportIdx).toBeGreaterThanOrEqual(0);
    expect(supportIdx).toBeLessThan(kids.indexOf(subscribe));
  });
});
