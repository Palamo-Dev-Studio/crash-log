// ABOUTME: Unit tests for scripts/retire-agents.mjs decision logic and write locking.
// ABOUTME: Pins dry-run default, --expect/draft/rev/missing-ID guards, ID-only matching and the data file's shape.

import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  QUERY,
  parseArgs,
  targetIdsFrom,
  planRetire,
  applyWrites,
  clientOptions,
} from "../../scripts/retire-agents.mjs";

const doc = (id, extra = {}) => ({
  _id: id,
  _rev: `rev-${id}`,
  name: `Name ${id}`,
  ...extra,
});
const docs = [doc("a1"), doc("a2")];
const ids = ["a1", "a2"];
const APPLY = { apply: true, expect: 2 };

describe("parseArgs", () => {
  it("is a dry run unless --apply is passed", () => {
    expect(parseArgs([]).apply).toBe(false);
    expect(parseArgs(["--apply"]).apply).toBe(true);
  });
  it("parses --expect and --allow-drafts", () => {
    expect(parseArgs(["--expect=4"]).expect).toBe(4);
    expect(parseArgs(["--expect=abc"]).expect).toBeNull();
    expect(parseArgs(["--allow-drafts"]).allowDrafts).toBe(true);
  });
});

describe("planRetire", () => {
  it("never writes without --apply, even when everything matches", () => {
    const plan = planRetire(docs, ids, [], { expect: 2 });
    expect(plan.writes).toEqual([]);
    expect(plan.candidates).toHaveLength(2);
  });

  it("refuses --apply without --expect", () => {
    const plan = planRetire(docs, ids, [], { apply: true });
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/--expect/);
  });

  it("refuses when the count differs from --expect, in both directions", () => {
    for (const n of [1, 3]) {
      const plan = planRetire(docs, ids, [], { apply: true, expect: n });
      expect(plan.writes).toEqual([]);
      expect(plan.errors.join(" ")).toMatch(/expected/);
    }
  });

  it("writes exactly { retired: true } and nothing else", () => {
    const plan = planRetire(docs, ids, [], APPLY);
    expect(plan.errors).toEqual([]);
    expect(plan.writes).toHaveLength(2);
    for (const w of plan.writes) {
      expect(w.patch).toEqual({ set: { retired: true } });
      expect(w.rev).toBe(`rev-${w.id}`);
    }
  });

  it("matches by _id only, never by display name", () => {
    const named = [doc("x9", { name: "Scoop" }), doc("a1")];
    const plan = planRetire(named, ["a1"], [], { apply: true, expect: 1 });
    expect(plan.writes.map((w) => w.id)).toEqual(["a1"]);
    expect(planRetire(named, [], [], {}).candidates).toEqual([]);
  });

  it("skips agents already retired", () => {
    const plan = planRetire(
      [doc("a1", { retired: true }), doc("a2")],
      ids,
      [],
      {
        apply: true,
        expect: 1,
      }
    );
    expect(plan.writes.map((w) => w.id)).toEqual(["a2"]);
  });

  it("refuses when a target ID is not found as a published agent", () => {
    const plan = planRetire([doc("a1")], ids, [], { apply: true, expect: 1 });
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/a2/);
  });

  it("refuses when drafts exist unless --allow-drafts", () => {
    const blocked = planRetire(docs, ids, ["drafts.a1"], APPLY);
    expect(blocked.writes).toEqual([]);
    expect(blocked.errors.join(" ")).toMatch(/drafts/);
    const allowed = planRetire(docs, ids, ["drafts.a1"], {
      ...APPLY,
      allowDrafts: true,
    });
    expect(allowed.writes).toHaveLength(2);
  });

  it("refuses a doc with no _rev", () => {
    const plan = planRetire(
      [{ _id: "a1", name: "x" }, doc("a2")],
      ids,
      [],
      APPLY
    );
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/_rev/);
  });
});

describe("QUERY", () => {
  it("selects published agents by ID", () => {
    expect(QUERY).toContain("_id in $ids");
    expect(QUERY).toContain('path("drafts.**")');
    expect(QUERY).not.toMatch(/name\s*==/);
  });
});

describe("clientOptions", () => {
  const base = { projectId: "p", dataset: "d" };
  it("needs a token to apply and never sends one on a dry run", () => {
    expect(() => clientOptions({ ...base, apply: true, token: null })).toThrow(
      /SANITY_API_TOKEN/
    );
    const dry = clientOptions({ ...base, apply: false, token: "secret" });
    expect(dry.token).toBeUndefined();
    expect(dry.useCdn).toBe(true);
    const live = clientOptions({ ...base, apply: true, token: "secret" });
    expect(live.useCdn).toBe(false);
  });
});

describe("applyWrites", () => {
  it("locks each patch to its fetched revision and reports failures", async () => {
    const calls = [];
    const client = {
      patch: (id) => ({
        ifRevisionId: (rev) => ({
          set: (s) => ({
            commit: async () => {
              calls.push({ id, rev, s });
              if (id === "a2") throw new Error("rev mismatch");
            },
          }),
        }),
      }),
    };
    const writes = planRetire(docs, ids, [], APPLY).writes;
    const failures = await applyWrites(client, writes, vi.fn());
    expect(calls[0]).toEqual({ id: "a1", rev: "rev-a1", s: { retired: true } });
    expect(failures).toEqual([{ id: "a2", message: "rev mismatch" }]);
  });
});

describe("data file", () => {
  it("lists agents by id; names are display-only", () => {
    const data = JSON.parse(
      readFileSync("scripts/data/retired-agents.json", "utf-8")
    );
    expect(Array.isArray(targetIdsFrom(data))).toBe(true);
    for (const a of data.agents) expect(typeof a.id).toBe("string");
  });
});
