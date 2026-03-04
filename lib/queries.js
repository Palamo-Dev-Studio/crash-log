// ABOUTME: GROQ queries and fetch wrappers for Sanity issue data.
// ABOUTME: Provides getLatestIssue, getIssueBySlug, getAllIssueSlugs, getAllIssuesSummary.

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
