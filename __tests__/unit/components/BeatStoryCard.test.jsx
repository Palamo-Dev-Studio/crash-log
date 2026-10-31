// ABOUTME: Unit tests for BeatStoryCard component.
// ABOUTME: Validates null guard, localized headline, mono severity/verdict label, and issue code chip and date.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import BeatStoryCard from "@/components/BeatStoryCard";

describe("BeatStoryCard", () => {
  const baseProps = {
    severity: "ERROR",
    headline: { en: "Robot Fails", es: "Robot Falla" },
    issueMeta: {
      slug: "crash-log-014",
      number: 14,
      date: "2026-03-03",
    },
    locale: "en",
  };

  it("returns null when issueMeta.slug is missing", () => {
    const { container } = render(
      <BeatStoryCard {...baseProps} issueMeta={{}} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null when issueMeta is undefined", () => {
    const { container } = render(
      <BeatStoryCard {...baseProps} issueMeta={undefined} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders as a Link to the issue", () => {
    render(<BeatStoryCard {...baseProps} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/issue/crash-log-014"
    );
  });

  it("renders localized headline for en", () => {
    render(<BeatStoryCard {...baseProps} />);
    expect(screen.getByText("Robot Fails")).toBeInTheDocument();
  });

  it("renders localized headline for es", () => {
    render(<BeatStoryCard {...baseProps} locale="es" />);
    expect(screen.getByText("Robot Falla")).toBeInTheDocument();
  });

  it("renders the severity as a plain label when there is no verdict", () => {
    render(<BeatStoryCard {...baseProps} />);
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("prefers the localized verdict over the severity", () => {
    const verdict = { en: "Needs a human", es: "Necesita a una persona" };
    const { rerender } = render(
      <BeatStoryCard {...baseProps} verdict={verdict} />
    );
    expect(screen.getByText("Needs a human")).toBeInTheDocument();
    expect(screen.queryByText("ERROR")).not.toBeInTheDocument();
    rerender(<BeatStoryCard {...baseProps} verdict={verdict} locale="es" />);
    expect(screen.getByText("Necesita a una persona")).toBeInTheDocument();
  });

  it("renders no label when neither verdict nor severity exists", () => {
    const { container } = render(
      <BeatStoryCard {...baseProps} severity={undefined} />
    );
    expect(container.querySelectorAll("span")).toHaveLength(2);
  });

  it("renders the issue's OTR code chip and formatted date", () => {
    render(<BeatStoryCard {...baseProps} />);
    expect(screen.getByText("OTR-014")).toBeInTheDocument();
    expect(screen.getByText("Mar 3, 2026")).toBeInTheDocument();
  });

  it("handles string headline (non-object)", () => {
    render(<BeatStoryCard {...baseProps} headline="Plain headline" />);
    expect(screen.getByText("Plain headline")).toBeInTheDocument();
  });
});
