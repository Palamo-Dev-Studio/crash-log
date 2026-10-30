// ABOUTME: Unit tests for the home page components: FileChip, HomeCover, HomeRail, RecentFiles and HomeFiles.
// ABOUTME: Fixtures hold several docs per series with distinct dates; bylines compare against getByline, never a hard-coded fallback.

import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt, priority, ...props }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));
vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width() {
      return this;
    },
    height() {
      return this;
    },
    format() {
      return this;
    },
    url: () => "https://cdn.sanity.io/test.webp",
  }),
}));

import FileChip from "@/components/FileChip";
import HomeCover from "@/components/HomeCover";
import HomeRail from "@/components/HomeRail";
import RecentFiles from "@/components/RecentFiles";
import HomeFiles from "@/components/HomeFiles";
import { selectHomeFiles } from "@/lib/homeFiles";
import { getByline } from "@/lib/series";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";
import { formatDate } from "@/lib/formatDate";

const words = (n) => Array.from({ length: n }, () => "word").join(" ");

const ISSUE = {
  _id: "i1",
  _type: "issue",
  slug: "otr-44",
  issueNumber: 44,
  publishDate: "2026-11-02T00:00:00Z",
  byline: "Hector Luis Alamo",
  title: { en: "Four times AI failed", es: "Cuatro veces que la IA falló" },
  subtitle: { en: "Issue dek", es: "Subtítulo del número" },
  reading: { en: words(460), es: words(460) },
};
const COLUMN = {
  _id: "c1",
  _type: "column",
  slug: "2026-11-06",
  columnNumber: 22,
  publishDate: "2026-11-06T00:00:00Z",
  title: { en: "All the Powers of an Owner", es: "Todos los poderes" },
  subtitle: { en: "Column dek", es: "Subtítulo de la columna" },
  coverImage: { _type: "image", asset: { _ref: "image-abc-10x10-png" } },
  coverImageAlt: { en: "Three doors", es: "Tres puertas" },
  reading: { en: words(1150), es: words(1150) },
};
const PRACTICAL = {
  _id: "p1",
  _type: "practical",
  slug: "inbox-brief",
  practicalNumber: 12,
  publishDate: "2026-11-04T00:00:00Z",
  byline: "Hector Luis Alamo",
  title: { en: "Turn your inbox into a brief", es: "Convierte tu bandeja" },
};
const OLDER = [
  {
    ...COLUMN,
    _id: "c0",
    slug: "2026-10-30",
    columnNumber: 21,
    publishDate: "2026-10-30T00:00:00Z",
    coverImage: null,
    title: { en: "What the Model Left Out", es: "Lo que el modelo omitió" },
  },
  {
    ...ISSUE,
    _id: "i0",
    slug: "otr-43",
    issueNumber: 43,
    publishDate: "2026-10-26T00:00:00Z",
    title: { en: "Three agents acted early", es: "Tres agentes" },
  },
];

describe("FileChip", () => {
  it("renders the file code with the series colour class per series", () => {
    const { container: a } = render(<FileChip doc={ISSUE} />);
    const { container: b } = render(<FileChip doc={PRACTICAL} />);
    const { container: c } = render(<FileChip doc={COLUMN} />);
    expect(a.textContent).toBe("OTR-044");
    expect(b.textContent).toBe("FIX-012");
    expect(c.textContent).toBe("NOTE-022");
    const cls = [a, b, c].map((x) => x.firstChild.className);
    expect(cls[0]).toMatch(/otr/);
    expect(cls[1]).toMatch(/fix/);
    expect(cls[2]).toMatch(/note/);
    expect(new Set(cls).size).toBe(3);
  });

  it("uses the chip class for the chip variant and not for plain", () => {
    const { container: chip } = render(<FileChip doc={ISSUE} />);
    const { container: plain } = render(
      <FileChip doc={ISSUE} variant="plain" />
    );
    expect(chip.firstChild.className).toMatch(/chip/);
    expect(plain.firstChild.className).not.toMatch(/chip/);
  });

  it("renders nothing for an unknown type or a doc with no number", () => {
    const { container } = render(
      <FileChip doc={{ _type: "story", issueNumber: 1 }} />
    );
    expect(container).toBeEmptyDOMElement();
    const { container: c2 } = render(
      <FileChip doc={{ _type: "issue", issueNumber: null }} />
    );
    expect(c2).toBeEmptyDOMElement();
  });
});

