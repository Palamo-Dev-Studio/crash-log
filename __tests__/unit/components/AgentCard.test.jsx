// ABOUTME: Unit tests for AgentCard component.
// ABOUTME: Validates localized role text, agent type labels, model tag, and bio rendering.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AgentCard from "@/components/AgentCard";

describe("AgentCard", () => {
  const baseProps = {
    name: "Nico",
    role: { en: "Managing Editor", es: "Editor General" },
    agentType: "lead_agent",
    model: "claude-3.5",
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

  it("shows model tag when model is present", () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText(/CLAUDE-3\.5/)).toBeInTheDocument();
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
});
