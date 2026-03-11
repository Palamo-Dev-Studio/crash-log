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

vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, ...props }) => (
    <img src={src} alt={alt} width={width} height={height} {...props} />
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

  it("renders logo image in header", () => {
    render(<Header locale="en" />);
    const logo = document.querySelector('img[src="/logo-circle.webp"]');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("alt", "");
  });

  it("logo and wordmark text are within the same link", () => {
    render(<Header locale="en" />);
    const link = screen.getByText("The Crash Log").closest("a");
    const logo = link.querySelector('img[src="/logo-circle.webp"]');
    expect(logo).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/en");
  });

  it("renders FUND button linking to support page", () => {
    render(<Header locale="en" />);
    const fundLink = screen.getByText("Fund");
    expect(fundLink.closest("a")).toHaveAttribute("href", "/en/support");
  });

  it("renders APOYA button for Spanish locale", () => {
    render(<Header locale="es" />);
    const apoyaLink = screen.getByText("Apoya");
    expect(apoyaLink.closest("a")).toHaveAttribute("href", "/es/support");
  });

  it("FUND button appears before subscribe form in actions", () => {
    render(<Header locale="en" />);
    const subscribeForm = screen.getByTestId("subscribe-form");
    const actionsContainer = subscribeForm.parentElement;
    const children = Array.from(actionsContainer.children);
    const fundIndex = children.findIndex((el) =>
      el.textContent?.includes("Fund")
    );
    const subscribeIndex = children.findIndex(
      (el) => el.dataset.testid === "subscribe-form"
    );
    expect(fundIndex).toBeGreaterThanOrEqual(0);
    expect(fundIndex).toBeLessThan(subscribeIndex);
  });
});
