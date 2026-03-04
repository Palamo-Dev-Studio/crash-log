// ABOUTME: Unit tests for BeatStoryCard component.
// ABOUTME: Validates null guard, localized headline, severity badge, and issue meta rendering.

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

  it("renders severity badge", () => {
    render(<BeatStoryCard {...baseProps} />);
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("renders zero-padded issue number", () => {
    render(<BeatStoryCard {...baseProps} />);
    expect(screen.getByText(/#014/)).toBeInTheDocument();
  });

  it("handles string headline (non-object)", () => {
    render(<BeatStoryCard {...baseProps} headline="Plain headline" />);
    expect(screen.getByText("Plain headline")).toBeInTheDocument();
  });
});
