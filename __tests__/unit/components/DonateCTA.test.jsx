// ABOUTME: Unit tests for DonateCTA client component.
// ABOUTME: Validates amount form, env gating, loading/error/thank-you states, and API interaction.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  setMockPathname,
  setMockSearchParams,
  resetMocks,
} from "../../mocks/next-navigation";

vi.mock("next/navigation", () => import("../../mocks/next-navigation"));

import DonateCTA from "@/components/DonateCTA";

describe("DonateCTA", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DONATIONS_ENABLED = "true";
    resetMocks();
    setMockPathname("/en");
    global.fetch = vi.fn();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_DONATIONS_ENABLED;
    if (global.fetch?.mockRestore) global.fetch.mockRestore();
  });

  describe("env gating", () => {
    it("renders nothing when NEXT_PUBLIC_DONATIONS_ENABLED is not set", () => {
      delete process.env.NEXT_PUBLIC_DONATIONS_ENABLED;
      const { container } = render(<DonateCTA locale="en" />);
      expect(container.innerHTML).toBe("");
    });

    it("renders nothing when NEXT_PUBLIC_DONATIONS_ENABLED is not 'true'", () => {
      process.env.NEXT_PUBLIC_DONATIONS_ENABLED = "false";
      const { container } = render(<DonateCTA locale="en" />);
      expect(container.innerHTML).toBe("");
    });

    it("renders card when NEXT_PUBLIC_DONATIONS_ENABLED is 'true'", () => {
      render(<DonateCTA locale="en" />);
      expect(screen.getByLabelText("Donate")).toBeInTheDocument();
    });
  });

  describe("default state", () => {
    it("renders amount input with default value of 5", () => {
      render(<DonateCTA locale="en" />);
      const input = screen.getByLabelText("Donation amount in dollars");
      expect(input).toHaveValue(5);
    });

    it("renders the submit button", () => {
      render(<DonateCTA locale="en" />);
      expect(
        screen.getByRole("button", { name: "Feed the Bots" })
      ).toBeInTheDocument();
    });

    it("renders copy text about Nico", () => {
      render(<DonateCTA locale="en" />);
      expect(screen.getByText(/Nico and the AI team/)).toBeInTheDocument();
    });

    it("renders tax disclaimer", () => {
      render(<DonateCTA locale="en" />);
      expect(
        screen.getByText("Contributions are not tax-deductible.")
      ).toBeInTheDocument();
    });

    it("renders dollar sign prefix", () => {
      render(<DonateCTA locale="en" />);
      expect(screen.getByText("$")).toBeInTheDocument();
    });

    it("renders as a section with aria-label", () => {
      render(<DonateCTA locale="en" />);
      expect(screen.getByLabelText("Donate")).toBeInTheDocument();
    });
  });

  describe("Spanish locale", () => {
    it("renders Spanish button text", () => {
      render(<DonateCTA locale="es" />);
      expect(
        screen.getByRole("button", { name: "Alimenta a los Bots" })
      ).toBeInTheDocument();
    });

    it("renders Spanish aria-label", () => {
      render(<DonateCTA locale="es" />);
      expect(screen.getByLabelText("Donar")).toBeInTheDocument();
    });

    it("renders Spanish copy", () => {
      render(<DonateCTA locale="es" />);
      expect(screen.getByText(/Nico y el equipo de IA/)).toBeInTheDocument();
    });

    it("renders Spanish disclaimer", () => {
      render(<DonateCTA locale="es" />);
      expect(
        screen.getByText("Las contribuciones no son deducibles de impuestos.")
      ).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("sends correct payload to /api/donate", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            url: "https://checkout.stripe.com/test",
          }),
      });

      // Prevent actual redirect
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: "" };

      const user = userEvent.setup();
      render(<DonateCTA locale="en" />);

      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      expect(global.fetch).toHaveBeenCalledWith("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 500,
          locale: "en",
          returnPath: "/en",
        }),
      });

      // Restore
      window.location = originalLocation;
    });

    it("shows loading state on submit", async () => {
      let resolvePromise;
      global.fetch.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const user = userEvent.setup();
      render(<DonateCTA locale="en" />);

      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      expect(screen.getByText("Processing\u2026")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Processing\u2026" })
      ).toBeDisabled();

      // Cleanup: resolve the pending fetch
      resolvePromise({
        ok: true,
        json: () => Promise.resolve({ success: false, error: "test" }),
      });
    });

    it("redirects to Stripe URL on success", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            url: "https://checkout.stripe.com/pay_test",
          }),
      });

      const originalLocation = window.location;
      delete window.location;
      window.location = { href: "" };

      const user = userEvent.setup();
      render(<DonateCTA locale="en" />);

      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      await waitFor(() => {
        expect(window.location.href).toBe(
          "https://checkout.stripe.com/pay_test"
        );
      });

      window.location = originalLocation;
    });

    it("shows error on API failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: false, error: "Payment service error" }),
      });

      const user = userEvent.setup();
      render(<DonateCTA locale="en" />);

      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Payment service error"
        );
      });
    });

    it("shows error on non-ok HTTP response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Internal Server Error" }),
      });

      const user = userEvent.setup();
      render(<DonateCTA locale="en" />);

      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Something went wrong. Try again."
        );
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("shows error on network failure", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const user = userEvent.setup();
      render(<DonateCTA locale="en" />);

      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Something went wrong. Try again."
        );
      });
    });

    it("rejects amount below $3 on client side", async () => {
      const user = userEvent.setup();
      render(<DonateCTA locale="en" />);

      const input = screen.getByLabelText("Donation amount in dollars");
      await user.clear(input);
      await user.type(input, "2");

      // Use fireEvent.submit to bypass jsdom native min validation
      const form = screen
        .getByRole("button", { name: "Feed the Bots" })
        .closest("form");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("thank-you toast", () => {
    it("shows toast when donated=true is in URL", () => {
      setMockSearchParams("donated=true");
      render(<DonateCTA locale="en" />);

      expect(
        screen.getByText("Thank you for your donation!")
      ).toBeInTheDocument();
    });

    it("shows Spanish thank-you toast for es locale", () => {
      setMockSearchParams("donated=true");
      render(<DonateCTA locale="es" />);

      expect(
        screen.getByText("\u00a1Gracias por tu donaci\u00f3n!")
      ).toBeInTheDocument();
    });

    it("still shows form alongside toast", () => {
      setMockSearchParams("donated=true");
      render(<DonateCTA locale="en" />);

      expect(
        screen.getByLabelText("Donation amount in dollars")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Thank you for your donation!")
      ).toBeInTheDocument();
    });

    it("dismisses toast when close button is clicked", async () => {
      setMockSearchParams("donated=true");
      const user = userEvent.setup();
      render(<DonateCTA locale="en" />);

      expect(
        screen.getByText("Thank you for your donation!")
      ).toBeInTheDocument();

      await user.click(screen.getByLabelText("Close"));

      expect(
        screen.queryByText("Thank you for your donation!")
      ).not.toBeInTheDocument();
    });

    it("auto-dismisses toast after 10 seconds", () => {
      vi.useFakeTimers();
      setMockSearchParams("donated=true");
      render(<DonateCTA locale="en" />);

      expect(
        screen.getByText("Thank you for your donation!")
      ).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(
        screen.queryByText("Thank you for your donation!")
      ).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