describe("HomeCover", () => {
  it("renders chip, series name, byline, date, reading time, H1, dek and cue in EN", () => {
    render(<HomeCover doc={COLUMN} locale="en" />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "All the Powers of an Owner",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("NOTE-022")).toBeInTheDocument();
    expect(screen.getByText("Nico’s Notes")).toBeInTheDocument();
    expect(
      screen.getByText(`By ${getByline(COLUMN, "en")}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatDate(COLUMN.publishDate, "en", "long"))
    ).toBeInTheDocument();
    expect(screen.getByText("5 min read")).toBeInTheDocument();
    expect(screen.getByText("Column dek")).toBeInTheDocument();
    expect(screen.getByText(/Read the file/)).toBeInTheDocument();
  });

  it("renders Spanish strings", () => {
    render(<HomeCover doc={COLUMN} locale="es" />);
    expect(screen.getByText("Notas de Nico")).toBeInTheDocument();
    expect(
      screen.getByText(`Por ${getByline(COLUMN, "es")}`)
    ).toBeInTheDocument();
    expect(screen.getByText("5 min de lectura")).toBeInTheDocument();
    expect(screen.getByText(/Leer el expediente/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Todos los poderes" })
    ).toBeInTheDocument();
  });

  it("links the whole hero to the file by series", () => {
    const { unmount } = render(<HomeCover doc={COLUMN} locale="en" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/nico/2026-11-06"
    );
    unmount();
    render(<HomeCover doc={ISSUE} locale="es" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/es/issue/otr-44"
    );
  });

  it("names the hero link by the title alone, with no nested interactive elements", () => {
    const { container } = render(<HomeCover doc={COLUMN} locale="en" />);
    const link = screen.getByRole("link", {
      name: "All the Powers of an Owner",
    });
    expect(link).toBe(screen.getByRole("link"));
    expect(
      link.querySelectorAll("a, button, input, select, textarea, [tabindex]")
    ).toHaveLength(0);
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("uses an issue's explicit byline and a column's Nico von Bot", () => {
    const { unmount } = render(<HomeCover doc={ISSUE} locale="en" />);
    expect(screen.getByText("By Hector Luis Alamo")).toBeInTheDocument();
    unmount();
    render(<HomeCover doc={COLUMN} locale="en" />);
    expect(screen.getByText("By Nico von Bot")).toBeInTheDocument();
  });

  it("renders the cover image with its localized alt, and no img without one", () => {
    const { unmount } = render(<HomeCover doc={COLUMN} locale="es" />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Tres puertas");
    unmount();
    render(<HomeCover doc={ISSUE} locale="en" />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("omits reading time when the doc has no text", () => {
    render(<HomeCover doc={PRACTICAL} locale="en" />);
    expect(screen.queryByText(/min read/)).toBeNull();
  });
});

describe("HomeRail", () => {
  const selection = selectHomeFiles([ISSUE, COLUMN, PRACTICAL, ...OLDER]);

  it("lists one entry per series, each with chip, date, title and byline", () => {
    render(<HomeRail rail={selection.rail} locale="en" />);
    const links = screen
      .getAllByRole("link")
      .filter(
        (l) =>
          l.getAttribute("href").startsWith("/en/") &&
          !l.getAttribute("href").includes("substack")
      );
    expect(links).toHaveLength(3);
    expect(screen.getByText("OTR-044")).toBeInTheDocument();
    expect(screen.getByText("FIX-012")).toBeInTheDocument();
    expect(screen.getByText("NOTE-022")).toBeInTheDocument();
    expect(screen.getByText("Nov 2")).toBeInTheDocument();
    expect(
      screen.getByText("Turn your inbox into a brief")
    ).toBeInTheDocument();
    expect(screen.getAllByText(`By ${getByline(COLUMN, "en")}`)).toHaveLength(
      1
    );
  });

  it("omits a series with no file", () => {
    const sel = selectHomeFiles([ISSUE, COLUMN, ...OLDER]);
    render(<HomeRail rail={sel.rail} locale="en" />);
    expect(screen.queryByText(/FIX-/)).toBeNull();
    expect(document.querySelectorAll("a[data-series]")).toHaveLength(2);
  });

  it("labels the key by series name, with all three series", () => {
    render(<HomeRail rail={selection.rail} locale="en" />);
    expect(screen.getByText("Latest files")).toBeInTheDocument();
    expect(screen.getByText("Off the Rails")).toBeInTheDocument();
    expect(screen.getByText("Practical")).toBeInTheDocument();
    expect(screen.getByText("Nico’s Notes")).toBeInTheDocument();
  });

  it("marks only the cover's entry 'On the cover'", () => {
    render(<HomeRail rail={selection.rail} locale="en" />);
    const marks = screen.getAllByText("On the cover");
    expect(marks).toHaveLength(1);
    const item = marks[0].closest("a");
    expect(within(item).getByText("NOTE-022")).toBeInTheDocument();
  });

  it("renders Spanish heading, key, marker and subscribe copy", () => {
    render(<HomeRail rail={selection.rail} locale="es" />);
    expect(screen.getByText("Últimos expedientes")).toBeInTheDocument();
    expect(screen.getByText("Color = serie:")).toBeInTheDocument();
    expect(screen.getByText("Fuera de las vías")).toBeInTheDocument();
    expect(screen.getByText("En la portada")).toBeInTheDocument();
    expect(
      screen.getByText("Expedientes nuevos cada semana. Gratis.")
    ).toBeInTheDocument();
  });

  it("subscribe is a plain link to Substack", () => {
    render(<HomeRail rail={selection.rail} locale="en" />);
    expect(screen.getByText("New files every week. Free.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Subscribe" })).toHaveAttribute(
      "href",
      SUBSTACK_SUBSCRIBE_URL
    );
  });
});

describe("RecentFiles", () => {
  it("renders a row per doc with code, date, title and byline, linked by series", () => {
    render(<RecentFiles docs={OLDER} locale="en" />);
    expect(screen.getByText("Recent files")).toBeInTheDocument();
    expect(screen.getByText("NOTE-021")).toBeInTheDocument();
    expect(screen.getByText("OTR-043")).toBeInTheDocument();
    expect(screen.getByText("What the Model Left Out")).toBeInTheDocument();
    expect(
      screen.getByText(formatDate(OLDER[0].publishDate, "en", "short"))
    ).toBeInTheDocument();
    expect(
      screen.getByText("What the Model Left Out").closest("a")
    ).toHaveAttribute("href", "/en/nico/2026-10-30");
    expect(
      screen.getByText("Three agents acted early").closest("a")
    ).toHaveAttribute("href", "/en/issue/otr-43");
    expect(screen.getByText("By Nico von Bot")).toBeInTheDocument();
  });

  it("keeps the archive link (EN and ES) even with no rows", () => {
    const { unmount } = render(<RecentFiles docs={[]} locale="en" />);
    expect(
      screen.getByText(/See the full archive/).closest("a")
    ).toHaveAttribute("href", "/en/archive");
    expect(screen.queryByText("Recent files")).toBeNull();
    unmount();
    render(<RecentFiles docs={OLDER} locale="es" />);
    expect(screen.getByText("Expedientes recientes")).toBeInTheDocument();
    expect(
      screen.getByText(/Ver el archivo completo/).closest("a")
    ).toHaveAttribute("href", "/es/archive");
  });
});

describe("HomeFiles", () => {
  it("renders the empty state in EN and ES", () => {
    const empty = selectHomeFiles([]);
    const { unmount } = render(<HomeFiles selection={empty} locale="en" />);
    expect(screen.getByText("No content published yet.")).toBeInTheDocument();
    unmount();
    render(<HomeFiles selection={empty} locale="es" />);
    expect(
      screen.getByText("Aún no hay contenido publicado.")
    ).toBeInTheDocument();
  });

  it("puts the newest file on the cover, the rest in rail and recent, with a single H1", () => {
    const sel = selectHomeFiles([ISSUE, COLUMN, PRACTICAL, ...OLDER]);
    render(<HomeFiles selection={sel} locale="en" />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "All the Powers of an Owner",
      })
    ).toBeInTheDocument();
    // Recent rows hold only docs that are neither on the cover nor in the rail.
    expect(screen.getByText("What the Model Left Out")).toBeInTheDocument();
    expect(screen.getAllByText("All the Powers of an Owner")).toHaveLength(2);
  });
});

describe("HomeRail dates carry no weekday", () => {
  it("renders day and month only for 7 consecutive days in en and es", () => {
    const names = new Set();
    for (const locale of ["en", "es"]) {
      const fmt = new Intl.DateTimeFormat(locale, {
        weekday: "long",
        timeZone: "UTC",
      });
      for (let d = 0; d < 7; d++) {
        names.add(fmt.format(new Date(Date.UTC(2026, 0, 4 + d))).toLowerCase());
      }
    }
    for (const locale of ["en", "es"]) {
      for (let d = 0; d < 7; d++) {
        const doc = {
          ...ISSUE,
          publishDate: new Date(Date.UTC(2026, 0, 4 + d)).toISOString(),
        };
        const { container, unmount } = render(
          <HomeRail
            rail={[{ series: "offTheRails", doc, onCover: false }]}
            locale={locale}
          />
        );
        const text = container.textContent.toLowerCase();
        expect(text).toContain(String(4 + d));
        for (const name of names) expect(text).not.toContain(name);
        unmount();
      }
    }
  });
});
