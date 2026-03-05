// ABOUTME: Unit tests for the BeehiivRecommendations env-gated component.
// ABOUTME: Validates render/no-render behavior based on NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL.

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("BeehiivRecommendations", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function importComponent() {
    const mod = await import("@/components/BeehiivRecommendations");
    return mod.default;
  }

  async function renderWithEnv(envValue, locale = "en") {
    if (envValue !== undefined) {
      vi.stubEnv("NEXT_PUBLIC_BEEHIIV_RECOMMENDATIONS_URL", envValue);
    }
    const { render } = await import("@testing-library/react");
    const BeehiivRecommendations = await importComponent();
    return render(<BeehiivRecommendations locale={locale} />);
  }

  it("renders nothing when env var is not set", async () => {
    const { container } = await renderWithEnv(undefined);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when env var is empty string", async () => {
    const { container } = await renderWithEnv("");
    expect(container.innerHTML).toBe("");
  });

  it("renders container div when env var is set", async () => {
    const { container } = await renderWithEnv(
      "https://recommendations.beehiiv.com/test"
    );
    const div = container.querySelector("#beehiiv-recommendations");
    expect(div).not.toBeNull();
  });

  it("sets data-url attribute from env var", async () => {
    const url = "https://recommendations.beehiiv.com/test";
    const { container } = await renderWithEnv(url);
    const div = container.querySelector("#beehiiv-recommendations");
    expect(div.getAttribute("data-url")).toBe(url);
  });

  it("renders heading label in English", async () => {
    const { screen } = await import("@testing-library/react");
    await renderWithEnv("https://recommendations.beehiiv.com/test", "en");
    expect(screen.getByText("Recommended by The Crash Log")).toBeTruthy();
  });

  it("renders heading label in Spanish", async () => {
    const { screen } = await import("@testing-library/react");
    await renderWithEnv("https://recommendations.beehiiv.com/test", "es");
    expect(screen.getByText("Recomendado por The Crash Log")).toBeTruthy();
  });
});
