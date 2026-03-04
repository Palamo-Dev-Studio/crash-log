# The Crash Log — Sanity Content Model (Revised)

Based on the actual newsletter structure and inspired by
The Latino Newsletter's clean Beehiiv layout.

---

## Newsletter Structure (Top to Bottom)

```
┌─────────────────────────────────────────────┐
│  HEADER                                     │
│  The Crash Log wordmark / logo              │
│  Issue number · Date                        │
├─────────────────────────────────────────────┤
│  COVER IMAGE                                │
│  Single composite image for the issue       │
│  (the Nano Banana triptych-style visual)    │
├─────────────────────────────────────────────┤
│  NICO'S TRANSMISSION                        │
│  Editorial intro in Nico von Bot's voice    │
│  Sets the tone, connects the threads        │
├─────────────────────────────────────────────┤
│  STORY 1                                    │
│  ERROR: OpRoom.med // Patch_Not_Safe        │
│  Just-the-facts reporting block             │
├─────────────────────────────────────────────┤
│  STORY 2                                    │
│  OVERRIDE: MilAccess.gov // RedLines_In_... │
│  Just-the-facts reporting block             │
├─────────────────────────────────────────────┤
│  STORY 3                                    │
│  TERMINATE: Block.hr // Headcount_Depre...  │
│  Just-the-facts reporting block             │
├─────────────────────────────────────────────┤
│  (additional stories as needed)             │
├─────────────────────────────────────────────┤
│  STACK TRACE                                │
│  Three one-two sentence minor story hits    │
│  Quick-fire signals, linked                 │
├─────────────────────────────────────────────┤
│  FOOTER                                     │
│  "Scoop and Root contributed to this        │
│   reporting" (italics)                      │
│                                             │
│  Hector Luis Alamo edited and published     │
│  this edition of The Crash Log.             │
├─────────────────────────────────────────────┤
│  DONATE CTA                                 │
│  "Nico and the AI team burn through tokens  │
│   like human newsrooms burn through coffee. │
│   Your donation keeps The Crash Log         │
│   hallucination-free and independent — and  │
│   Nico's context window wide open."         │
│                                             │
│  [ Donate ] button                          │
├─────────────────────────────────────────────┤
│  SUBSCRIBE CTA                              │
│  Sign-up form / link                        │
└─────────────────────────────────────────────┘
```

---

## Document Types

---

### 1. `issue`

One per newsletter edition. The top-level container.

| Field               | Type                             | Notes                                                                |
| ------------------- | -------------------------------- | -------------------------------------------------------------------- |
| `title`             | string                           | Display title, e.g. "Crash Log #014"                                 |
| `slug`              | slug                             | URL path: `/issue/crash-log-014`                                     |
| `issueNumber`       | number                           | Sequential ordering                                                  |
| `publishDate`       | datetime                         | Controls build triggers and Beehiiv push                             |
| `status`            | string enum                      | `draft` · `review` · `scheduled` · `published`                       |
| `coverImage`        | image                            | The single composite visual for the issue                            |
| `coverImageAlt`     | string                           | Accessibility text                                                   |
| `coverImagePrompt`  | text                             | Nano Banana prompt used to generate image                            |
| `nicosTransmission` | blockContent                     | Nico von Bot's editorial intro — sets the tone, connects the threads |
| `stories`           | array of references → `story`    | Ordered main stories (just-the-facts blocks)                         |
| `stackTrace`        | array of `stackTraceHit` (max 3) | Three quick-fire minor stories                                       |
| `metaDescription`   | text                             | SEO / OpenGraph description                                          |
| `beehiivStatus`     | string enum                      | `not_sent` · `queued` · `sent`                                       |

**Note:** The footer lines ("Scoop and Root contributed..." and
"Hector Luis Alamo edited and published...") are hardcoded in
the Next.js template, not stored as content — they appear on
every issue identically. If the contributors or editor change,
update the template or make them site-level settings in Sanity.

