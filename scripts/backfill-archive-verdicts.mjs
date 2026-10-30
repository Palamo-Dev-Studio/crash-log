// ABOUTME: Backfills story.verdict (EN/ES) on archive stories from scripts/data/archive-verdicts.json. Dry run by default.
// ABOUTME: Writes only with --apply --expect=<n> (needs SANITY_API_TOKEN). Run: node scripts/backfill-archive-verdicts.mjs [--apply --expect=<n> [--allow-drafts] [--allow-drift]]

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DATA_PATH = resolve(__dirname, "data/archive-verdicts.json");
export const EXPECTED_ENTRIES = 88;

const ENTRY_KEYS = ["_id", "issueNumber", "headline", "severity", "verdict"];

// Published stories only (drafts and release versions have "drafts." /
// "versions." id prefixes), matched strictly by _id.
export const QUERY = `*[_type == "story" && _id in $ids && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] { _id, _rev, "headline": headline.en, verdict }`;

// Drafts that shadow a listed story: a pending draft would publish without the verdict.
export const DRAFTS_QUERY = `*[_type == "story" && _id in $draftIds]._id`;

export function parseArgs(argv) {
  const expectArg = argv.find((a) => a.startsWith("--expect="));
  const expect = expectArg ? Number(expectArg.slice("--expect=".length)) : null;
  return {
    apply: argv.includes("--apply"),
    allowDrafts: argv.includes("--allow-drafts"),
    allowDrift: argv.includes("--allow-drift"),
    expect: Number.isInteger(expect) && expect >= 0 ? expect : null,
  };
}

const isText = (v) => typeof v === "string" && v.trim() !== "";
const hasExactKeys = (obj, keys) =>
  obj !== null &&
  typeof obj === "object" &&
  !Array.isArray(obj) &&
  Object.keys(obj).length === keys.length &&
  keys.every((k) => Object.prototype.hasOwnProperty.call(obj, k));

// Returns a list of problems with the loaded JSON; empty means valid.
export function validateEntries(data, expectedCount = EXPECTED_ENTRIES) {
  const errors = [];
  const entries = data?.stories;
  if (!Array.isArray(entries)) return ["JSON has no `stories` array."];
  if (entries.length !== expectedCount)
    errors.push(
      `expected ${expectedCount} entries but found ${entries.length}.`
    );
  const seen = new Set();
  entries.forEach((e, i) => {
    const label = `entry ${i} (${e?._id ?? "no _id"})`;
    if (!hasExactKeys(e, ENTRY_KEYS)) {
      errors.push(`${label}: must have exactly ${ENTRY_KEYS.join(", ")}.`);
      return;
    }
    if (!isText(e._id)) errors.push(`${label}: empty _id.`);
    else if (seen.has(e._id)) errors.push(`${label}: duplicate _id.`);
    else seen.add(e._id);
    if (!Number.isInteger(e.issueNumber))
      errors.push(`${label}: issueNumber must be an integer.`);
    if (!isText(e.headline)) errors.push(`${label}: empty headline.`);
    if (!isText(e.severity)) errors.push(`${label}: empty severity.`);
    if (!hasExactKeys(e.verdict, ["en", "es"])) {
      errors.push(`${label}: verdict must have exactly en and es.`);
    } else {
      if (!isText(e.verdict.en)) errors.push(`${label}: empty verdict.en.`);
      if (!isText(e.verdict.es)) errors.push(`${label}: empty verdict.es.`);
    }
  });
  return errors;
}

const hasVerdict = (v) => isText(v?.en) || isText(v?.es);

// Pure decision function. Matches strictly by _id. Returns the planned
// writes (always empty unless apply and error-free), the reports and the
// reasons it refused.
export function planBackfill(
  entries,
  docs,
  draftIds = [],
  { apply = false, expect = null, allowDrafts = false, allowDrift = false } = {}
) {
  const byId = new Map(docs.map((d) => [d._id, d]));
  const candidates = [];
  const missing = [];
  const drift = [];
  const skippedExisting = [];

  for (const e of entries) {
    const d = byId.get(e._id);
    if (!d) {
      missing.push(e._id);
      continue;
    }
    if (d.headline !== e.headline)
      drift.push({ id: e._id, expected: e.headline, actual: d.headline });
    if (hasVerdict(d.verdict)) {
      skippedExisting.push(e._id);
      continue;
    }
    candidates.push({
      id: e._id,
      rev: d._rev,
      issueNumber: e.issueNumber,
      headline: e.headline,
      severity: e.severity,
      patch: {
        set: {
          verdict: {
            _type: "localizedString",
            en: e.verdict.en,
            es: e.verdict.es,
          },
        },
      },
    });
  }

  const found = entries.length - missing.length;
  const report = {
    candidates,
    missing,
    drift,
    skippedExisting,
    draftIds,
    found,
  };
  if (!apply) return { ...report, writes: [], errors: [] };

  const errors = [];
  if (expect === null) errors.push("--apply requires --expect=<n>.");
  else if (candidates.length !== expect)
    errors.push(
      `expected ${expect} write(s) but planned ${candidates.length}.`
    );
  if (missing.length)
    errors.push(
      `${missing.length} story _id(s) missing in Sanity: ${missing.join(", ")}.`
    );
  if (drift.length && !allowDrift)
    errors.push(
      `headline drift on ${drift.length} story(ies) (${drift.map((x) => x.id).join(", ")}); pass --allow-drift to proceed.`
    );
  if (draftIds.length > 0 && !allowDrafts)
    errors.push(
      `drafts exist for listed stories (${draftIds.join(", ")}); pass --allow-drafts to proceed.`
    );
  for (const c of candidates) {
    if (!c.rev) errors.push(`${c.id} has no _rev; cannot lock the patch.`);
  }
  return { ...report, writes: errors.length ? [] : candidates, errors };
}

