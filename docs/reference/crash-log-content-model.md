# The Crash Log — Sanity Content Model

## Document Types

---

### 1. `issue`

The top-level container. One per newsletter edition.

| Field                 | Type                          | Notes                                                        |
| --------------------- | ----------------------------- | ------------------------------------------------------------ |
| `title`               | string                        | e.g. "Crash Log #014"                                        |
| `slug`                | slug (from title)             | URL path: `/issue/crash-log-014`                             |
| `issueNumber`         | number                        | Sequential, used for ordering and display                    |
| `publishDate`         | datetime                      | Controls scheduled builds and Beehiiv push                   |
| `status`              | string enum                   | `draft` · `review` · `scheduled` · `published`               |
| `coverImage`          | image                         | Hero image for the issue (the combined visual)               |
| `coverImageAlt`       | string                        | Accessibility text for cover                                 |
| `openingTransmission` | blockContent                  | Nico's intro — the editorial voice that opens each issue     |
| `stories`             | array of references → `story` | Ordered list of stories in this issue                        |
| `closingSignal`       | blockContent                  | Nico's sign-off, recurring tagline, or teaser for next issue |
| `metaDescription`     | text                          | SEO / OpenGraph description                                  |
| `beehiivStatus`       | string enum                   | `not_sent` · `queued` · `sent` — tracks email sync           |

---

### 2. `story`

An individual story block within an issue. This is where the reporting lives.

| Field              | Type                   | Notes                                                                                          |
| ------------------ | ---------------------- | ---------------------------------------------------------------------------------------------- |
| `headline`         | string                 | The system-error-style header, e.g. `ERROR: OpRoom.med // Patch_Not_Safe`                      |
| `slug`             | slug                   | For defined anchors within the issue page                                                      |
| `category`         | reference → `category` | Which beat this falls under                                                                    |
| `severity`         | string enum            | `ERROR` · `OVERRIDE` · `TERMINATE` · `WARNING` · `CRITICAL` · `BREACH` — drives visual styling |
| `body`             | blockContent           | The reported facts — sourced, linked, attributed                                               |
| `nicoTake`         | blockContent           | Nico's editorial read on the story — the "so what"                                             |
| `storyImage`       | image                  | Individual story image if different from the combined cover                                    |
| `storyImageAlt`    | string                 | Accessibility text                                                                             |
| `storyImagePrompt` | text                   | The Nano Banana prompt used to generate the image (archival reference)                         |
| `sources`          | array of `sourceLink`  | Explicit source attribution block                                                              |

---

### 3. `category`

The recurring beats / verticals The Crash Log covers.

| Field         | Type   | Notes                                                       |
| ------------- | ------ | ----------------------------------------------------------- |
| `name`        | string | e.g. "Medical AI", "Defense & Policy", "Labor & Automation" |
| `slug`        | slug   | For filtered archive views: `/beat/medical-ai`              |
| `description` | text   | Short description for the beat page header                  |
| `icon`        | string | Emoji or icon reference for UI treatment                    |
| `color`       | color  | Accent color used in tags and category pages                |

**Starter categories based on current content:**

- Medical AI
- Defense & Policy
- Labor & Automation
- Surveillance & Privacy
- Foundation Models
- Regulation & Governance
- Robotics & Hardware

---

### 4. `author`

Even though Nico is the managing editor, you may want guest voices or need to distinguish Nico from you (the human behind the curtain).

| Field    | Type    | Notes                                                    |
| -------- | ------- | -------------------------------------------------------- |
| `name`   | string  | "Nico von Bot", your name, guest names                   |
| `role`   | string  | "Managing Editor", "Human Correspondent", "Guest Signal" |
| `avatar` | image   | Character art or headshot                                |
| `bio`    | text    | Short bio blurb                                          |
| `isAI`   | boolean | Flag for display treatment (badge, label, etc.)          |

---

### 5. `sourceLink`

A reusable object (not a document) embedded inside stories.

| Field        | Type   | Notes                                 |
| ------------ | ------ | ------------------------------------- |
| `outlet`     | string | "Reuters", "AP", "FDA MAUDE Database" |
| `title`      | string | Article or report title               |
| `url`        | url    | Direct link                           |
| `accessDate` | date   | When the source was accessed          |

---

## Enums Reference

### Severity Levels

These double as both editorial taxonomy and visual design tokens. Each one maps to a color, icon, and tone in your Next.js components.

| Value       | Use Case                                            | Suggested Color  |
| ----------- | --------------------------------------------------- | ---------------- |
| `ERROR`     | System failures, malfunctions, bugs with real harm  | Red              |
| `OVERRIDE`  | Power moves, policy clashes, forced access          | Amber            |
| `TERMINATE` | Job cuts, shutdowns, deprecations                   | Cool gray        |
| `WARNING`   | Emerging risks, early signals                       | Yellow           |
| `CRITICAL`  | Existential-scale stories, major regulatory moves   | Deep red / black |
| `BREACH`    | Data leaks, privacy violations, unauthorized access | Electric blue    |

---

## Relationships Map

```
issue
├── coverImage
├── openingTransmission (Nico's intro)
├── stories[] ──→ story
│                  ├── category ──→ category
│                  ├── sources[] (sourceLink objects)
│                  ├── body (reported facts)
│                  └── nicoTake (editorial voice)
├── closingSignal (Nico's sign-off)
└── metadata (SEO, Beehiiv sync status)
```

---

## Content Workflow

```
 WRITE              REVIEW             PUBLISH              DISTRIBUTE
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────────┐
│ Draft in  │───→│ Status:      │───→│ Status:      │───→│ Next.js page  │
│ Sanity    │    │ "review"     │    │ "published"  │    │ goes live     │
│ Studio    │    │              │    │              │    │               │
│           │    │ Preview on   │    │ Webhook      │    │ Beehiiv API   │
│           │    │ Next.js      │    │ fires        │    │ sends email   │
└──────────┘    └──────────────┘    └──────────────┘    └───────────────┘
```

---

## Archive & Discovery Pages This Enables

- `/` — Latest issue, subscribe CTA
- `/issue/[slug]` — Individual issue page
- `/archive` — Reverse-chronological issue index
- `/beat/[slug]` — All stories in a category across issues
- `/beat/[slug]/rss` — Per-category RSS feeds
- `/studio` — Sanity Studio (authenticated, your editing interface)
