// ABOUTME: Sanity client configuration for data fetching.
// ABOUTME: Exports a configured client and image URL builder helper.

import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2024-03-01";

const isConfigured = projectId && /^[a-z0-9-]+$/.test(projectId);

export const client = isConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;

export async function sanityFetch({ query, params = {}, revalidate = 3600 }) {
  if (!client) return null;
  return client.fetch(query, params, { next: { revalidate } });
}

const builder = isConfigured ? imageUrlBuilder(client) : null;

export function urlFor(source) {
  if (!builder) {
    const stub = {
      url: () => "",
      width: () => stub,
      height: () => stub,
      format: () => stub,
      fit: () => stub,
      quality: () => stub,
      auto: () => stub,
    };
    return stub;
  }
  return builder.image(source);
}
