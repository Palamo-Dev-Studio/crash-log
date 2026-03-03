// ABOUTME: Agent (masthead member) schema for the AI newsroom team + human editor.
// ABOUTME: Powers the about page masthead with bios, roles, and avatar images.

export default {
  name: "agent",
  title: "Agent",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "role",
      title: "Role",
      type: "localizedString",
      description: 'e.g. "Managing Editor", "Staff Writer"',
    },
    {
      name: "agentType",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Lead Agent", value: "lead_agent" },
          { title: "Sub-Agent", value: "sub_agent" },
          { title: "Human", value: "human" },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "model",
      title: "Model",
      type: "string",
      description: 'e.g. "Sonnet 4.6" — only relevant for lead agent',
    },
    {
      name: "spawnedBy",
      title: "Spawned By",
      type: "reference",
      to: [{ type: "agent" }],
      description: "Which agent spins up this sub-agent (null for Nico and Hector)",
    },
    {
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "bio",
      title: "Bio",
      type: "localizedText",
    },
    {
      name: "color",
      title: "Accent Color",
      type: "string",
      description: "Hex color for the agent, e.g. #FF3B30",
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Controls masthead ordering (lower = first)",
    },
  ],
  preview: {
    select: { name: "name", role: "role.en", type: "agentType" },
    prepare({ name, role, type }) {
      const typeLabel =
        type === "lead_agent"
          ? "Lead Agent"
          : type === "sub_agent"
            ? "Sub-Agent"
            : "Human";
      return {
        title: name || "Untitled",
        subtitle: `${role || ""} · ${typeLabel}`,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "displayOrder",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
};
