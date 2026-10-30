// ABOUTME: Unit tests for DonatePrompt, the site-wide donation slot rendered above the footer.
// ABOUTME: Covers the flag gate and the /support exclusion (that page is the donation page).

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { setMockPathname, resetMocks } from "../../mocks/next-navigation";

vi.mock("next/navigation", () => import("../../mocks/next-navigation"));

import DonatePrompt from "@/components/DonatePrompt";

describe("DonatePrompt", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DONATIONS_ENABLED = "true";
    resetMocks();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_DONATIONS_ENABLED;
  });

  it.each(["/en", "/es/archive", "/en/issue/some-slug", "/en/supporters"])(
    "renders the donation prompt on %s",
    (path) => {
      setMockPathname(path);
      render(<DonatePrompt locale="en" />);
      expect(screen.getByLabelText("Donate")).toBeInTheDocument();
    }
  );

  it.each(["/en/support", "/es/support", "/en/support/"])(
    "renders nothing on the support page %s",
    (path) => {
      setMockPathname(path);
      const { container } = render(<DonatePrompt locale="en" />);
      expect(container.innerHTML).toBe("");
    }
  );

  it("renders nothing when the donations flag is off", () => {
    process.env.NEXT_PUBLIC_DONATIONS_ENABLED = "false";
    setMockPathname("/en");
    const { container } = render(<DonatePrompt locale="en" />);
    expect(container.innerHTML).toBe("");
  });

  it("passes the locale through", () => {
    setMockPathname("/es");
    render(<DonatePrompt locale="es" />);
    expect(screen.getByLabelText("Donar")).toBeInTheDocument();
  });
});
