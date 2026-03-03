// ABOUTME: Reusable localized string type for EN/ES bilingual fields.
// ABOUTME: English is required, Spanish is optional with fallback behavior.

export default {
  name: "localizedString",
  title: "Localized String",
  type: "object",
  fields: [
    {
      name: "en",
      title: "English",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "es",
      title: "Español",
      type: "string",
    },
  ],
};
