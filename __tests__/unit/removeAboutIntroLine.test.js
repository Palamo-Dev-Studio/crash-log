// ABOUTME: Unit tests for scripts/remove-about-intro-line.mjs: dry-run default, exact-block matching, --expect/draft guards, rev lock, token scrubbing.
// ABOUTME: Includes a check that the committed About JSON no longer carries the lines the script removes.

import { format } from "node:util";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import {
  INTRO_LINES,
  QUERY,
  planRemoval,
  applyRemoval,
  run,
} from "../../scripts/remove-about-intro-line.mjs";
import { DATA_PATH } from "../../scripts/write-about-copy.mjs";

const block = (key, text, style = "normal") => ({
  _type: "block",
  _key: key,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: `${key}-s`, text, marks: [] }],
});
const locale = (lang, { line = true } = {}) => [
  block(`${lang}-workflow-h0`, "Who makes it", "h2"),
  ...(line ? [block(INTRO_LINES[lang].key, INTRO_LINES[lang].text)] : []),
  block(`${lang}-workflow-h0p1`, "Hector Luis Alamo is an editor."),
];
const doc = (opts = {}) => ({
  _id: "about",
  _type: "aboutPage",
  _rev: "r1",
  workflowSection: {
    en: locale("en", opts.en),
    es: locale("es", opts.es),
  },
});
const APPLY = { apply: true, expect: 2 };

describe("planRemoval", () => {
  it("never plans a write without --apply", () => {
    const plan = planRemoval(doc(), [], { apply: false, expect: 2 });
    expect(plan.unset).toEqual([]);
    expect(plan.errors).toEqual([]);
    expect(plan.removals).toBe(2);
  });

  it("plans one key-addressed unset per locale", () => {
    expect(planRemoval(doc(), [], APPLY).unset).toEqual([
      'workflowSection.en[_key=="en-workflow-h0p0"]',
      'workflowSection.es[_key=="es-workflow-h0p0"]',
    ]);
  });

  it("treats a locale without the block as already done", () => {
    const plan = planRemoval(doc({ en: { line: false } }), [], {
      apply: true,
      expect: 1,
    });
    expect(plan.errors).toEqual([]);
    expect(plan.unset).toEqual([
      'workflowSection.es[_key=="es-workflow-h0p0"]',
    ]);
  });

  it("plans nothing once both locales are clean", () => {
    const clean = doc({ en: { line: false }, es: { line: false } });
    expect(planRemoval(clean, [], { apply: true, expect: 0 }).unset).toEqual(
      []
    );
  });

  it("aborts --apply without --expect and on a count mismatch", () => {
    expect(planRemoval(doc(), [], { apply: true }).errors.join()).toMatch(
      /--expect/
    );
    expect(planRemoval(doc(), [], { apply: true, expect: 3 }).unset).toEqual(
      []
    );
    expect(
      planRemoval(doc(), [], { apply: true, expect: 3 }).errors.join()
    ).toMatch(/expected 3/);
  });

  it("refuses when the key exists with different text", () => {
    const d = doc();
    d.workflowSection.en[1] = block("en-workflow-h0p0", "Something edited.");
    const plan = planRemoval(d, [], { apply: true, expect: 1 });
    expect(plan.unset).toEqual([]);
    expect(plan.errors.join()).toMatch(/en: .*refusing to guess/);
  });

  it("refuses when the text exists under another key or position", () => {
    const d = doc();
    d.workflowSection.es.push(block("moved", "Somos dos."));
    const plan = planRemoval(d, [], { apply: true, expect: 1 });
    expect(plan.unset).toEqual([]);
    expect(plan.errors.join()).toMatch(/es: .*refusing to guess/);
  });

  it("does not remove the block if it is no longer right after the first h2", () => {
    const d = doc();
    const [h2, line, rest] = d.workflowSection.en;
    d.workflowSection.en = [h2, rest, line];
    const plan = planRemoval(d, [], APPLY);
    expect(plan.unset).toEqual([]);
    expect(plan.errors.length).toBeGreaterThan(0);
  });

  it("aborts --apply on a draft unless --allow-drafts", () => {
    const blocked = planRemoval(doc(), ["drafts.about"], APPLY);
    expect(blocked.unset).toEqual([]);
    expect(blocked.errors.join()).toMatch(/drafts exist/);
    expect(
      planRemoval(doc(), ["drafts.about"], { ...APPLY, allowDrafts: true })
        .unset
    ).toHaveLength(2);
  });

  it("aborts on a missing doc, wrong type or missing _rev", () => {
    expect(planRemoval(undefined, [], APPLY).errors.join()).toMatch(
      /not found/
    );
    expect(
      planRemoval({ ...doc(), _type: "agent" }, [], APPLY).errors.join()
    ).toMatch(/expected aboutPage/);
    expect(
      planRemoval({ ...doc(), _rev: undefined }, [], APPLY).errors.join()
    ).toMatch(/_rev/);
  });

  it("reads published docs by strict _id", () => {
    expect(QUERY).toContain("_id == $id");
    expect(QUERY).toContain("workflowSection");
  });
});

