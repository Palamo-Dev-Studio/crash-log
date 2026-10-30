// ABOUTME: Marks the listed agent documents `retired: true` so the About masthead hides them. Dry run by default.
// ABOUTME: Writes only with --apply --expect=<n> (needs SANITY_API_TOKEN). Targets come from scripts/data/retired-agents.json by document ID. Run: node scripts/retire-agents.mjs [--apply --expect=<n> [--allow-drafts]]

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, "data/retired-agents.json");

// Published agents only (drafts and release versions carry "drafts." /
// "versions." id prefixes), selected by ID, never by display name.
export const QUERY = `*[_type == "agent" && _id in $ids && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] { _id, _rev, name, retired }`;

// Drafts that shadow a target: a pending draft would publish without the flag.
export const DRAFTS_QUERY = `*[_type == "agent" && _id in $draftIds]._id`;

export function parseArgs(argv) {
  const expectArg = argv.find((a) => a.startsWith("--expect="));
  const expect = expectArg ? Number(expectArg.slice("--expect=".length)) : null;
  return {
    apply: argv.includes("--apply"),
    allowDrafts: argv.includes("--allow-drafts"),
    expect: Number.isInteger(expect) && expect >= 0 ? expect : null,
  };
}

// Target IDs from the data file's parsed JSON.
export function targetIdsFrom(data) {
  return (data?.agents ?? []).map((a) => a.id);
}

// Pure decision function. Matches fetched docs to targets by _id only. Returns
// the candidates, the writes to perform (always empty unless apply and
// error-free) and the reasons it refused.
export function planRetire(
  docs,
  targetIds,
  draftIds = [],
  { apply = false, expect = null, allowDrafts = false } = {}
) {
  const targets = new Set(targetIds);
  const candidates = docs
    .filter((d) => targets.has(d._id) && d.retired !== true)
    .map((d) => ({
      id: d._id,
      rev: d._rev,
      name: d.name,
      patch: { set: { retired: true } },
    }));

  const errors = [];
  if (!apply) return { candidates, writes: [], errors, draftIds };

  if (expect === null) errors.push("--apply requires --expect=<n>.");
  else if (candidates.length !== expect)
    errors.push(`expected ${expect} agent(s) but found ${candidates.length}.`);
  const found = new Set(docs.map((d) => d._id));
  const missing = targetIds.filter((id) => !found.has(id));
  if (missing.length)
    errors.push(
      `target IDs not found as published agents: ${missing.join(", ")}.`
    );
  if (draftIds.length > 0 && !allowDrafts)
    errors.push(
      `drafts exist for target agents (${draftIds.join(", ")}); pass --allow-drafts to proceed.`
    );
  for (const c of candidates) {
    if (!c.rev) errors.push(`${c.id} has no _rev; cannot lock the patch.`);
  }
  return {
    candidates,
    writes: errors.length ? [] : candidates,
    errors,
    draftIds,
  };
}

// Reads are public, so a dry run needs no token and uses the CDN; the write
// path must bypass the CDN and carry the token.
export function clientOptions({ apply, token, projectId, dataset }) {
  if (apply && !token) {
    throw new Error("--apply needs SANITY_API_TOKEN (env or .env.local).");
  }
  return {
    projectId,
    dataset,
    apiVersion: "2024-03-01",
    useCdn: !apply,
    // Pinned: "raw" sees drafts, which the draft check relies on; a client
    // default change must not silently flip it.
    perspective: "raw",
    token: apply ? token : undefined,
  };
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

// Errors from @sanity/client can carry `request.headers.authorization` (the raw
// Bearer token); only the message is ever printed.
export function reportError(err, log = console.error) {
  log(err?.message || String(err));
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
  const data = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  const ids = targetIdsFrom(data);

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

  const docs = await client.fetch(QUERY, { ids });
  const draftIds = await client.fetch(DRAFTS_QUERY, {
    draftIds: ids.map((id) => `drafts.${id}`),
  });
  const { candidates, writes, errors } = planRetire(docs, ids, draftIds, opts);

  console.log(`${ids.length} target ID(s) in data file`);
  console.log(`${candidates.length} published agent(s) to retire`);
  console.log(`IDs: ${candidates.map((p) => p.id).join(", ") || "(none)"}`);
  const found = new Set(docs.map((d) => d._id));
  const missing = ids.filter((id) => !found.has(id));
  if (missing.length)
    console.log(
      `WARNING: target IDs not found as published: ${missing.join(", ")}`
    );
  if (draftIds.length)
    console.log(`WARNING: drafts exist for: ${draftIds.join(", ")}`);
  for (const { id, name, patch } of candidates) {
    console.log(
      `${apply ? "APPLY" : "WOULD APPLY"} ${name} ${id}: ${JSON.stringify(patch)}`
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
  console.log(
    `patched ${writes.length - failures.length}, failed ${failures.length}`
  );
  if (failures.length) process.exit(1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((err) => {
    reportError(err);
    process.exit(1);
  });
}
