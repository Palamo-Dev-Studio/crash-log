// ABOUTME: Unit tests for Header component.
// ABOUTME: Validates wordmark, tagline, subscribe form, children slot, and locale link.

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

  it("renders the English tagline", () => {
    render(<Header locale="en" />);
    expect(
      screen.getByText(/AI & Tech Gone Off the Rails/)
    ).toBeInTheDocument();
  });

  it("renders the Spanish tagline for es locale", () => {
    render(<Header locale="es" />);
    expect(
      screen.getByText(/IA y Tecnología Descarriladas/)
    ).toBeInTheDocument();
  });

  it("renders SubscribeForm with locale", () => {
    render(<Header locale="en" />);
    const form = screen.getByTestId("subscribe-form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("data-locale", "en");
  });

  it("wordmark links to locale home", () => {
    render(<Header locale="en" />);
    const link = screen.getByText("The Crash Log");
    expect(link.closest("a")).toHaveAttribute("href", "/en");
  });

  it("wordmark links to es home for es locale", () => {
    render(<Header locale="es" />);
    const link = screen.getByText("The Crash Log");
    expect(link.closest("a")).toHaveAttribute("href", "/es");
  });

  it("renders children in actions slot", () => {
    render(
      <Header locale="en">
        <button>Toggle</button>
      </Header>
    );
    expect(screen.getByText("Toggle")).toBeInTheDocument();
  });
});
