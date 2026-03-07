// ABOUTME: Unit tests for the SubscribeForm client component.
// ABOUTME: Validates idle/expanded/loading/success/error states and bilingual labels.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import SubscribeForm from "@/components/SubscribeForm";

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn();
  mockPush.mockReset();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("SubscribeForm", () => {
  it("renders Subscribe button in idle state", () => {
    render(<SubscribeForm locale="en" />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("renders Spanish label for es locale", () => {
    render(<SubscribeForm locale="es" />);
    expect(screen.getByText("Suscríbete")).toBeInTheDocument();
  });

  it("expands to show email input on click", async () => {
    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
  });

  it("shows Spanish placeholder and labels when expanded in es locale", async () => {
    const user = userEvent.setup();
    render(<SubscribeForm locale="es" />);

    await user.click(screen.getByText("Suscríbete"));

    expect(screen.getByPlaceholderText("tu@correo.com")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Correo electr\u00F3nico")
    ).toBeInTheDocument();
    expect(screen.getByText("Ir")).toBeInTheDocument();
  });

  it("collapses back to trigger on close button click", async () => {
    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    expect(screen.getByLabelText("Email")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Close subscribe form"));
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  it("shows success message on successful subscription", async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByText("Go"));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("You\u2019re in!");
    });
  });

  it("shows already subscribed message for duplicate emails", async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, alreadySubscribed: true }),
    });

    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByText("Go"));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Already subscribed!"
      );
    });
  });

  it("shows error message on API failure", async () => {
    global.fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({ success: false, error: "Failed to subscribe" }),
    });

    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByText("Go"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong. Try again."
      );
    });
  });

  it("shows error message on network failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByText("Go"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong. Try again."
      );
    });
  });

  it("shows loading state while submitting", async () => {
    let resolvePromise;
    global.fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByText("Go"));

    expect(screen.getByText("Sending\u2026")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeDisabled();

    resolvePromise({
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("sends correct fetch payload", async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(screen.getByLabelText("Email"), "hello@crashlog.ai");
    await user.click(screen.getByText("Go"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "hello@crashlog.ai", locale: "en" }),
      });
    });
  });

  it("includes locale in request body for Spanish", async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<SubscribeForm locale="es" />);

    await user.click(screen.getByText("Suscríbete"));
    await user.type(
      screen.getByLabelText("Correo electr\u00F3nico"),
      "hello@crashlog.ai"
    );
    await user.click(screen.getByText("Ir"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "hello@crashlog.ai", locale: "es" }),
      });
    });
  });

  it("has close button with correct aria-label in Spanish", async () => {
    const user = userEvent.setup();
    render(<SubscribeForm locale="es" />);

    await user.click(screen.getByText("Suscríbete"));

    expect(
      screen.getByLabelText("Cerrar formulario de suscripción")
    ).toBeInTheDocument();
  });

  it("keeps form open on error for retry", async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: "Failed" }),
    });

    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByText("Go"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
  });

  it("defaults to en when locale is not provided", () => {
    render(<SubscribeForm />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  describe("redirect behavior", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("redirects to /en/subscribe/thank-you after 1.5s on new subscription", async () => {
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });

      render(<SubscribeForm locale="en" />);

      // Use fireEvent instead of userEvent to avoid timer conflicts
      fireEvent.click(screen.getByText("Subscribe"));
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      });
      await act(async () => {
        fireEvent.submit(screen.getByLabelText("Email").closest("form"));
      });

      // Flush microtasks so fetch resolves and state updates
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(screen.getByRole("status")).toHaveTextContent("You\u2019re in!");
      expect(mockPush).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(mockPush).toHaveBeenCalledWith("/en/subscribe/thank-you");
    });

    it("redirects to /es/subscribe/thank-you for Spanish locale", async () => {
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });

      render(<SubscribeForm locale="es" />);

      fireEvent.click(screen.getByText("Suscríbete"));
      fireEvent.change(screen.getByLabelText("Correo electr\u00F3nico"), {
        target: { value: "test@example.com" },
      });
      await act(async () => {
        fireEvent.submit(
          screen.getByLabelText("Correo electr\u00F3nico").closest("form")
        );
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(screen.getByRole("status")).toHaveTextContent("\u00A1Listo!");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(mockPush).toHaveBeenCalledWith("/es/subscribe/thank-you");
    });

    it("does NOT redirect for already-subscribed users", async () => {
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, alreadySubscribed: true }),
      });

      render(<SubscribeForm locale="en" />);

      fireEvent.click(screen.getByText("Subscribe"));
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      });
      await act(async () => {
        fireEvent.submit(screen.getByLabelText("Email").closest("form"));
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(screen.getByRole("status")).toHaveTextContent(
        "Already subscribed!"
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
