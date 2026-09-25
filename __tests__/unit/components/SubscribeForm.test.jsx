// ABOUTME: Unit tests for the SubscribeForm client component.
// ABOUTME: Validates idle/expanded states, bilingual labels, and the Substack navigation on valid submit.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SubscribeForm from "@/components/SubscribeForm";

const SUBSTACK_SUBSCRIBE_URL = "https://aicrashlog.substack.com/subscribe";

describe("SubscribeForm", () => {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

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
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
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

  it("navigates to the Substack subscribe URL with the email pre-filled on valid submit", async () => {
    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(screen.getByLabelText("Email"), "hello@crashlog.ai");
    await user.click(screen.getByText("Go"));

    expect(window.location.href).toBe(
      `${SUBSTACK_SUBSCRIBE_URL}?email=hello%40crashlog.ai`
    );
  });

  it("percent-encodes special characters (+ and &) in the email", async () => {
    const user = userEvent.setup();
    render(<SubscribeForm locale="en" />);

    await user.click(screen.getByText("Subscribe"));
    await user.type(
      screen.getByLabelText("Email"),
      "hello+test&more@crashlog.ai"
    );
    await user.click(screen.getByText("Go"));

    expect(window.location.href).toBe(
      `${SUBSTACK_SUBSCRIBE_URL}?email=hello%2Btest%26more%40crashlog.ai`
    );
  });

  it("trims leading/trailing whitespace before navigating", async () => {
    render(<SubscribeForm locale="en" />);

    fireEvent.click(screen.getByText("Subscribe"));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "  hello@crashlog.ai  " },
    });
    fireEvent.submit(screen.getByLabelText("Email").closest("form"));

    expect(window.location.href).toBe(
      `${SUBSTACK_SUBSCRIBE_URL}?email=hello%40crashlog.ai`
    );
  });

  it("navigates regardless of locale (no locale param is sent)", async () => {
    const user = userEvent.setup();
    render(<SubscribeForm locale="es" />);

    await user.click(screen.getByText("Suscríbete"));
    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "hello@crashlog.ai"
    );
    await user.click(screen.getByText("Ir"));

    expect(window.location.href).toBe(
      `${SUBSTACK_SUBSCRIBE_URL}?email=hello%40crashlog.ai`
    );
  });

  it("does not navigate and shows an error for an invalid email", async () => {
    render(<SubscribeForm locale="en" />);

    fireEvent.click(screen.getByText("Subscribe"));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.submit(screen.getByLabelText("Email").closest("form"));

    expect(window.location.href).toBe("");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address."
    );
  });

  it("does not navigate for an empty email", async () => {
    render(<SubscribeForm locale="en" />);

    fireEvent.click(screen.getByText("Subscribe"));
    fireEvent.submit(screen.getByLabelText("Email").closest("form"));

    expect(window.location.href).toBe("");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has close button with correct aria-label in Spanish", async () => {
    const user = userEvent.setup();
    render(<SubscribeForm locale="es" />);

    await user.click(screen.getByText("Suscríbete"));

    expect(
      screen.getByLabelText("Cerrar formulario de suscripción")
    ).toBeInTheDocument();
  });

  it("keeps form open after an invalid-email error, for retry", async () => {
    render(<SubscribeForm locale="en" />);

    fireEvent.click(screen.getByText("Subscribe"));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.submit(screen.getByLabelText("Email").closest("form"));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
  });

  it("defaults to en when locale is not provided", () => {
    render(<SubscribeForm />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });
});
