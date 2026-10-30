// ABOUTME: Backfills byline "newsroom" on published issues #1-27 that have no byline. Dry run by default.
// ABOUTME: Writes only with --apply --expect=<n> (needs SANITY_API_TOKEN). Run: node scripts/backfill-newsroom-bylines.mjs [--apply --expect=<n> [--allow-drafts]]

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const MAX_ISSUE_NUMBER = 27;
const NEWSROOM_BYLINE = "newsroom";

// Published only (drafts have a "drafts." id prefix); byline missing or empty.
export const QUERY = `*[_type == "issue" && !(_id in path("drafts.**")) && issueNumber <= $max && (!defined(byline) || byline == "")] | order(issueNumber asc) { _id, _rev, issueNumber, byline }`;

// Drafts that shadow a listed issue: a pending draft would publish without the byline.
export const DRAFTS_QUERY = `*[_type == "issue" && _id in $draftIds]._id`;

export function parseArgs(argv) {
  const expectArg = argv.find((a) => a.startsWith("--expect="));
  const expect = expectArg ? Number(expectArg.slice("--expect=".length)) : null;
  return {
    apply: argv.includes("--apply"),
    allowDrafts: argv.includes("--allow-drafts"),
    expect: Number.isInteger(expect) && expect >= 0 ? expect : null,
  };
}

// Pure decision function. Returns the candidates, the writes to perform
// (always empty unless apply and error-free) and the reasons it refused.
export function planBackfill(
  docs,
  draftIds = [],
  { apply = false, expect = null, allowDrafts = false } = {}
) {
  const candidates = docs
    .filter(
      (d) =>
        d.issueNumber <= MAX_ISSUE_NUMBER &&
        (d.byline === undefined || d.byline === null || d.byline === "")
    )
    .map((d) => ({
      id: d._id,
      rev: d._rev,
      issueNumber: d.issueNumber,
      patch: { set: { byline: NEWSROOM_BYLINE } },
    }));

  const errors = [];
  if (!apply) return { candidates, writes: [], errors, draftIds };

  if (expect === null) errors.push("--apply requires --expect=<n>.");
  else if (candidates.length !== expect)
    errors.push(`expected ${expect} issue(s) but found ${candidates.length}.`);
  if (draftIds.length > 0 && !allowDrafts)
    errors.push(
      `drafts exist for listed issues (${draftIds.join(", ")}); pass --allow-drafts to proceed.`
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

  // Reads are public, so the dry run needs no token and uses the CDN.
  let token = null;
  if (apply) {
    token = loadToken();
    if (!token) {
      console.error("--apply needs SANITY_API_TOKEN (env or .env.local).");
      process.exit(1);
    }
  }
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-03-01",
    useCdn: !apply,
    token: token || undefined,
  });

  const docs = await client.fetch(QUERY, { max: MAX_ISSUE_NUMBER });
  const draftIds = await client.fetch(DRAFTS_QUERY, {
    draftIds: docs.map((d) => `drafts.${d._id}`),
  });
  const { candidates, writes, errors } = planBackfill(docs, draftIds, opts);

  console.log(`${candidates.length} published issue(s) with no byline`);
  console.log(`IDs: ${candidates.map((p) => p.id).join(", ") || "(none)"}`);
  if (draftIds.length)
    console.log(`WARNING: drafts exist for: ${draftIds.join(", ")}`);
  for (const { id, issueNumber, patch } of candidates) {
    console.log(
      `${apply ? "APPLY" : "WOULD APPLY"} #${issueNumber} ${id}: ${JSON.stringify(patch)}`
    );
  }

  if (!apply) {
    console.log(
      "Dry run. Nothing written. Pass --apply --expect=<n> to write."
    );
    return;
  }
  if (errors.length) {
    for (const e of errors) console.error(`ABORT: ${e}`);
    process.exit(1);
  }

  const failures = await applyWrites(client, writes);
  for (const f of failures) console.error(`FAILED ${f.id}: ${f.message}`);
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
