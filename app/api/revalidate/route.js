// ABOUTME: Webhook endpoint for Sanity on-demand revalidation.
// ABOUTME: Validates HMAC signature via next-sanity, then revalidates the site cache.

import { revalidatePath } from "next/cache";
import { parseBody } from "next-sanity/webhook";

export async function POST(request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return Response.json(
      { success: false, error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const { isValidSignature, body } = await parseBody(request, secret);

    if (!isValidSignature) {
      return Response.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    if (!body?._type) {
      return Response.json(
        { success: false, error: "Missing document type" },
        { status: 400 }
      );
    }

    revalidatePath("/", "layout");

    return Response.json({
      success: true,
      revalidated: true,
      type: body._type,
    });
  } catch {
    return Response.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
