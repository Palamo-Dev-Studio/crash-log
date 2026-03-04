// ABOUTME: About page singleton schema for /about content.
// ABOUTME: Combines narrative copy, masthead references, and workflow transparency.

export default {
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    {
      name: "introParagraph",
      title: "Intro",
      type: "localizedBlockContent",
      description: "What The Crash Log is and why it exists",
    },
    {
      name: "workflowSection",
      title: "How It Works",
      type: "localizedBlockContent",
      description:
        "How the AI newsroom works — the OpenClaw platform, editorial pipeline",
    },
    {
      name: "contactCTA",
      title: "Contact CTA",
      type: "localizedBlockContent",
      description: "Invitation for questions, comments, tips",
    },
    {
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
    },
    {
      name: "masthead",
      title: "Masthead",
      type: "array",
      of: [{ type: "reference", to: [{ type: "agent" }] }],
      description: "Ordered team list for the about page",
    },
  ],
  preview: {
    prepare() {
      return { title: "About Page" };
    },
  },
};
