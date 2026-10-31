// ABOUTME: Unit tests for the DonationThanks toast shown after a Stripe checkout redirect.
// ABOUTME: Covers the ?donated=true param, env gating, close button, persistence until closed, URL cleanup and EN/ES copy.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
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

  it("renders only an empty live region without the donated param", () => {
    render(<DonationThanks locale="en" />);
    const region = screen.getByRole("status");
    expect(region).toBeEmptyDOMElement();
    expect(screen.queryByText(EN)).not.toBeInTheDocument();
  });

  it("renders only an empty live region for donated values other than true", () => {
    setMockSearchParams("donated=false");
    render(<DonationThanks locale="en" />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
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

  it("stays until closed: no auto-dismiss, focus and URL untouched", () => {
    vi.useFakeTimers();
    const prior = document.createElement("button");
    document.body.appendChild(prior);
    prior.focus();
    setMockSearchParams("donated=true");
    render(<DonationThanks locale="en" />);
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.getByText(EN)).toBeInTheDocument();
    expect(prior).toHaveFocus();
    expect(getMockReplace()).not.toHaveBeenCalled();
    prior.remove();
  });

  describe("live region", () => {
    it("is in the server HTML, empty, even when donated=true", () => {
      setMockSearchParams("donated=true");
      const html = renderToString(<DonationThanks locale="en" />);
      expect(html).toMatch(/role="status"/);
      expect(html).toMatch(/aria-live="polite"/);
      expect(html).not.toContain(EN);
    });

    it("is filled after hydration inside the same region element", async () => {
      setMockSearchParams("donated=true");
      const container = document.createElement("div");
      document.body.appendChild(container);
      container.innerHTML = renderToString(<DonationThanks locale="en" />);
      const serverRegion = container.querySelector('[role="status"]');
      expect(serverRegion).not.toBeNull();
      expect(serverRegion.textContent).toBe("");
      const { hydrateRoot } = await import("react-dom/client");
      let root;
      await act(async () => {
        root = hydrateRoot(container, <DonationThanks locale="en" />);
      });
      const region = container.querySelector('[role="status"]');
      expect(region).toBe(serverRegion);
      expect(region.textContent).toContain(EN);
      act(() => root.unmount());
      container.remove();
    });
  });

  describe("focus on Close", () => {
    afterEach(() => {
      document.getElementById("main-content")?.remove();
    });

    function addMain() {
      const main = document.createElement("div");
      main.id = "main-content";
      main.tabIndex = -1;
      document.body.appendChild(main);
      return main;
    }

    it("moves focus to #main-content when nothing was focused before", async () => {
      const main = addMain();
      setMockSearchParams("donated=true");
      const user = userEvent.setup();
      render(<DonationThanks locale="en" />);
      await user.click(screen.getByLabelText("Close"));
      expect(main).toHaveFocus();
    });

    it("returns focus to the previously focused element when there was one", async () => {
      const main = addMain();
      const prior = document.createElement("button");
      prior.textContent = "prior";
      document.body.appendChild(prior);
      prior.focus();
      setMockSearchParams("donated=true");
      const user = userEvent.setup();
      render(<DonationThanks locale="en" />);
      await user.click(screen.getByLabelText("Close"));
      expect(prior).toHaveFocus();
      expect(main).not.toHaveFocus();
      prior.remove();
    });
  });
});
