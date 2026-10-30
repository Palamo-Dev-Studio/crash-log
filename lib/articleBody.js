// ABOUTME: Prepares an article's Portable Text: gives every H2 (and "Your turn" block) a unique anchor id and numbers exhibits.
// ABOUTME: The TOC and the rendered headings both read the ids computed here, so they cannot disagree.

import { ARTICLE_LABELS } from "@/lib/articleLabels";

// Lowercase, accents stripped, runs of non-alphanumerics become one hyphen.
export function slugifyHeading(text) {
  const slug = String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join("-");
  return slug || "section";
}

function blockText(block) {
  const children = Array.isArray(block.children) ? block.children : [];
  return children
    .map((c) => (c && typeof c.text === "string" ? c.text : ""))
    .join("")
    .trim();
}

// Returns { blocks, toc }. `blocks` are copies carrying `_tocId` (headings, replyAsk)
// and `_figNo` (exhibits); `toc` is [{ id, text }] in document order. Ids depend only on
// the content, so server and client agree. A repeated heading gets -2, -3, ...
// Ids already used by the page chrome (the layout's skip-link target).
const RESERVED_IDS = ["main-content"];

export function prepareArticleBody(body, locale) {
  const labels = ARTICLE_LABELS[locale] || ARTICLE_LABELS.en;
  const used = new Set(RESERVED_IDS);
  const toc = [];
  let figures = 0;

  function claim(text) {
    const base = slugifyHeading(text);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    toc.push({ id, text });
    return id;
  }

  const blocks = (Array.isArray(body) ? body : []).map((block) => {
    if (!block || typeof block !== "object") return block;
    if (block._type === "block" && block.style === "h2") {
      const text = blockText(block);
      return text ? { ...block, _tocId: claim(text) } : block;
    }
    if (block._type === "replyAsk") {
      const text = (block.title || "").trim() || labels.replyDefault;
      return { ...block, _tocId: claim(text) };
    }
    if (block._type === "exhibit") {
      figures += 1;
      return { ...block, _figNo: figures };
    }
    return block;
  });

  return { blocks, toc };
}