// Client settings for the run. Reads are public, so a dry run needs no token
// and uses the CDN; the write path must bypass the CDN and carry the token.
export function clientOptions({ apply, token, projectId, dataset }) {
  if (apply && !token) {
    throw new Error("--apply needs SANITY_API_TOKEN (env or .env.local).");
  }
  return {
    projectId,
    dataset,
    apiVersion: "2024-03-01",
    useCdn: !apply,
    token: apply ? token : undefined,
  };
}

// Draft IDs that would shadow the given entries.
export function draftIdsFor(entries) {
  return entries.map((e) => `drafts.${e._id}`);
}

// Summary printed after a write run, with a re-run hint when some failed.
export function applySummary(total, failures) {
  const patched = total - failures.length;
  const lines = [`patched ${patched}, failed ${failures.length}`];
  if (failures.length && patched > 0) {
    lines.push(
      `Re-run with --expect=${failures.length} to retry the remaining story(ies).`
    );
  }
  return lines;
}

// Each patch is locked to the fetched revision: a concurrent edit makes that
// doc's commit fail instead of being overwritten. Returns the failures.
export async function applyWrites(client, writes, log = console.log) {
  const failures = [];
  for (const { id, rev, patch } of writes) {
    try {
      await client.patch(id).ifRevisionId(rev).set(patch.set).commit();
      log(`patched ${id}`);
    } catch (err) {
      failures.push({ id, message: err?.message || String(err) });
    }
  }
  return failures;
}

function loadToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN;
  try {
    const content = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("SANITY_API_TOKEN=")) {
        return trimmed
          .slice("SANITY_API_TOKEN=".length)
          .replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // fall through
  }
  return null;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { apply } = opts;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "msr24cg4";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

  const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const invalid = validateEntries(data);
  if (invalid.length) {
    for (const e of invalid) console.error(`ABORT: ${e}`);
    process.exit(1);
  }
  const entries = data.stories;

  // Reads are public, so the dry run needs no token and uses the CDN.
  let options;
  try {
    options = clientOptions({
      apply,
      token: apply ? loadToken() : null,
      projectId,
      dataset,
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const client = createClient(options);

  const docs = await client.fetch(QUERY, { ids: entries.map((e) => e._id) });
  const draftIds = await client.fetch(DRAFTS_QUERY, {
    draftIds: draftIdsFor(entries),
  });
  const plan = planBackfill(entries, docs, draftIds, opts);
  const { candidates, writes, errors, missing, drift, skippedExisting } = plan;

  console.log(`found ${plan.found} of ${entries.length} stories in Sanity`);
  console.log(`missing _ids: ${missing.join(", ") || "(none)"}`);
  console.log(`headline drift: ${drift.length}`);
  for (const d of drift)
    console.log(
      `  DRIFT ${d.id}: json "${d.expected}" vs sanity "${d.actual}"`
    );
  console.log(
    `already have a verdict (skipped): ${skippedExisting.length}${skippedExisting.length ? ` (${skippedExisting.join(", ")})` : ""}`
  );
  if (draftIds.length)
    console.log(`WARNING: drafts exist for: ${draftIds.join(", ")}`);
  console.log(`${candidates.length} planned write(s):`);
  for (const c of candidates) {
    const { en, es } = c.patch.set.verdict;
    console.log(
      `${apply ? "APPLY" : "WOULD APPLY"} #${c.issueNumber} ${c.id} | ${c.headline} | ${c.severity} -> ${en} | ${es}`
    );
  }

  if (!apply) {
    console.log(
      "Dry run. Nothing written. Pass --apply --expect=<n> to write."
    );
    console.log(
      "Dry run reads without a token, so it cannot see drafts; --apply checks for them."
    );
    return;
  }
  if (errors.length) {
    for (const e of errors) console.error(`ABORT: ${e}`);
    process.exit(1);
  }

  const failures = await applyWrites(client, writes);
  for (const f of failures) console.error(`FAILED ${f.id}: ${f.message}`);
  for (const line of applySummary(writes.length, failures)) console.log(line);
  if (failures.length) process.exit(1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
