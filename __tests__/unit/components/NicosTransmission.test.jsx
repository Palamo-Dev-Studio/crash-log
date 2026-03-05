// ABOUTME: Unit tests for NicosTransmission component.
// ABOUTME: Validates editorial intro card structure and optional signature.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NicosTransmission from "@/components/NicosTransmission";

describe("NicosTransmission", () => {
  it("renders as an aside with English aria-label", () => {
    render(
      <NicosTransmission locale="en">
        <p>Test content</p>
      </NicosTransmission>
    );
    expect(
      screen.getByLabelText("Nico\u2019s Transmission")
    ).toBeInTheDocument();
  });

  it("renders the English label text", () => {
    render(
      <NicosTransmission locale="en">
        <p>Content</p>
      </NicosTransmission>
    );
    expect(screen.getByText("Nico\u2019s Transmission")).toBeInTheDocument();
  });

  it("renders Spanish label and aria-label for es locale", () => {
    render(
      <NicosTransmission locale="es">
        <p>Content</p>
      </NicosTransmission>
    );
    expect(screen.getByText("La Transmisión de Nico")).toBeInTheDocument();
    expect(screen.getByLabelText("La Transmisión de Nico")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <NicosTransmission locale="en">
        <p>Editorial intro</p>
      </NicosTransmission>
    );
    expect(screen.getByText("Editorial intro")).toBeInTheDocument();
  });

  it("renders signature when provided", () => {
    render(
      <NicosTransmission locale="en" signature="— Nico">
        <p>Content</p>
      </NicosTransmission>
    );
    expect(screen.getByText("— Nico")).toBeInTheDocument();
  });

  it("omits signature when not provided", () => {
    render(
      <NicosTransmission locale="en">
        <p>Content</p>
      </NicosTransmission>
    );
    expect(screen.queryByText(/—/)).not.toBeInTheDocument();
  });
});
