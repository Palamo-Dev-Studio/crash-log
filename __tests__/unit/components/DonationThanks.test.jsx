// ABOUTME: Unit tests for the DonationThanks toast shown after a Stripe checkout redirect.
// ABOUTME: Covers the ?donated=true param, env gating, close button, 10s auto-dismiss, URL cleanup and EN/ES copy.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  setMockPathname,
  setMockSearchParams,
  resetMocks,
  getMockReplace,
} from "../../mocks/next-navigation";

vi.mock("next/navigation", () => import("../../mocks/next-navigation"));

import DonationThanks from "@/components/DonationThanks";

const EN = "Thank you for your donation!";
const ES = "¡Gracias por tu donación!";

describe("DonationThanks", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DONATIONS_ENABLED = "true";
    resetMocks();
    setMockPathname("/en/support");
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_DONATIONS_ENABLED;
    vi.useRealTimers();
  });

  it("shows the toast when donated=true is in the URL", () => {
    setMockSearchParams("donated=true");
    render(<DonationThanks locale="en" />);
    expect(screen.getByText(EN)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows Spanish copy for the es locale", () => {
    setMockSearchParams("donated=true");
    render(<DonationThanks locale="es" />);
    expect(screen.getByText(ES)).toBeInTheDocument();
    expect(screen.getByLabelText("Cerrar")).toBeInTheDocument();
  });

  it("renders nothing without the donated param", () => {
    const { container } = render(<DonationThanks locale="en" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for donated values other than true", () => {
    setMockSearchParams("donated=false");
    const { container } = render(<DonationThanks locale="en" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when NEXT_PUBLIC_DONATIONS_ENABLED is not true", () => {
    delete process.env.NEXT_PUBLIC_DONATIONS_ENABLED;
    setMockSearchParams("donated=true");
    const { container } = render(<DonationThanks locale="en" />);
    expect(container.innerHTML).toBe("");
  });

  it("dismisses on close click and cleans the param from the URL", async () => {
    setMockSearchParams("donated=true");
    const user = userEvent.setup();
    render(<DonationThanks locale="en" />);
    await user.click(screen.getByLabelText("Close"));
    expect(screen.queryByText(EN)).not.toBeInTheDocument();
    expect(getMockReplace()).toHaveBeenCalledWith("/en/support", {
      scroll: false,
    });
  });

  it("auto-dismisses after 10 seconds and cleans the URL", () => {
    vi.useFakeTimers();
    setMockSearchParams("donated=true");
    render(<DonationThanks locale="en" />);
    act(() => {
      vi.advanceTimersByTime(9999);
    });
    expect(screen.getByText(EN)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText(EN)).not.toBeInTheDocument();
    expect(getMockReplace()).toHaveBeenCalledWith("/en/support", {
      scroll: false,
    });
  });
});
