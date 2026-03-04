// ABOUTME: Unit tests for Header component.
// ABOUTME: Validates wordmark, tagline, subscribe button, children slot, and locale link.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Header from "@/components/Header";

describe("Header", () => {
  it("renders The Crash Log wordmark", () => {
    render(<Header locale="en" />);
    expect(screen.getByText("The Crash Log")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<Header locale="en" />);
    expect(
      screen.getByText(/AI & Tech Gone Off the Rails/)
    ).toBeInTheDocument();
  });

  it("renders Subscribe button", () => {
    render(<Header locale="en" />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
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
