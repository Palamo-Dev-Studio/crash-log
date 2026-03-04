// ABOUTME: Unit tests for NicosTransmission component.
// ABOUTME: Validates editorial intro card structure and optional signature.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NicosTransmission from "@/components/NicosTransmission";

describe("NicosTransmission", () => {
  it("renders as an aside with aria-label", () => {
    render(
      <NicosTransmission>
        <p>Test content</p>
      </NicosTransmission>
    );
    expect(
      screen.getByLabelText("Nico's Transmission")
    ).toBeInTheDocument();
  });

  it("renders the label text", () => {
    render(
      <NicosTransmission>
        <p>Content</p>
      </NicosTransmission>
    );
    expect(screen.getByText("Nico's Transmission")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <NicosTransmission>
        <p>Editorial intro</p>
      </NicosTransmission>
    );
    expect(screen.getByText("Editorial intro")).toBeInTheDocument();
  });

  it("renders signature when provided", () => {
    render(
      <NicosTransmission signature="— Nico">
        <p>Content</p>
      </NicosTransmission>
    );
    expect(screen.getByText("— Nico")).toBeInTheDocument();
  });

  it("omits signature when not provided", () => {
    render(
      <NicosTransmission>
        <p>Content</p>
      </NicosTransmission>
    );
    expect(screen.queryByText(/—/)).not.toBeInTheDocument();
  });
});
