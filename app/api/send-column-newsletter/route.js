// ABOUTME: POST handler that creates Beehiiv draft posts from a published Sanity column.
// ABOUTME: Creates EN draft (always) and ES draft (when full translation exists).

import { client } from "@/lib/sanity";
import { COLUMN_BY_SLUG_QUERY } from "@/lib/queries";
import { hasFullTranslation, t } from "@/lib/locale";
import {
  buildColumnEmailSubject,
  buildColumnEmailHtml,
} from "@/lib/columnEmailTemplate";

export async function POST(request) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  const sendSecret = process.env.SEND_NEWSLETTER_SECRET;

  if (!apiKey || !publicationId || !sendSecret) {
    return Response.json(
      { success: false, error: "Newsletter service is not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${sendSecret}`) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!client) {
    return Response.json(
      { success: false, error: "Sanity client is not configured" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { slug } = body;

  if (!slug || typeof slug !== "string") {
    return Response.json(
      { success: false, error: "Slug is required" },
      { status: 400 }
    );
  }

  let column;
  try {
    column = await client.fetch(COLUMN_BY_SLUG_QUERY, { slug });
  } catch (err) {
    console.error("Sanity fetch error:", err.message);
    return Response.json(
      { success: false, error: "Failed to fetch column from Sanity" },
      { status: 502 }
    );
  }

  if (!column) {
    return Response.json(
      { success: false, error: "Column not found" },
      { status: 404 }
    );
  }

  const result = { success: true, en: null, es: null };

  try {
    const enPost = await createBeehiivDraft(
      column,
      "en",
      apiKey,
      publicationId
    );
    result.en = { id: enPost.id };
  } catch (err) {
    console.error("Beehiiv EN draft error:", err.message);
    return Response.json(
      { success: false, error: "Failed to create EN draft in Beehiiv" },
      { status: 502 }
    );
  }

  if (hasFullTranslation(column, "es", { bodyField: "body" })) {
    try {
      const esPost = await createBeehiivDraft(
        column,
        "es",
        apiKey,
        publicationId
      );
      result.es = { id: esPost.id };
    } catch (err) {
      console.error("Beehiiv ES draft error:", err.message);
      result.esError = "Failed to create ES draft";
    }
  }

  return Response.json(result);
}

async function createBeehiivDraft(column, locale, apiKey, publicationId) {
  const subject = buildColumnEmailSubject(column, locale);
  const html = buildColumnEmailHtml(column, locale);
  const previewText = t(column.subtitle, locale) || subject;

  const response = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/posts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: subject,
        subtitle: previewText,
        status: "draft",
        content_html: html,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Beehiiv API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.data || data;
}
