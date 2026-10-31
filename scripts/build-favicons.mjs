// ABOUTME: Renders app/favicon.ico (16 + 32 px PNG payloads) and app/icon.png (32 px) from public/roundel-simple.svg.
// ABOUTME: Adds a filled cream disc inside the ink ring so the mark stays visible on dark browser tabs. Run: node scripts/build-favicons.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const CREAM = "#F4ECDD";

// The ring is stroked at r=21 with no fill; insert a cream disc beneath it.
const source = readFileSync(resolve(root, "public/roundel-simple.svg"), "utf8");
const marker = '<circle cx="24" cy="24" r="21" fill="none"';
if (!source.includes(marker)) {
  throw new Error("roundel-simple.svg no longer starts with the expected ring");
}
const svg = source.replace(
  marker,
  `<circle cx="24" cy="24" r="21" fill="${CREAM}"/>${marker}`
);

async function renderPng(size) {
  return sharp(Buffer.from(svg), { density: ((72 * size) / 48) * 4 })
    .resize(size, size)
    .png()
    .toBuffer();
}

// ICO container: 6-byte header, 16-byte directory entries, then the PNG payloads.
function packIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // width
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const png16 = await renderPng(16);
const png32 = await renderPng(32);

writeFileSync(
  resolve(root, "app/favicon.ico"),
  packIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
  ])
);
writeFileSync(resolve(root, "app/icon.png"), png32);
console.log("Wrote app/favicon.ico (16, 32) and app/icon.png (32)");
