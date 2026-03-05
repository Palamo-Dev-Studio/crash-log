// ABOUTME: POST handler that proxies email subscriptions to the Beehiiv API.
// ABOUTME: Validates input, forwards to Beehiiv, and normalizes responses for the client.

export async function POST(request) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    return Response.json(
      { success: false, error: "Subscribe service is not configured" },
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

  const { email } = body;

  if (!email || typeof email !== "string") {
    return Response.json(
      { success: false, error: "Email is required" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json(
      { success: false, error: "Invalid email format" },
      { status: 400 }
    );
  }

  let response;
  try {
    response = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          utm_source: "crashlog.ai",
          utm_medium: "website",
        }),
      }
    );
  } catch (err) {
    console.error("Beehiiv network error:", err.message);
    return Response.json(
      { success: false, error: "Subscribe service is temporarily unavailable" },
      { status: 503 }
    );
  }

  if (response.status === 409) {
    return Response.json({ success: true, alreadySubscribed: true });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`Beehiiv API error: ${response.status} ${text}`);
    return Response.json(
      { success: false, error: "Failed to subscribe" },
      { status: 502 }
    );
  }

  return Response.json({ success: true });
}
