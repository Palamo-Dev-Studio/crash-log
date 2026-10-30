// ABOUTME: Backfills byline "newsroom" on published issues #1-27 that have no byline. Dry run by default.
// ABOUTME: Writes only with --apply (needs SANITY_API_TOKEN). Run: node scripts/backfill-newsroom-bylines.mjs [--apply]

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MAX_ISSUE_NUMBER = 27;
const NEWSROOM_BYLINE = "newsroom";

// Published only (drafts have a "drafts." id prefix); byline missing or empty.
export const QUERY = `*[_type == "issue" && !(_id in path("drafts.**")) && issueNumber <= $max && (!defined(byline) || byline == "")] | order(issueNumber asc) { _id, issueNumber }`;

export function buildPatches(docs) {
  return docs.map((doc) => ({
    id: doc._id,
    issueNumber: doc.issueNumber,
    patch: { set: { byline: NEWSROOM_BYLINE } },
  }));
}

export function parseArgs(argv) {
  return { apply: argv.includes("--apply") };
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
  const { apply } = parseArgs(process.argv.slice(2));
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
  const patches = buildPatches(docs);

  console.log(`${patches.length} published issue(s) with no byline`);
  console.log(`IDs: ${patches.map((p) => p.id).join(", ") || "(none)"}`);
  for (const { id, issueNumber, patch } of patches) {
    console.log(
      `${apply ? "APPLY" : "WOULD APPLY"} #${issueNumber} ${id}: ${JSON.stringify(patch)}`
    );
  }

  if (!apply) {
    console.log("Dry run. Nothing written. Pass --apply to write.");
    return;
  }

  for (const { id, patch } of patches) {
    await client.patch(id).set(patch.set).commit();
    console.log(`patched ${id}`);
  }
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
