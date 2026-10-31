// ABOUTME: The beat detail kicker count and the rendered rows come from the same filtered list.
// ABOUTME: Stories with no published issue (orphans) are neither counted nor rendered.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { data } = vi.hoisted(() => ({ data: { current: null } }));

vi.mock("@/lib/queries", async (importOriginal) => ({
  ...(await importOriginal()),
  getCategoryWithStories: vi.fn(async () => data.current),
  getAllCategories: vi.fn(async () => []),
}));

import BeatPage from "@/app/(site)/[locale]/beat/[slug]/page";

const category = { name: { en: "Agents", es: "Agentes" } };
const issue = (n) => ({
  issueNumber: n,
  publishDate: "2026-03-06",
  slug: `issue-${n}`,
});

async function renderBeat(locale = "en") {
  const ui = await BeatPage({
    params: Promise.resolve({ locale, slug: "agents" }),
  });
  return render(ui);
}

describe("beat detail page with orphan stories", () => {
  it("counts and renders only stories that have a published issue", async () => {
    data.current = {
      category,
      stories: [
        { _id: "a", headline: "Kept one", issue: issue(1) },
        { _id: "b", headline: "Orphan story", issue: null },
        { _id: "c", headline: "Kept two", issue: issue(2) },
      ],
    };
    const { container } = await renderBeat();
    expect(screen.getByText(/2 STORIES/)).toBeInTheDocument();
    expect(container.querySelectorAll("a[href*='/issue/']")).toHaveLength(2);
    expect(screen.queryByText("Orphan story")).toBeNull();
  });

  it("shows the empty state and a zero count when every story is an orphan", async () => {
    data.current = {
      category,
      stories: [{ _id: "b", headline: "Orphan story", issue: null }],
    };
    await renderBeat();
    expect(screen.getByText(/0 STORIES/)).toBeInTheDocument();
    expect(
      screen.getByText("No stories in this beat yet.")
    ).toBeInTheDocument();
  });
});
