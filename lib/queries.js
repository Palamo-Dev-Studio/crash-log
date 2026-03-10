// ABOUTME: GROQ queries and fetch wrappers for all Sanity content types.
// ABOUTME: Provides fetchers for issues, archive, about page, categories, and stories.

import { sanityFetch } from "@/lib/sanity";

const ISSUE_PROJECTION = `{
  _id,
  _updatedAt,
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
  stackTrace[]{ text, sources[] }
}`;

export const LATEST_ISSUE_QUERY = `*[_type == "issue" && status == "published"] | order(publishDate desc)[0] ${ISSUE_PROJECTION}`;

export const ISSUE_BY_SLUG_QUERY = `*[_type == "issue" && status == "published" && slug.current == $slug][0] ${ISSUE_PROJECTION}`;

export const ALL_ISSUE_SLUGS_QUERY = `*[_type == "issue" && status == "published"]{ "slug": slug.current }`;

export const ALL_ISSUES_SUMMARY_QUERY = `*[_type == "issue" && status == "published"] | order(publishDate desc) { "slug": slug.current, publishDate, _updatedAt }`;

export async function getLatestIssue() {
  try {
    return await sanityFetch({ query: LATEST_ISSUE_QUERY });
  } catch {
    return null;
  }
}

export async function getIssueBySlug(slug) {
  try {
    return await sanityFetch({ query: ISSUE_BY_SLUG_QUERY, params: { slug } });
  } catch {
    return null;
  }
}

export async function getAllIssueSlugs() {
  try {
    return (await sanityFetch({ query: ALL_ISSUE_SLUGS_QUERY })) ?? [];
  } catch {
    return [];
  }
}

export async function getAllIssuesSummary() {
  try {
    return (await sanityFetch({ query: ALL_ISSUES_SUMMARY_QUERY })) ?? [];
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
  try {
    return (await sanityFetch({ query: ALL_ISSUES_FOR_ARCHIVE_QUERY })) ?? [];
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
  try {
    return await sanityFetch({ query: ABOUT_PAGE_QUERY });
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
  try {
    return (await sanityFetch({ query: ALL_CATEGORIES_QUERY })) ?? [];
  } catch {
    return [];
  }
}

// --- RSS Feed ---

export const ISSUES_FOR_FEED_QUERY = `*[_type == "issue" && status == "published"] | order(publishDate desc)[0...50] {
  _id,
  "slug": slug.current,
  publishDate,
  title,
  subtitle
}`;

export async function getIssuesForFeed() {
  try {
    return (await sanityFetch({ query: ISSUES_FOR_FEED_QUERY })) ?? [];
  } catch {
    return [];
  }
}

// --- Columns (Nico's Notes) ---

const COLUMN_PROJECTION = `{
  _id,
  _updatedAt,
  columnNumber,
  "slug": slug.current,
  publishDate,
  status,
  coverImage,
  coverImageAlt,
  title,
  subtitle,
  body,
  metaDescription
}`;

export const LATEST_COLUMN_QUERY = `*[_type == "column" && status == "published"] | order(publishDate desc)[0] ${COLUMN_PROJECTION}`;

export const COLUMN_BY_SLUG_QUERY = `*[_type == "column" && status == "published" && slug.current == $slug][0] ${COLUMN_PROJECTION}`;

export const ALL_COLUMN_SLUGS_QUERY = `*[_type == "column" && status == "published"]{ "slug": slug.current }`;

export const ALL_COLUMNS_FOR_ARCHIVE_QUERY = `*[_type == "column" && status == "published"] | order(publishDate desc) {
  _id,
  columnNumber,
  "slug": slug.current,
  publishDate,
  title,
  subtitle
}`;

export const COLUMNS_FOR_FEED_QUERY = `*[_type == "column" && status == "published"] | order(publishDate desc)[0...50] {
  _id,
  "slug": slug.current,
  publishDate,
  title,
  subtitle
}`;

export const ALL_COLUMNS_SUMMARY_QUERY = `*[_type == "column" && status == "published"] | order(publishDate desc) { "slug": slug.current, publishDate, _updatedAt }`;

export async function getLatestColumn() {
  try {
    return await sanityFetch({ query: LATEST_COLUMN_QUERY });
  } catch {
    return null;
  }
}

export async function getColumnBySlug(slug) {
  try {
    return await sanityFetch({ query: COLUMN_BY_SLUG_QUERY, params: { slug } });
  } catch {
    return null;
  }
}

export async function getAllColumnSlugs() {
  try {
    return (await sanityFetch({ query: ALL_COLUMN_SLUGS_QUERY })) ?? [];
  } catch {
    return [];
  }
}

export async function getAllColumnsForArchive() {
  try {
    return (await sanityFetch({ query: ALL_COLUMNS_FOR_ARCHIVE_QUERY })) ?? [];
  } catch {
    return [];
  }
}

export async function getColumnsForFeed() {
  try {
    return (await sanityFetch({ query: COLUMNS_FOR_FEED_QUERY })) ?? [];
  } catch {
    return [];
  }
}

export async function getAllColumnsSummary() {
  try {
    return (await sanityFetch({ query: ALL_COLUMNS_SUMMARY_QUERY })) ?? [];
  } catch {
    return [];
  }
}

// --- Category with Stories ---

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
  try {
    return await sanityFetch({
      query: CATEGORY_WITH_STORIES_QUERY,
      params: { slug },
    });
  } catch {
    return null;
  }
}