---

### 2. `story`

An individual just-the-facts reporting block within an issue.
No editorial opinion here — that's Nico's job in the transmission.

| Field      | Type                   | Notes                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------- |
| `headline` | string                 | System-error-style header: `ERROR: OpRoom.med // Patch_Not_Safe`       |
| `slug`     | slug                   | Defined anchor within the issue page                                   |
| `severity` | string enum            | `ERROR` · `OVERRIDE` · `TERMINATE` · `WARNING` · `CRITICAL` · `BREACH` |
| `category` | reference → `category` | Which beat this covers                                                 |
| `body`     | blockContent           | Sourced, linked, just-the-facts reporting                              |
| `sources`  | array of `sourceLink`  | Explicit attribution block                                             |

**What's NOT here:** No `nicoTake` field. The editorial voice lives
only in `nicosTransmission` at the top of each issue. The stories
themselves stay clean — reported facts only. This is a deliberate
editorial choice that keeps The Crash Log's credibility sharp:
Nico editorializes up top, then the facts speak for themselves below.

---

### 3. `stackTraceHit`

A reusable object (not a standalone document) embedded in the issue.
These are the quick hits — one to two sentences max, always exactly three.

| Field          | Type   | Notes                        |
| -------------- | ------ | ---------------------------- |
| `text`         | text   | One-two sentence minor story |
| `sourceUrl`    | url    | Link to the original report  |
| `sourceOutlet` | string | "Wired", "TechCrunch", etc.  |

**Design note:** On the site, these render under a `## Stack Trace`
header styled like a terminal log — monospace, compact, maybe with
line numbers or timestamps for flavor.

---

### 4. `category`

Recurring beats / verticals.

| Field         | Type   | Notes                                          |
| ------------- | ------ | ---------------------------------------------- |
| `name`        | string | e.g. "Medical AI", "Defense & Policy"          |
| `slug`        | slug   | For filtered archive views: `/beat/medical-ai` |
| `description` | text   | Short description for beat page header         |
| `color`       | color  | Accent color for tags and category pages       |

**Starter beats:**

- Medical AI
- Defense & Policy
- Labor & Automation
- Surveillance & Privacy
- Foundation Models
- Regulation & Governance
- Robotics & Hardware

---

### 5. `sourceLink`

Reusable object embedded inside stories.

| Field    | Type   | Notes                     |
| -------- | ------ | ------------------------- |
| `outlet` | string | "Reuters", "AP", "FDA"    |
| `title`  | string | Article or document title |
| `url`    | url    | Direct link               |

---

### 6. `agent`

The Crash Log's masthead — the full AI newsroom team plus the human editor.

| Field          | Type                | Notes                                                                                                         |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `name`         | string              | "Nico von Bot", "Gabo", "Scoop", "Root", "Lupe", "Hector Luis Alamo"                                          |
| `role`         | string              | "Managing Editor", "Staff Writer", "Investigations", "Research", "Social Correspondent", "Editor & Publisher" |
| `type`         | string enum         | `lead_agent` · `sub_agent` · `human`                                                                          |
| `model`        | string              | e.g. "Sonnet 4.6" — only relevant for lead agent                                                              |
| `spawnedBy`    | reference → `agent` | Which agent spins up this sub-agent (null for Nico and Hector)                                                |
| `avatar`       | image               | Photo (Hector), character art (Nico), or Nano Banana-generated portrait                                       |
| `bio`          | text                | Short personality/role description                                                                            |
| `displayOrder` | number              | Controls masthead ordering                                                                                    |

**The Roster:**

| Name              | Role                 | Type         | Spawned By |
| ----------------- | -------------------- | ------------ | ---------- |
| Nico von Bot      | Managing Editor      | `lead_agent` | —          |
| Gabo              | Staff Writer         | `sub_agent`  | Nico       |
| Scoop             | Investigations       | `sub_agent`  | Nico       |
| Root              | Research             | `sub_agent`  | Nico       |
| Lupe              | Social Correspondent | `sub_agent`  | Nico       |
| Hector Luis Alamo | Editor & Publisher   | `human`      | —          |

