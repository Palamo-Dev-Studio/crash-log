// ABOUTME: Unit tests for SiteBottom component.
// ABOUTME: Validates the subscribe banner link points at Substack in both locales.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";

vi.mock("next/navigation", () => import("../../mocks/next-navigation"));

import SiteBottom from "@/components/SiteBottom";

describe("SiteBottom subscribe banner", () => {
  it("links English Subscribe to the Substack subscribe URL", () => {
    render(<SiteBottom locale="en" />);
    expect(screen.getByRole("link", { name: "Subscribe" })).toHaveAttribute(
      "href",
      SUBSTACK_SUBSCRIBE_URL
    );
  });

  it("links Spanish Suscríbete to the Substack subscribe URL", () => {
    render(<SiteBottom locale="es" />);
    expect(screen.getByRole("link", { name: "Suscríbete" })).toHaveAttribute(
      "href",
      SUBSTACK_SUBSCRIBE_URL
    );
  });
});