describe("applyRemoval", () => {
  const fake = (fail) => {
    const call = {};
    return {
      call,
      patch: (id) => {
        call.id = id;
        const chain = {
          ifRevisionId: (r) => ((call.rev = r), chain),
          unset: (u) => ((call.unset = u), chain),
          commit: async () => {
            if (fail) throw new Error(fail);
          },
        };
        return chain;
      },
    };
  };

  it("locks the patch to the fetched revision and only unsets", async () => {
    const client = fake();
    expect(await applyRemoval(client, "about", "r1", ["p"])).toBeNull();
    expect(client.call).toEqual({ id: "about", rev: "r1", unset: ["p"] });
  });

  it("does nothing for an empty plan", async () => {
    const client = fake();
    await applyRemoval(client, "about", "r1", []);
    expect(client.call).toEqual({});
  });

  it("scrubs a known token from a commit error", async () => {
    expect(
      await applyRemoval(
        fake("tok SECRET123"),
        "about",
        "r1",
        ["p"],
        ["SECRET123"]
      )
    ).toBe("tok ***");
  });
});

describe("run", () => {
  const capture = async (argv, deps) => {
    const out = [];
    const sink = (...a) => out.push(format(...a));
    const e = vi.spyOn(console, "error").mockImplementation(sink);
    const l = vi.spyOn(console, "log").mockImplementation(sink);
    try {
      return { code: await run(argv, deps), text: out.join("\n") };
    } finally {
      e.mockRestore();
      l.mockRestore();
    }
  };
  const makeWith = (commit) => () => ({
    fetch: vi.fn().mockResolvedValueOnce([doc()]).mockResolvedValueOnce([]),
    patch: () => {
      const chain = {
        ifRevisionId: () => chain,
        unset: () => chain,
        commit,
      };
      return chain;
    },
  });

  it("writes nothing on a dry run end to end", async () => {
    const commit = vi.fn();
    const { code, text } = await capture([], { make: makeWith(commit) });
    expect(code).toBe(0);
    expect(commit).not.toHaveBeenCalled();
    expect(text).toMatch(/Dry run\. Nothing written/);
  });

  it("writes only with --apply --expect", async () => {
    const commit = vi.fn().mockResolvedValue({});
    const { code } = await capture(["--apply", "--expect=2"], {
      make: makeWith(commit),
      readToken: () => "SECRET123",
    });
    expect(code).toBe(0);
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it("--apply without --expect aborts before any write", async () => {
    const commit = vi.fn();
    const { code } = await capture(["--apply"], {
      make: makeWith(commit),
      readToken: () => "SECRET123",
    });
    expect(code).toBe(1);
    expect(commit).not.toHaveBeenCalled();
  });

  it("never prints the token a failed fetch carries", async () => {
    const err = Object.assign(new Error("GET ?token=SECRET123 failed"), {
      request: { headers: { authorization: "Bearer SECRET123" } },
    });
    const { code, text } = await capture(["--apply", "--expect=2"], {
      readToken: () => "SECRET123",
      make: () => ({ fetch: vi.fn().mockRejectedValue(err) }),
    });
    expect(code).toBe(1);
    expect(text).not.toContain("SECRET123");
  });
});

describe("committed About JSON", () => {
  it("no longer carries the lines the script removes", () => {
    const about = JSON.parse(readFileSync(DATA_PATH, "utf8")).aboutPage;
    for (const [lang, line] of Object.entries(INTRO_LINES)) {
      const blocks = about.workflowSection[lang];
      expect(blocks.map((b) => b._key)).not.toContain(line.key);
      expect(
        blocks.flatMap((b) => b.children.map((c) => c.text))
      ).not.toContain(line.text);
    }
  });
});
