// ABOUTME: Component tests for ArchiveSearch — query input, category pills, empty state, clear button.
// ABOUTME: Verifies filter state changes update the rendered result list.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParamsString = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/archive",
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(mockSearchParamsString),
}));

import ArchiveSearch from "@/components/ArchiveSearch";

const issueItem = {
  id: "issue-1",
  type: "issue",
  publishDate: "2026-04-01",
  title: "Forty Minutes of Exposure",
  subtitle: "What broke this week",
  searchText:
    "forty minutes of exposure what broke this week perplexity oracle",
  fields: {
    titleSubtitle: "forty minutes of exposure what broke this week",
    transmission: "perplexity sued",
    headlines: "perplexity sued by publishers",
    bodies: "oracle settled",
    stackTrace: "",
    columnBody: "",
  },
  categories: [{ slug: "foundation-models", name: "Foundation Models" }],
  raw: {
    issueNumber: 14,
    slug: "issue-014",
    severities: ["ERROR"],
  },
};

const columnItem = {
  id: "column-1",
  type: "column",
  publishDate: "2026-04-04",
  title: "The Ledger Economy",
  subtitle: "On trust",
  searchText: "the ledger economy on trust",
  fields: {
    titleSubtitle: "the ledger economy on trust",
    transmission: "",
    headlines: "",
    bodies: "",
    stackTrace: "",
    columnBody: "the ledger economy is a phrase",
  },
  categories: [],
  raw: {
    columnNumber: 5,
    slug: "2026-04-04",
  },
};

