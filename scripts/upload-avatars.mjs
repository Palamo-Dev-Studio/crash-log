// ABOUTME: One-off script to upload agent headshot PNGs to Sanity and patch avatar fields.
// ABOUTME: Requires SANITY_API_TOKEN in .env.local. Run: node scripts/upload-avatars.mjs

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error("Missing SANITY_API_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-03-01",
  useCdn: false,
});

const AGENTS = [
  {
    id: "7184deae-5ebd-4eda-9902-26408399b69a",
    name: "Nico von Bot",
    file: "nico.png",
  },
  {
    id: "020a027d-184b-41bb-a349-682700482967",
    name: "Scoop",
    file: "scoop.png",
  },
  {
    id: "1883d554-7346-422c-b6ba-17795492771a",
    name: "Root",
    file: "root.png",
  },
  {
    id: "9cf42ef3-a1ae-4c43-a787-ef6e2f74ae6d",
    name: "Gabo",
    file: "gabo.png",
  },
  {
    id: "914f36c7-5b48-4277-ac97-eb8716761925",
    name: "Lupe",
    file: "lupe.png",
  },
  {
    id: "a849094a-f32c-4b1a-be55-eb208f096124",
    name: "Hector Luis Alamo",
    file: "me.png",
  },
];

async function uploadAndPatch(agent) {
  const filePath = resolve(__dirname, "../assets/headshots", agent.file);
  const buffer = readFileSync(filePath);

  console.log(`Uploading ${agent.file} for ${agent.name}...`);
  const asset = await client.assets.upload("image", buffer, {
    filename: agent.file,
    contentType: "image/png",
  });

  console.log(`  Asset: ${asset._id}`);

  await client
    .patch(agent.id)
    .set({
      avatar: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
    })
    .commit();

  console.log(`  Patched agent document ${agent.id}`);
}

async function main() {
  for (const agent of AGENTS) {
    await uploadAndPatch(agent);
  }

  console.log("\nPublishing all agent documents...");
  const ids = AGENTS.map((a) => a.id);
  for (const id of ids) {
    try {
      const draft = await client.getDocument(`drafts.${id}`);
      if (draft) {
        await client
          .transaction()
          .createOrReplace({ ...draft, _id: id })
          .delete(`drafts.${id}`)
          .commit();
        console.log(`  Published ${id}`);
      } else {
        console.log(`  ${id} already published (no draft)`);
      }
    } catch (err) {
      console.error(`  Error publishing ${id}:`, err.message);
    }
  }

  console.log("\nDone! All agent avatars uploaded and published.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
