// ABOUTME: Stack Trace hit object type — a quick-fire minor story embedded in issues.
// ABOUTME: Each issue has up to 3 stack trace hits with localized text.

export default {
  name: "stackTraceHit",
  title: "Stack Trace Hit",
  type: "object",
  fields: [
    {
      name: "text",
      title: "Text",
      type: "localizedText",
    },
    {
      name: "sourceUrl",
      title: "Source URL",
      type: "url",
    },
    {
      name: "sourceOutlet",
      title: "Source Outlet",
      type: "string",
      description: 'e.g. "Wired", "TechCrunch", "Reuters"',
    },
  ],
  preview: {
    select: { text: "text.en", outlet: "sourceOutlet" },
    prepare({ text, outlet }) {
      return {
        title: text ? (text.length > 60 ? text.slice(0, 60) + "..." : text) : "Untitled",
        subtitle: outlet || "",
      };
    },
  },
};
