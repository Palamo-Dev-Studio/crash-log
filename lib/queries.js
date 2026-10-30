// ABOUTME: GROQ queries and fetch wrappers for all Sanity content types.
// ABOUTME: Provides fetchers for issues, archive, about page, categories, and stories.

import { sanityFetch } from "@/lib/sanity";
import { time } from "@/lib/homeFiles";

const ISSUE_PROJECTION = `{
  _id,
  _type,
  _updatedAt,
  issueNumber,
  "slug": slug.current,
  publishDate,
  status,
  coverImage,
  coverImageAlt,
  title,
  subtitle,
  byline,
  nicosTransmission,
  metaDescription,
  stories[]->{
    _id,
    slug,
    severity,
    verdict,
    summary,
    image,
    imageAlt,
    imageCredit,
    headline,
    tags,
    body,
    category->{ name, slug },
    sources[]{ outlet, title, url, date }
  },
  stackTrace[]{ text, sources[] },
  themeFingerprint
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

// --- Adjacent Issues (prev/next by issueNumber) ---

export const ADJACENT_ISSUES_QUERY = `{
  "prev": *[_type == "issue" && status == "published" && issueNumber < $issueNumber] | order(issueNumber desc)[0] {
    issueNumber,
    "slug": slug.current,
    title
  },
  "next": *[_type == "issue" && status == "published" && issueNumber > $issueNumber] | order(issueNumber asc)[0] {
    issueNumber,
    "slug": slug.current,
    title
  }
}`;

export async function getAdjacentIssues(issueNumber) {
  try {
    const result = await sanityFetch({
      query: ADJACENT_ISSUES_QUERY,
      params: { issueNumber },
    });
    if (!result) return { prev: null, next: null };
    return result;
  } catch {
    return { prev: null, next: null };
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
  "severities": stories[]->severity,
  nicosTransmission,
  stackTrace[]{ text },
  stories[]->{
    headline,
    body,
    category->{ name, "slug": slug.current }
  }
}`;

export async function getAllIssuesForArchive() {
  try {
    return (await sanityFetch({ query: ALL_ISSUES_FOR_ARCHIVE_QUERY })) ?? [];
  } catch {
    return [];
  }
}

export const ALL_COLUMNS_FOR_ARCHIVE_SEARCH_QUERY = `*[_type == "column" && status == "published"] | order(publishDate desc) {
  _id,
  columnNumber,
  "slug": slug.current,
  publishDate,
  title,
  subtitle,
  body
}`;

export async function getAllColumnsForArchiveSearch() {
  try {
    return (
      (await sanityFetch({ query: ALL_COLUMNS_FOR_ARCHIVE_SEARCH_QUERY })) ?? []
    );
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
  _type,
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
  metaDescription,
  themeFingerprint,
  "reading": { "en": pt::text(body.en), "es": pt::text(body.es) }
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

// --- Practical (FIX series) ---

const PRACTICAL_PROJECTION = `{
  _id,
  _type,
  _updatedAt,
  practicalNumber,
  "slug": slug.current,
  publishDate,
  status,
  byline,
  coverImage,
  coverImageAlt,
  title,
  subtitle,
  body,
  metaDescription,
  "reading": { "en": pt::text(body.en), "es": pt::text(body.es) }
}`;

export const PRACTICAL_BY_SLUG_QUERY = `*[_type == "practical" && status == "published" && slug.current == $slug][0] ${PRACTICAL_PROJECTION}`;

export const ALL_PRACTICAL_SLUGS_QUERY = `*[_type == "practical" && status == "published"]{ "slug": slug.current }`;

export const PRACTICAL_INDEX_QUERY = `*[_type == "practical" && status == "published"] | order(publishDate desc) {
  _id, _type,
  "slug": slug.current,
  practicalNumber,
  publishDate,
  byline,
  title
}`;

export const ALL_PRACTICAL_SUMMARY_QUERY = `*[_type == "practical" && status == "published"] | order(publishDate desc) { "slug": slug.current, publishDate, _updatedAt }`;

export async function getPracticalBySlug(slug) {
  try {
    return await sanityFetch({
      query: PRACTICAL_BY_SLUG_QUERY,
      params: { slug },
    });
  } catch {
    return null;
  }
}

export async function getAllPracticalSlugs() {
  try {
    return (await sanityFetch({ query: ALL_PRACTICAL_SLUGS_QUERY })) ?? [];
  } catch {
    return [];
  }
}

export async function getPracticalIndex() {
  try {
    return (await sanityFetch({ query: PRACTICAL_INDEX_QUERY })) ?? [];
  } catch {
    return [];
  }
}

export async function getAllPracticalSummary() {
  try {
    return (await sanityFetch({ query: ALL_PRACTICAL_SUMMARY_QUERY })) ?? [];
  } catch {
    return [];
  }
}

// --- Off the Rails index (every published issue, newest first) ---

export const ISSUES_INDEX_QUERY = `*[_type == "issue" && status == "published"] | order(publishDate desc) {
  _id, _type,
  "slug": slug.current,
  issueNumber,
  publishDate,
  byline,
  title
}`;

export async function getIssuesIndex() {
  try {
    return (await sanityFetch({ query: ISSUES_INDEX_QUERY })) ?? [];
  } catch {
    return [];
  }
}

// --- Unified Home Feed ---

// One round trip: the newest HOME_FEED_SLICE files of any series, plus the newest
// file of each series, so a quiet series still gets its rail slot. `reading` and
// `storyReading` carry plain text only (pt::text) for the reading-time estimate.
const HOME_FEED_SLICE = 16;
const HOME_FEED_TYPES = ["issue", "column", "practical"];

const HOME_FEED_PROJECTION = `{
  _id, _type,
  "slug": slug.current,
  publishDate,
  byline,
  coverImage, coverImageAlt,
  title, subtitle, metaDescription,
  "number": coalesce(issueNumber, columnNumber, practicalNumber),
  issueNumber, columnNumber, practicalNumber,
  "reading": {
    "en": select(_type == "issue" => pt::text(nicosTransmission.en), pt::text(body.en)),
    "es": select(_type == "issue" => pt::text(nicosTransmission.es), pt::text(body.es))
  },
  "storyReading": stories[]->{ "en": pt::text(body.en), "es": pt::text(body.es) }
}`;

export const HOME_FEED_QUERY = `{
  "recent": *[_type in ${JSON.stringify(HOME_FEED_TYPES)} && status == "published"] | order(publishDate desc)[0...${HOME_FEED_SLICE}] ${HOME_FEED_PROJECTION},
  "latest": [${HOME_FEED_TYPES.map(
    (type) =>
      `*[_type == "${type}" && status == "published"] | order(publishDate desc)[0] ${HOME_FEED_PROJECTION}`
  ).join(",\n    ")}]
}`;

// Merges both result sets into one list, newest first, de-duplicated by _id.
export async function getHomeFeed() {
  try {
    const result = await sanityFetch({ query: HOME_FEED_QUERY });
    const byId = new Map();
    for (const doc of [...(result?.recent ?? []), ...(result?.latest ?? [])]) {
      if (doc?._id) byId.set(doc._id, doc);
    }
    return [...byId.values()].sort((a, b) => time(b) - time(a));
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
