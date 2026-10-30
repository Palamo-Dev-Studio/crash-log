// ABOUTME: Unit tests for scripts/backfill-newsroom-bylines.mjs decision logic and write locking.
// ABOUTME: Pins dry-run default, --expect/draft/rev guards, never-overwrite and the published-only, #1-27 query.

import { describe, it, expect, vi } from "vitest";
import {
  QUERY,
  MAX_ISSUE_NUMBER,
  parseArgs,
  planBackfill,
  applyWrites,
  clientOptions,
  draftIdsFor,
  applySummary,
} from "../../scripts/backfill-newsroom-bylines.mjs";

const doc = (n, extra = {}) => ({
  _id: `issue-${n}`,
  _rev: `rev-${n}`,
  issueNumber: n,
  ...extra,
});
const APPLY = { apply: true, expect: 2 };
const docs = [doc(3), doc(9, { byline: "" })];

describe("parseArgs", () => {
  it("is a dry run unless --apply is passed", () => {
    expect(parseArgs([]).apply).toBe(false);
    expect(parseArgs(["--dry"]).apply).toBe(false);
    expect(parseArgs(["--apply"]).apply).toBe(true);
  });
  it("parses --expect and --allow-drafts", () => {
    expect(parseArgs(["--expect=26"]).expect).toBe(26);
    expect(parseArgs([]).expect).toBeNull();
    expect(parseArgs(["--expect=abc"]).expect).toBeNull();
    expect(parseArgs(["--allow-drafts"]).allowDrafts).toBe(true);
    expect(parseArgs([]).allowDrafts).toBe(false);
  });
});

describe("planBackfill", () => {
  it("never writes without apply, even with a valid expect", () => {
    const plan = planBackfill(docs, [], { apply: false, expect: 2 });
    expect(plan.writes).toEqual([]);
    expect(plan.candidates).toHaveLength(2);
  });

  it("plans a rev-carrying newsroom set per missing or empty byline", () => {
    const plan = planBackfill(docs, [], APPLY);
    expect(plan.errors).toEqual([]);
    expect(plan.writes).toEqual([
      {
        id: "issue-3",
        rev: "rev-3",
        issueNumber: 3,
        patch: { set: { byline: "newsroom" } },
      },
      {
        id: "issue-9",
        rev: "rev-9",
        issueNumber: 9,
        patch: { set: { byline: "newsroom" } },
      },
    ]);
  });

  it("treats an empty-string byline as missing", () => {
    const plan = planBackfill([doc(4, { byline: "" })], [], {
      apply: true,
      expect: 1,
    });
    expect(plan.writes).toHaveLength(1);
  });

  it("never overwrites a non-empty byline", () => {
    const plan = planBackfill([doc(3), doc(5, { byline: "gabo" })], [], {
      apply: true,
      expect: 1,
    });
    expect(plan.writes.map((w) => w.id)).toEqual(["issue-3"]);
  });

  it("caps issue numbers at 27", () => {
    expect(MAX_ISSUE_NUMBER).toBe(27);
    const plan = planBackfill([doc(27), doc(28)], [], {
      apply: true,
      expect: 1,
    });
    expect(plan.writes.map((w) => w.id)).toEqual(["issue-27"]);
  });

  it("aborts --apply without --expect", () => {
    const plan = planBackfill(docs, [], { apply: true });
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/--expect/);
  });

  it("aborts on a count mismatch", () => {
    const plan = planBackfill(docs, [], { apply: true, expect: 3 });
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/expected 3.*found 2/);
  });

  it("aborts when more issues are found than expected (found > expect)", () => {
    const plan = planBackfill(docs, [], { apply: true, expect: 1 });
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/expected 1.*found 2/);
  });

  it("aborts when a draft exists unless --allow-drafts", () => {
    const blocked = planBackfill(docs, ["drafts.issue-3"], APPLY);
    expect(blocked.writes).toEqual([]);
    expect(blocked.errors.join(" ")).toContain("drafts.issue-3");
    const allowed = planBackfill(docs, ["drafts.issue-3"], {
      ...APPLY,
      allowDrafts: true,
    });
    expect(allowed.errors).toEqual([]);
    expect(allowed.writes).toHaveLength(2);
  });

  it("reports drafts in a dry run without erroring", () => {
    const plan = planBackfill(docs, ["drafts.issue-3"], { apply: false });
    expect(plan.draftIds).toEqual(["drafts.issue-3"]);
    expect(plan.errors).toEqual([]);
  });

  it("aborts when a doc has no _rev", () => {
    const plan = planBackfill([{ _id: "issue-3", issueNumber: 3 }], [], {
      apply: true,
      expect: 1,
    });
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/_rev/);
  });
});