describe("ArchiveSearch", () => {
  const baseProps = {
    items: [columnItem, issueItem],
    categories: [{ slug: "foundation-models", name: "Foundation Models" }],
    locale: "en",
  };

  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockSearchParamsString = "";
  });

  it("renders all items by default", () => {
    render(<ArchiveSearch {...baseProps} />);
    expect(screen.getByText("Forty Minutes of Exposure")).toBeInTheDocument();
    expect(screen.getByText("The Ledger Economy")).toBeInTheDocument();
  });

  it("filters by query input", () => {
    const { container } = render(<ArchiveSearch {...baseProps} />);
    const input = screen.getByLabelText("Search");
    fireEvent.change(input, { target: { value: "ledger" } });
    // Title gets wrapped with <mark> spans, so query the heading by text content.
    const headings = Array.from(container.querySelectorAll("h3")).map(
      (h) => h.textContent
    );
    expect(headings).toContain("The Ledger Economy");
    expect(headings).not.toContain("Forty Minutes of Exposure");
  });

  it("filters by category pill", () => {
    render(<ArchiveSearch {...baseProps} />);
    const pill = screen.getByRole("button", { name: "Foundation Models" });
    fireEvent.click(pill);
    expect(screen.getByText("Forty Minutes of Exposure")).toBeInTheDocument();
    expect(screen.queryByText("The Ledger Economy")).not.toBeInTheDocument();
  });

  it("shows empty state when query has no matches", () => {
    render(<ArchiveSearch {...baseProps} />);
    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "zzznotfound" },
    });
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("clear button resets filters", () => {
    const { container } = render(<ArchiveSearch {...baseProps} />);
    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "ledger" },
    });
    let headings = Array.from(container.querySelectorAll("h3")).map(
      (h) => h.textContent
    );
    expect(headings).not.toContain("Forty Minutes of Exposure");

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    headings = Array.from(container.querySelectorAll("h3")).map(
      (h) => h.textContent
    );
    expect(headings).toContain("Forty Minutes of Exposure");
    expect(headings).toContain("The Ledger Economy");
  });

  it("renders Spanish copy when locale=es", () => {
    render(<ArchiveSearch {...baseProps} locale="es" />);
    expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
  });

  describe("URL state", () => {
    it("seeds the initial query from the URL's q param and renders already filtered", () => {
      mockSearchParamsString = "q=ledger";
      const { container } = render(<ArchiveSearch {...baseProps} />);

      expect(screen.getByLabelText("Search")).toHaveValue("ledger");
      const headings = Array.from(container.querySelectorAll("h3")).map(
        (h) => h.textContent
      );
      expect(headings).toContain("The Ledger Economy");
      expect(headings).not.toContain("Forty Minutes of Exposure");

      // Seeding from the URL must not itself trigger a redundant navigation on mount.
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("syncs the URL via router.replace (not push) after a debounce, not per keystroke", () => {
      vi.useFakeTimers();
      try {
        render(<ArchiveSearch {...baseProps} />);
        const input = screen.getByLabelText("Search");

        // Simulate rapid typing — each keystroke well inside the debounce window.
        for (const partial of ["l", "le", "led", "ledg", "ledge", "ledger"]) {
          fireEvent.change(input, { target: { value: partial } });
          act(() => {
            vi.advanceTimersByTime(100);
          });
        }

        // Still under the debounce window since the last keystroke — no sync yet.
        expect(mockReplace).not.toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(400);
        });

        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith("/en/archive?q=ledger", {
          scroll: false,
        });
        expect(mockPush).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it("removes the q param from the URL when the query is cleared", () => {
      vi.useFakeTimers();
      try {
        mockSearchParamsString = "q=ledger";
        render(<ArchiveSearch {...baseProps} />);

        fireEvent.click(screen.getByRole("button", { name: "Clear" }));
        act(() => {
          vi.advanceTimersByTime(400);
        });

        expect(mockReplace).toHaveBeenCalledWith("/en/archive", {
          scroll: false,
        });
      } finally {
        vi.useRealTimers();
      }
    });

    it("syncs local query FROM the URL when q changes after mount (header search navigation)", () => {
      // The header's search box calls router.push("/en/archive?q=...") while already
      // on this page -- Next re-renders the same component tree in place rather than
      // remounting it, so this must NOT rely on a one-time mount-only seed.
      const { container, rerender } = render(<ArchiveSearch {...baseProps} />);
      expect(screen.getByLabelText("Search")).toHaveValue("");

      mockSearchParamsString = "q=ledger";
      rerender(<ArchiveSearch {...baseProps} />);

      expect(screen.getByLabelText("Search")).toHaveValue("ledger");
      const headings = Array.from(container.querySelectorAll("h3")).map(
        (h) => h.textContent
      );
      expect(headings).toContain("The Ledger Economy");
      expect(headings).not.toContain("Forty Minutes of Exposure");
    });

    it("syncs a real external navigation but ignores the stale echo of its own write", () => {
      // This exercises BOTH halves of the guard in one test on purpose: a sync
      // mechanism that's simply absent would trivially "not clobber" anything, so a
      // clobber-only test can't tell "correctly guarded" apart from "not wired at
      // all." Asserting the external sync fires first rules that out.
      vi.useFakeTimers();
      try {
        const { rerender } = render(<ArchiveSearch {...baseProps} />);
        const input = screen.getByLabelText("Search");

        // Prove the sync path is actually live: an external navigation (the header
        // search box, landing on a q we never typed) must be reflected locally.
        mockSearchParamsString = "q=external";
        rerender(<ArchiveSearch {...baseProps} />);
        expect(input).toHaveValue("external");

        // Now type past that and let our own debounced write fire.
        fireEvent.change(input, { target: { value: "led" } });
        act(() => {
          vi.advanceTimersByTime(400);
        });
        expect(mockReplace).toHaveBeenCalledWith("/en/archive?q=led", {
          scroll: false,
        });

        // Keep typing before that write's navigation round-trips.
        fireEvent.change(input, { target: { value: "ledger" } });

        // The stale echo of OUR OWN earlier write lands -- must not stomp "ledger".
        // A naive "always sync from searchParams" effect (no own-write guard) would
        // revert this back to "led" and fail here.
        mockSearchParamsString = "q=led";
        rerender(<ArchiveSearch {...baseProps} />);
        expect(input).toHaveValue("ledger");
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
