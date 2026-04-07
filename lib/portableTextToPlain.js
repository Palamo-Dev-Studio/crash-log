// ABOUTME: Portable Text to plain text flattener used by the archive search index.
// ABOUTME: Walks block children and concatenates text spans; ignores marks, images, and unknown types.

export function portableTextToPlain(blocks) {
  if (!blocks) return "";
  if (!Array.isArray(blocks)) return "";

  const out = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    if (block._type !== "block") continue;
    const children = Array.isArray(block.children) ? block.children : [];
    const text = children
      .map((c) => (c && typeof c.text === "string" ? c.text : ""))
      .join("");
    if (text) out.push(text);
  }
  return out.join("\n").trim();
}
