// ABOUTME: Unit tests for SupportContent — the dedicated support/donation page component.
// ABOUTME: Validates preset amounts, frequency toggle, custom input, form submission, and bilingual labels.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setMockPathname, resetMocks } from "../../mocks/next-navigation";

vi.mock("next/navigation", () => import("../../mocks/next-navigation"));

import SupportContent from "@/components/SupportContent";

describe("SupportContent", () => {
  beforeEach(() => {
    resetMocks();
    setMockPathname("/en/support");
    global.fetch = vi.fn();
  });

  afterEach(() => {
    if (global.fetch?.mockRestore) global.fetch.mockRestore();
  });

  describe("page structure", () => {
    it("renders the page heading", () => {
      render(<SupportContent locale="en" />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Feed the Bots"
      );
    });

    it("renders mission copy about running bots", () => {
      render(<SupportContent locale="en" />);
      expect(screen.getByText(/tokens/i)).toBeInTheDocument();
    });

    it("renders tax disclaimer", () => {
      render(<SupportContent locale="en" />);
      expect(
        screen.getByText("Contributions are not tax-deductible.")
      ).toBeInTheDocument();
    });

    it("renders as a main content section with aria-label", () => {
      render(<SupportContent locale="en" />);
      expect(screen.getByLabelText(/support/i)).toBeInTheDocument();
    });
  });

  describe("preset amounts", () => {
    it("renders $5, $10, and $25 preset buttons", () => {
      render(<SupportContent locale="en" />);
      expect(screen.getByRole("button", { name: "$5" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "$10" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "$25" })).toBeInTheDocument();
    });

    it("selects $5 preset by default", () => {
      render(<SupportContent locale="en" />);
      expect(screen.getByRole("button", { name: "$5" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    it("selects a preset when clicked and deselects others", async () => {
      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      await user.click(screen.getByRole("button", { name: "$25" }));

      expect(screen.getByRole("button", { name: "$25" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      expect(screen.getByRole("button", { name: "$5" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("populates the amount input when a preset is clicked", async () => {
      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      await user.click(screen.getByRole("button", { name: "$25" }));

      const input = screen.getByLabelText("Custom amount in dollars");
      expect(input).toHaveValue(25);
    });
  });

  describe("custom amount", () => {
    it("renders a custom amount input", () => {
      render(<SupportContent locale="en" />);
      expect(
        screen.getByLabelText("Custom amount in dollars")
      ).toBeInTheDocument();
    });

    it("deselects presets when custom amount is typed", async () => {
      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      const input = screen.getByLabelText("Custom amount in dollars");
      await user.clear(input);
      await user.type(input, "42");

      // All presets should be deselected
      expect(screen.getByRole("button", { name: "$5" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      expect(screen.getByRole("button", { name: "$10" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      expect(screen.getByRole("button", { name: "$25" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });
  });

  describe("frequency toggle", () => {
    it("renders One-time and Monthly toggle buttons", () => {
      render(<SupportContent locale="en" />);
      expect(
        screen.getByRole("button", { name: "One-time" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Monthly" })
      ).toBeInTheDocument();
    });

    it("defaults to one-time frequency", () => {
      render(<SupportContent locale="en" />);
      expect(screen.getByRole("button", { name: "One-time" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      expect(screen.getByRole("button", { name: "Monthly" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("switches to monthly when clicked", async () => {
      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      await user.click(screen.getByRole("button", { name: "Monthly" }));

      expect(screen.getByRole("button", { name: "Monthly" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      expect(screen.getByRole("button", { name: "One-time" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });
  });

  describe("form submission", () => {
    it("sends correct one-time payload with preset amount", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            url: "https://checkout.stripe.com/test",
          }),
      });

      const originalLocation = window.location;
      delete window.location;
      window.location = { href: "" };

      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      // Default is $5, one-time
      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      expect(global.fetch).toHaveBeenCalledWith("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 500,
          locale: "en",
          returnPath: "/en/support",
          frequency: "once",
        }),
      });

      window.location = originalLocation;
    });

    it("sends monthly frequency when monthly is selected", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            url: "https://checkout.stripe.com/test",
          }),
      });

      const originalLocation = window.location;
      delete window.location;
      window.location = { href: "" };

      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      await user.click(screen.getByRole("button", { name: "Monthly" }));
      await user.click(screen.getByRole("button", { name: "$10" }));
      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(callBody.frequency).toBe("monthly");
      expect(callBody.amount).toBe(1000);

      window.location = originalLocation;
    });

    it("shows loading state during submission", async () => {
      let resolvePromise;
      global.fetch.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      expect(screen.getByText("Processing\u2026")).toBeInTheDocument();

      resolvePromise({
        ok: true,
        json: () => Promise.resolve({ success: false, error: "test" }),
      });
    });

    it("shows error on API failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      await user.click(screen.getByRole("button", { name: "Feed the Bots" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Something went wrong. Try again."
        );
      });
    });

    it("rejects amount below $3 on client side", async () => {
      const user = userEvent.setup();
      render(<SupportContent locale="en" />);

      const input = screen.getByLabelText("Custom amount in dollars");
      await user.clear(input);
      await user.type(input, "2");

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

  describe("Spanish locale", () => {
    it("renders Spanish heading", () => {
      render(<SupportContent locale="es" />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Alimenta a los Bots"
      );
    });

    it("renders Spanish frequency toggle labels", () => {
      render(<SupportContent locale="es" />);
      expect(
        screen.getByRole("button", { name: "Una vez" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Mensual" })
      ).toBeInTheDocument();
    });

    it("renders Spanish submit button", () => {
      render(<SupportContent locale="es" />);
      expect(
        screen.getByRole("button", { name: "Alimenta a los Bots" })
      ).toBeInTheDocument();
    });

    it("renders Spanish disclaimer", () => {
      render(<SupportContent locale="es" />);
      expect(
        screen.getByText("Las contribuciones no son deducibles de impuestos.")
      ).toBeInTheDocument();
    });
  });
});
