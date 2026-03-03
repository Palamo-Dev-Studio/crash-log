// ABOUTME: Story document schema — an individual just-the-facts reporting block.
// ABOUTME: Referenced by issues, with severity-driven styling and bilingual fields.

export default {
  name: "story",
  title: "Story",
  type: "document",
  groups: [
    { name: "english", title: "English", default: true },
    { name: "spanish", title: "Español" },
    { name: "meta", title: "Meta" },
  ],
  fields: [
    // Shared
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "meta",
      options: { source: "headline.en" },
    },
    {
      name: "severity",
      title: "Severity",
      type: "string",
      group: "meta",
      options: {
        list: ["ERROR", "OVERRIDE", "TERMINATE", "WARNING", "CRITICAL", "BREACH"],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      group: "meta",
    },
    {
      name: "sources",
      title: "Sources",
      type: "array",
      of: [{ type: "sourceLink" }],
      group: "meta",
      description: "Shared — source links stay in their original language",
    },

    // Localized
    {
      name: "headline",
      title: "Headline",
      type: "localizedString",
      group: "english",
      description:
        "EN: ERROR: OpRoom.med // Patch_Not_Safe · ES: ERROR: OpRoom.med // Parche_Inseguro",
    },
    {
      name: "tags",
      title: "Tags",
      type: "localizedString",
      group: "english",
      description:
        'Tag line shown below the headline, e.g. "sector:medical-ai / device:trudi-nav / status:adverse-events"',
    },
    {
      name: "body",
      title: "Body",
      type: "localizedBlockContent",
      group: "english",
    },
  ],
  preview: {
    select: {
      headline: "headline.en",
      severity: "severity",
      hasEs: "headline.es",
    },
    prepare({ headline, severity, hasEs }) {
      return {
        title: headline || "Untitled",
        subtitle: `${severity || "—"} · ${hasEs ? "EN + ES" : "EN only"}`,
      };
    },
  },
};
