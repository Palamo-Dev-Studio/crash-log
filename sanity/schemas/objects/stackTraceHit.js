// ABOUTME: Stack Trace hit object type — a quick-fire minor story embedded in issues.
// ABOUTME: Each hit has rich text (supports hyperlinks) and an array of source links.

export default {
  name: "stackTraceHit",
  title: "Stack Trace Hit",
  type: "object",
  fields: [
    {
      name: "text",
      title: "Text",
      type: "localizedBlockContent",
    },
    {
      name: "sources",
      title: "Sources",
      type: "array",
      of: [{ type: "sourceLink" }],
    },
  ],
  preview: {
    select: { blocks: "text.en", outlet: "sources" },
    prepare({ blocks, outlet }) {
      const text = blocks
        ?.map((b) => b.children?.map((c) => c.text).join(""))
        .join(" ");
      const outletNames = outlet?.map((s) => s.outlet).join(", ") || "";
      return {
        title: text
          ? text.length > 60
            ? text.slice(0, 60) + "..."
            : text
          : "Untitled",
        subtitle: outletNames,
      };
    },
  },
};
