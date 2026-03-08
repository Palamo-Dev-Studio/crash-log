// ABOUTME: Unit tests for AgentCard component.
// ABOUTME: Validates localized role text, agent type labels, model tag, bio, and avatar rendering.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, ...props }) => (
    <img src={src} alt={alt} width={width} height={height} {...props} />
  ),
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: () => ({
      height: () => ({
        url: () =>
          "https://cdn.sanity.io/images/test/production/avatar-123.png",
      }),
    }),
  }),
}));

import AgentCard from "@/components/AgentCard";

describe("AgentCard", () => {
  const baseProps = {
    name: "Nico",
    role: { en: "Managing Editor", es: "Editor General" },
    agentType: "lead_agent",
    model: { en: "claude-3.5", es: "claude-3.5-es" },
    color: "#FF3B30",
    bio: { en: "AI managing editor", es: "Editor IA" },
    locale: "en",
  };

  it("renders agent name", () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText("Nico")).toBeInTheDocument();
  });

  it("resolves localized role for en", () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText("Managing Editor")).toBeInTheDocument();
  });

  it("resolves localized role for es", () => {
    render(<AgentCard {...baseProps} locale="es" />);
    expect(screen.getByText("Editor General")).toBeInTheDocument();
  });

  it("renders type label for lead_agent", () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText(/LEAD AGENT/)).toBeInTheDocument();
  });

  it("renders type label for sub_agent", () => {
    render(<AgentCard {...baseProps} agentType="sub_agent" />);
    expect(screen.getByText(/SUB-AGENT/)).toBeInTheDocument();
  });

  it("renders type label for human", () => {
    render(<AgentCard {...baseProps} agentType="human" />);
    expect(screen.getByText(/HUMAN IN THE LOOP/)).toBeInTheDocument();
  });

  it("shows model tag when model is present (en)", () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText(/CLAUDE-3\.5/)).toBeInTheDocument();
  });

  it("resolves localized model for es", () => {
    render(<AgentCard {...baseProps} locale="es" />);
    expect(screen.getByText(/CLAUDE-3\.5-ES/)).toBeInTheDocument();
  });

  it("falls back to en model when es is missing", () => {
    render(
      <AgentCard {...baseProps} model={{ en: "Sonnet 4.6" }} locale="es" />
    );
    expect(screen.getByText(/SONNET 4\.6/)).toBeInTheDocument();
  });

  it("handles plain string model for backward compat", () => {
    render(<AgentCard {...baseProps} model="GPT-5" />);
    expect(screen.getByText(/GPT-5/)).toBeInTheDocument();
  });

  it("omits model from tag when model is absent", () => {
    render(<AgentCard {...baseProps} model={undefined} />);
    const tag = screen.getByText("LEAD AGENT");
    expect(tag.textContent).not.toContain("·");
  });

  it("renders bio text", () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText("AI managing editor")).toBeInTheDocument();
  });

  it("resolves localized bio for es", () => {
    render(<AgentCard {...baseProps} locale="es" />);
    expect(screen.getByText("Editor IA")).toBeInTheDocument();
  });

  it("omits bio when absent", () => {
    render(<AgentCard {...baseProps} bio={undefined} />);
    expect(screen.queryByText("AI managing editor")).not.toBeInTheDocument();
  });

  it("handles string role (non-object)", () => {
    render(<AgentCard {...baseProps} role="Editor" />);
    expect(screen.getByText("Editor")).toBeInTheDocument();
  });

  it("renders avatar image when image prop is provided", () => {
    const image = { asset: { _ref: "image-abc-123-png" } };
    render(<AgentCard {...baseProps} image={image} />);
    const img = screen.getByAltText("Nico");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://cdn.sanity.io/images/test/production/avatar-123.png"
    );
  });

  it("renders colored dot when image prop is absent", () => {
    const { container } = render(<AgentCard {...baseProps} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const dot = container.querySelector("[class*='dot']");
    expect(dot).toBeInTheDocument();
  });
});
