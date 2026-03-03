// ABOUTME: Reusable localized text (multiline) type for EN/ES bilingual fields.
// ABOUTME: English is required, Spanish is optional with fallback behavior.

export default {
  name: "localizedText",
  title: "Localized Text",
  type: "object",
  fields: [
    {
      name: "en",
      title: "English",
      type: "text",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "es",
      title: "Español",
      type: "text",
    },
  ],
};
