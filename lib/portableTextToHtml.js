// ABOUTME: Portable Text to HTML converter for email templates.
// ABOUTME: Mirrors lib/portableText.js but outputs HTML strings via @portabletext/to-html.

import { toHTML } from "@portabletext/to-html";
import { urlFor } from "@/lib/sanity";
import { escapeHtml, sanitizeHref } from "@/lib/htmlUtils";

const components = {
  block: {
    normal: ({ children }) => `<p>${children}</p>`,
    h2: ({ children }) => `<h2>${children}</h2>`,
    h3: ({ children }) => `<h3>${children}</h3>`,
    blockquote: ({ children }) =>
      `<blockquote style="border-left: 3px solid #555; padding-left: 16px; margin: 16px 0; font-style: italic; color: #b0b0b5;">${children}</blockquote>`,
  },
  marks: {
    strong: ({ children }) => `<strong>${children}</strong>`,
    em: ({ children }) => `<em>${children}</em>`,
    code: ({ children }) =>
      `<code style="background: #2a2a2e; padding: 2px 6px; border-radius: 3px; font-family: 'IBM Plex Mono', monospace; font-size: 0.9em;">${children}</code>`,
    link: ({ value, children }) => {
      const href = sanitizeHref(value?.href || "#");
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #30c8e8; text-decoration: underline;">${children}</a>`;
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return "";
      const url = urlFor(value).width(720).format("jpg").url();
      const alt = escapeHtml(value.alt || "Article image");
      return `<figure style="margin: 24px 0;"><img src="${url}" alt="${alt}" width="720" style="width: 100%; height: auto; border-radius: 4px;" /></figure>`;
    },
  },
};

export function portableTextToHtml(blocks) {
  if (!blocks || (Array.isArray(blocks) && blocks.length === 0)) return "";
  return toHTML(blocks, { components });
}
