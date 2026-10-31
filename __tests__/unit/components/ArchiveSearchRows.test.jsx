// ABOUTME: Component tests for the archive's file-row results: every series shows code chip, date, title and byline.
// ABOUTME: Also covers subtitle highlighting, the matched-in line and the visible search and filter labels.

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/archive",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(""),
}));

import ArchiveSearch from "@/components/ArchiveSearch";

const base = { transmission: "", headlines: "", bodies: "", stackTrace: "" };

const items = [
  {
    id: "p1",
    type: "practical",
    publishDate: "2026-04-05",
    title: "Audit Your Agent",
    subtitle: "Five checks",
    searchText: "audit your agent five checks rotate the keys",
    fields: {
      ...base,
      titleSubtitle: "audit your agent five checks",
      columnBody: "",
      practicalBody: "rotate the keys",
    },
    categories: [],
    raw: { practicalNumber: 1, slug: "audit-your-agent", byline: "Ana Ruiz" },
  },
  {
    id: "c1",
    type: "column",
    publishDate: "2026-04-04",
    title: "The Ledger Economy",
    subtitle: "",
    searchText: "the ledger economy",
    fields: { ...base, titleSubtitle: "the ledger economy", columnBody: "" },
    categories: [],
    raw: { columnNumber: 5, slug: "2026-04-04" },
  },
  {
    id: "i1",
    type: "issue",
    publishDate: "2026-04-01",
    title: "Forty Minutes",
    subtitle: "",
    searchText: "forty minutes",
    fields: { ...base, titleSubtitle: "forty minutes", columnBody: "" },
    categories: [{ slug: "models", name: "Models" }],
    raw: { issueNumber: 14, slug: "issue-014", byline: "newsroom" },
  },
];

const props = {
  items,
  categories: [{ slug: "models", name: "Models" }],
  locale: "en",
};

describe("ArchiveSearch file rows", () => {
  it("shows a series code, date, byline and route for every series", () => {
    render(<ArchiveSearch {...props} />);
    const rows = screen.getAllByRole("link");
    expect(rows).toHaveLength(3);

    expect(within(rows[0]).getByText("FIX-001")).toBeInTheDocument();
    expect(within(rows[0]).getByText(/By Ana Ruiz/)).toBeInTheDocument();
    expect(rows[0]).toHaveAttribute("href", "/en/practical/audit-your-agent");

    expect(within(rows[1]).getByText("NOTE-005")).toBeInTheDocument();
    expect(within(rows[1]).getByText(/By Nico von Bot/)).toBeInTheDocument();
    expect(rows[1]).toHaveAttribute("href", "/en/nico/2026-04-04");

    expect(within(rows[2]).getByText("OTR-014")).toBeInTheDocument();
    expect(
      within(rows[2]).getByText(/By The Crash Log newsroom/)
    ).toBeInTheDocument();
    expect(within(rows[2]).getByText("Apr 1, 2026")).toBeInTheDocument();
    expect(rows[2]).toHaveAttribute("href", "/en/issue/issue-014");
  });

  it("highlights a subtitle-only hit and shows the matched-in line for body hits", () => {
    const { container } = render(<ArchiveSearch {...props} />);
    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "checks" },
    });
    expect(container.querySelector("mark")).toHaveTextContent("checks");

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "rotate" },
    });
    expect(screen.getByText("matched in: practical body")).toBeInTheDocument();
  });

  it("labels the search box and the beat filter visibly", () => {
    render(<ArchiveSearch {...props} />);
    const label = screen.getByText("Search", { selector: "label" });
    expect(label).toHaveAttribute("for", screen.getByRole("searchbox").id);
    expect(screen.getByText("Filter by beat")).toBeInTheDocument();
  });

  it("renders Spanish filter copy", () => {
    render(<ArchiveSearch {...props} locale="es" />);
    expect(screen.getByText("Filtrar por sección")).toBeInTheDocument();
    expect(screen.getAllByText(/Por /).length).toBeGreaterThan(0);
  });
});