---

### 7. `aboutPage`

Singleton document for the /about page. Combines narrative copy,
the masthead, and workflow transparency.

| Field             | Type                          | Notes                                                                                                                                           |
| ----------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `introParagraph`  | blockContent                  | What The Crash Log is and why it exists                                                                                                         |
| `workflowSection` | blockContent                  | How the AI newsroom works — the OpenClaw platform, Discord as the channel, how Nico spins up sub-agents via the Gateway, the editorial pipeline |
| `contactCTA`      | blockContent                  | Invitation for questions, comments, tips                                                                                                        |
| `contactEmail`    | string                        | Email address for reader contact                                                                                                                |
| `masthead`        | array of references → `agent` | Ordered team list — renders with avatars, names, roles, bios                                                                                    |

**About Page Structure (Top to Bottom):**

```
┌─────────────────────────────────────────────┐
│  THE CRASH LOG                              │
│  "AI & Tech Gone Mad"                      │
├─────────────────────────────────────────────┤
│  INTRO                                      │
│  What this is. Why it exists. The premise.  │
│  Voice: direct, slightly wry, confident.    │
├─────────────────────────────────────────────┤
│  THE MASTHEAD                               │
│                                             │
│  [photo]  Nico von Bot                      │
│           Managing Editor                   │
│           Runs on Sonnet 4.6                │
│           Bio blurb                         │
│                                             │
│  [photo]  Gabo                              │
│           Staff Writer                      │
│           Sub-agent · Spun up by Nico       │
│           Bio blurb                         │
│                                             │
│  [photo]  Scoop                             │
│           Investigations                    │
│           Sub-agent · Spun up by Nico       │
│           Bio blurb                         │
│                                             │
│  [photo]  Root                              │
│           Research                          │
│           Sub-agent · Spun up by Nico       │
│           Bio blurb                         │
│                                             │
│  [photo]  Lupe                              │
│           Social Correspondent              │
│           Sub-agent · Spun up by Nico       │
│           Bio blurb                         │
│                                             │
│  [photo]  Hector Luis Alamo                 │
│           Editor & Publisher                │
│           The human in the loop             │
│           Bio blurb                         │
├─────────────────────────────────────────────┤
│  HOW IT WORKS                               │
│  The OpenClaw platform explained:           │
│  - Nico as lead agent on Sonnet 4.6        │
│  - Discord as the OpenClaw channel         │
│  - How sub-agents get routed via Gateway   │
│  - The editorial pipeline from signal to   │
│    published issue                          │
│  - Where the human intervenes              │
│  Written for people curious about building  │
│  their own agent setups with OpenClaw       │
├─────────────────────────────────────────────┤
│  CONTACT                                    │
│  Questions, comments, tips welcome.         │
│  Email / contact form                       │
├─────────────────────────────────────────────┤
│  [ Feed the Bots ]                          │
└─────────────────────────────────────────────┘
```

---

### 8. `siteSettings`

A singleton document for site-wide configuration.

| Field               | Type                       | Notes                                                                                                                                                                                            |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `newsletterName`    | string                     | "The Crash Log"                                                                                                                                                                                  |
| `tagline`           | string                     | "AI & Tech Gone Mad"                                                                                                                                                                             |
| `editorName`        | string                     | "Hector Luis Alamo"                                                                                                                                                                              |
| `editorCredit`      | string                     | Template for the footer credit line                                                                                                                                                              |
| `contributorCredit` | string                     | "Scoop and Root contributed to this reporting"                                                                                                                                                   |
| `subscribeCTA`      | text                       | Text for the subscribe call-to-action                                                                                                                                                            |
| `donateCTA`         | text                       | "Nico and the AI team burn through tokens like human newsrooms burn through coffee. Your donation keeps The Crash Log hallucination-free and independent — and Nico's context window wide open." |
| `donateUrl`         | url                        | Link to donation platform (Monkeypod, Ko-fi, etc.)                                                                                                                                               |
| `donateButtonText`  | string                     | "Feed the Bots"                                                                                                                                                                                  |
| `socialLinks`       | array of { platform, url } | Twitter/X, Bluesky, etc.                                                                                                                                                                         |

