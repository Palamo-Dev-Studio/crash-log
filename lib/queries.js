// ABOUTME: GROQ queries and fetch wrappers for all Sanity content types.
// ABOUTME: Provides fetchers for issues, archive, about page, categories, and stories.

import { client } from "@/lib/sanity";

const ISSUE_PROJECTION = `{
  _id,
  issueNumber,
  "slug": slug.current,
  publishDate,
  status,
  coverImage,
  coverImageAlt,
  title,
  subtitle,
  nicosTransmission,
  metaDescription,
  stories[]->{
    _id,
    slug,
    severity,
    headline,
    tags,
    body,
    category->{ name, slug },
    sources[]
  },
  stackTrace[]{ text, sourceUrl, sourceOutlet }
}`;

export const LATEST_ISSUE_QUERY = `*[_type == "issue" && status == "published"] | order(publishDate desc)[0] ${ISSUE_PROJECTION}`;

export const ISSUE_BY_SLUG_QUERY = `*[_type == "issue" && status == "published" && slug.current == $slug][0] ${ISSUE_PROJECTION}`;

export const ALL_ISSUE_SLUGS_QUERY = `*[_type == "issue" && status == "published"]{ "slug": slug.current }`;

export const ALL_ISSUES_SUMMARY_QUERY = `*[_type == "issue" && status == "published"] | order(publishDate desc) { "slug": slug.current, publishDate, _updatedAt }`;

export async function getLatestIssue() {
  if (!client) return null;
  try {
    return await client.fetch(LATEST_ISSUE_QUERY);
  } catch {
    return null;
  }
}

export async function getIssueBySlug(slug) {
  if (!client) return null;
  try {
    return await client.fetch(ISSUE_BY_SLUG_QUERY, { slug });
  } catch {
    return null;
  }
}

export async function getAllIssueSlugs() {
  if (!client) return [];
  try {
    return await client.fetch(ALL_ISSUE_SLUGS_QUERY);
  } catch {
    return [];
  }
}

export async function getAllIssuesSummary() {
  if (!client) return [];
  try {
    return await client.fetch(ALL_ISSUES_SUMMARY_QUERY);
  } catch {
    return [];
  }
}

// --- Archive ---

export const ALL_ISSUES_FOR_ARCHIVE_QUERY = `*[_type == "issue" && status == "published"] | order(publishDate desc) {
  _id,
  issueNumber,
  "slug": slug.current,
  publishDate,
  title,
  subtitle,
  coverImage,
  coverImageAlt,
  "severities": stories[]->severity
}`;

export async function getAllIssuesForArchive() {
  if (!client) return [];
  try {
    return await client.fetch(ALL_ISSUES_FOR_ARCHIVE_QUERY);
  } catch {
    return [];
  }
}

// --- About Page ---

export const ABOUT_PAGE_QUERY = `*[_type == "aboutPage"][0] {
  introParagraph,
  workflowSection,
  contactCTA,
  contactEmail,
  masthead[]->{ _id, name, role, agentType, model, avatar, bio, color, displayOrder } | order(displayOrder asc)
}`;

export async function getAboutPage() {
  if (!client) return null;
  try {
    return await client.fetch(ABOUT_PAGE_QUERY);
  } catch {
    return null;
  }
}

// --- Categories (Beats) ---

export const ALL_CATEGORIES_QUERY = `*[_type == "category"] {
  _id,
  "slug": slug.current,
  name,
  description,
  color,
  "storyCount": count(*[_type == "story" && references(^._id)])
} | order(name.en asc)`;

export async function getAllCategories() {
  if (!client) return [];
  try {
    return await client.fetch(ALL_CATEGORIES_QUERY);
  } catch {
    return [];
  }
}

export const CATEGORY_WITH_STORIES_QUERY = `{
  "category": *[_type == "category" && slug.current == $slug][0] {
    _id,
    "slug": slug.current,
    name,
    description,
    color
  },
  "stories": *[_type == "story" && category->slug.current == $slug] {
    _id,
    severity,
    headline,
    "issue": *[_type == "issue" && status == "published" && references(^._id)][0] {
      issueNumber,
      "slug": slug.current,
      publishDate,
      title
    }
  } | order(issue.publishDate desc)
}`;

export async function getCategoryWithStories(slug) {
  if (!client) return null;
  try {
    return await client.fetch(CATEGORY_WITH_STORIES_QUERY, { slug });
  } catch {
    return null;
  }
}