describe("applyWrites", () => {
  const writes = planBackfill(docs, [], APPLY).writes;

  function fakeClient(failIds = []) {
    const calls = [];
    return {
      calls,
      patch(id) {
        const call = { id, rev: undefined, set: undefined };
        calls.push(call);
        const chain = {
          ifRevisionId(rev) {
            call.rev = rev;
            return chain;
          },
          set(v) {
            call.set = v;
            return chain;
          },
          async commit() {
            if (failIds.includes(id)) throw new Error("revision mismatch");
            return {};
          },
        };
        return chain;
      },
    };
  }

  it("locks every patch to its fetched revision", async () => {
    const client = fakeClient();
    const failures = await applyWrites(client, writes, () => {});
    expect(failures).toEqual([]);
    expect(client.calls).toEqual([
      { id: "issue-3", rev: "rev-3", set: { byline: "newsroom" } },
      { id: "issue-9", rev: "rev-9", set: { byline: "newsroom" } },
    ]);
  });

  it("collects per-doc failures and keeps going", async () => {
    const client = fakeClient(["issue-3"]);
    const failures = await applyWrites(client, writes, () => {});
    expect(failures).toEqual([{ id: "issue-3", message: "revision mismatch" }]);
    expect(client.calls).toHaveLength(2);
  });
});

describe("clientOptions", () => {
  const base = { projectId: "p", dataset: "d" };

  it("write path bypasses the CDN and carries the token", () => {
    const o = clientOptions({ ...base, apply: true, token: "tok" });
    expect(o.useCdn).toBe(false);
    expect(o.token).toBe("tok");
  });

  it("dry run uses the CDN and carries no token, even if one is supplied", () => {
    const o = clientOptions({ ...base, apply: false, token: "tok" });
    expect(o.useCdn).toBe(true);
    expect(o.token).toBeUndefined();
    expect(clientOptions({ ...base, apply: false, token: null }).token).toBe(
      undefined
    );
  });

  it("throws when apply has no token", () => {
    expect(() => clientOptions({ ...base, apply: true, token: null })).toThrow(
      /SANITY_API_TOKEN/
    );
  });
});

describe("draftIdsFor", () => {
  it("maps published ids to drafts.<id>", () => {
    expect(draftIdsFor(docs)).toEqual(["drafts.issue-3", "drafts.issue-9"]);
    expect(draftIdsFor([])).toEqual([]);
  });
});

describe("applySummary", () => {
  it("reports counts and no hint when all succeeded", () => {
    expect(applySummary(3, [])).toEqual(["patched 3, failed 0"]);
  });
  it("hints the remaining count after a partial failure", () => {
    const lines = applySummary(3, [{ id: "a", message: "x" }]);
    expect(lines[0]).toBe("patched 2, failed 1");
    expect(lines[1]).toContain("--expect=1");
  });
  it("gives no re-run hint when nothing was patched", () => {
    expect(applySummary(1, [{ id: "a", message: "x" }])).toEqual([
      "patched 0, failed 1",
    ]);
  });
});

describe("QUERY", () => {
  it("selects published issues up to the cap with no or empty byline and projects _rev", () => {
    expect(QUERY).toContain('_type == "issue"');
    expect(QUERY).toContain('!(_id in path("drafts.**"))');
    expect(QUERY).toContain('!(_id in path("versions.**"))');
    expect(QUERY).toContain("issueNumber <= $max");
    expect(QUERY).toContain("!defined(byline)");
    expect(QUERY).toContain('byline == ""');
    expect(QUERY).toContain("_rev");
  });
});
