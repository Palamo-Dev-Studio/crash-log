// ABOUTME: Unit tests for StoryBlock component.
// ABOUTME: Validates severity badge, headline, tags, and body rendering.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StoryBlock from "@/components/StoryBlock";

describe("StoryBlock", () => {
  const baseProps = {
    severity: "ERROR",
    headline: "Robot Uprising at Factory",
    tags: ["AI", "Automation"],
  };

  it("renders the headline in an h2", () => {
    render(
      <StoryBlock {...baseProps}>
        <p>Body</p>
      </StoryBlock>
    );
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2).toHaveTextContent("Robot Uprising at Factory");
  });

  it("renders a SeverityBadge with the severity text", () => {
    render(
      <StoryBlock {...baseProps}>
        <p>Body</p>
      </StoryBlock>
    );
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("renders tags separated by /", () => {
    render(
      <StoryBlock {...baseProps}>
        <p>Body</p>
      </StoryBlock>
    );
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("Automation")).toBeInTheDocument();
  });

  it("renders children as body content", () => {
    render(
      <StoryBlock {...baseProps}>
        <p>Story body text</p>
      </StoryBlock>
    );
    expect(screen.getByText("Story body text")).toBeInTheDocument();
  });

  it("omits tags section when tags is null", () => {
    render(
      <StoryBlock {...baseProps} tags={null}>
        <p>Body</p>
      </StoryBlock>
    );
    expect(screen.queryByText("AI")).not.toBeInTheDocument();
  });

  it("renders as an article element", () => {
    render(
      <StoryBlock {...baseProps}>
        <p>Body</p>
      </StoryBlock>
    );
    expect(document.querySelector("article")).toBeInTheDocument();
  });

  it("sets --severity-color CSS variable", () => {
    render(
      <StoryBlock {...baseProps}>
        <p>Body</p>
      </StoryBlock>
    );
    const article = document.querySelector("article");
    expect(article.style.getPropertyValue("--severity-color")).toBe(
      "var(--severity-error)"
    );
  });
});