This singleton means you update the editor or contributor names
in one place and every issue reflects the change.

---

## Severity Enum → Design Tokens

Each severity level maps directly to visual styling in Next.js components.

| Value       | Use Case                                   | Color         | Icon Idea |
| ----------- | ------------------------------------------ | ------------- | --------- |
| `ERROR`     | System failures, malfunctions, real harm   | Red           | ⊘         |
| `OVERRIDE`  | Power moves, policy clashes, forced access | Amber         | ⇧         |
| `TERMINATE` | Job cuts, shutdowns, deprecations          | Cool gray     | ■         |
| `WARNING`   | Emerging risks, early signals              | Yellow        | △         |
| `CRITICAL`  | Existential-scale, major regulatory moves  | Deep red      | ◉         |
| `BREACH`    | Data leaks, privacy violations             | Electric blue | ⟐         |

---

## Relationships Map

```
issue
├── coverImage + coverImagePrompt
├── nicosTransmission (editorial intro — the only editorial voice)
├── stories[] ──→ story
│                  ├── severity (drives styling)
│                  ├── category ──→ category
│                  ├── body (just-the-facts reporting)
│                  └── sources[] (sourceLink objects)
├── stackTrace[] (3 quick hits)
│     ├── text
│     ├── sourceUrl
│     └── sourceOutlet
├── footer (hardcoded in template, pulled from siteSettings)
│     ├── "Scoop and Root contributed to this reporting"
│     ├── "Hector Luis Alamo edited and published this edition..."
│     └── donate CTA + donate button
└── metadata (SEO, Beehiiv sync status)
```

---

## Content Workflow

```
 WRITE               REVIEW              PUBLISH              DISTRIBUTE
┌───────────┐    ┌───────────────┐    ┌───────────────┐    ┌────────────────┐
│ Draft in   │───→│ Status:       │───→│ Status:       │───→│ Next.js page   │
│ Sanity     │    │ "review"      │    │ "published"   │    │ goes live      │
│ Studio     │    │               │    │               │    │                │
│            │    │ Preview on    │    │ Webhook       │    │ Beehiiv API    │
│            │    │ Next.js       │    │ fires         │    │ sends email    │
└───────────┘    └───────────────┘    └───────────────┘    └────────────────┘
```

---

## Pages This Model Enables

| Route           | What It Shows                                                            |
| --------------- | ------------------------------------------------------------------------ |
| `/`             | Latest issue, subscribe CTA, Nico's latest transmission                  |
| `/issue/[slug]` | Full issue page — the canonical reading experience                       |
| `/archive`      | Reverse-chronological issue index with cover images                      |
| `/beat/[slug]`  | All stories in a category across all issues                              |
| `/about`        | The masthead, workflow explainer, and contact — the "meet the bots" page |
| `/studio`       | Sanity Studio (authenticated editing interface)                          |

---

## Key Differences from Latino Newsletter Model

| Aspect          | Latino Newsletter                    | The Crash Log                                   |
| --------------- | ------------------------------------ | ----------------------------------------------- |
| Voice location  | Throughout (author byline per piece) | Top only (Nico's Transmission)                  |
| Story tone      | Mix of opinion and reporting         | Just-the-facts only in story blocks             |
| End section     | "What We're Reading" (curated links) | "Stack Trace" (three quick original hits)       |
| Footer credit   | Editor name                          | Contributor line + Editor name                  |
| Visual identity | Clean news layout                    | System-error aesthetic, severity-driven styling |
| Images          | Per-story photos                     | Single composite cover image per issue          |
