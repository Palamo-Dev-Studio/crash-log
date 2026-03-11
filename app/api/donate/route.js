// ABOUTME: POST handler that creates Stripe Checkout Sessions for donations.
// ABOUTME: Supports one-time payments and monthly subscriptions via frequency param.

import Stripe from "stripe";

const VALID_FREQUENCIES = ["once", "monthly"];

export async function POST(request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return Response.json(
      { success: false, error: "Donation service is not configured" },
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

  const { amount, locale, returnPath, frequency } = body;

  if (typeof amount !== "number" || !Number.isInteger(amount)) {
    return Response.json(
      { success: false, error: "Amount must be a whole number in cents" },
      { status: 400 }
    );
  }

  if (amount < 300) {
    return Response.json(
      { success: false, error: "Minimum donation is $3" },
      { status: 400 }
    );
  }

  if (amount > 99900) {
    return Response.json(
      { success: false, error: "Maximum donation is $999" },
      { status: 400 }
    );
  }

  // Default to one-time if not specified (backward-compatible)
  const freq = frequency || "once";

  if (!VALID_FREQUENCIES.includes(freq)) {
    return Response.json(
      { success: false, error: "Invalid frequency. Use 'once' or 'monthly'" },
      { status: 400 }
    );
  }

  // Sanitize returnPath — must start with / and contain only safe URL characters
  const safePath =
    typeof returnPath === "string" && /^\/[a-zA-Z0-9\-_/]*$/.test(returnPath)
      ? returnPath
      : "/en";

  const baseUrl = new URL(request.url).origin;
  const isMonthly = freq === "monthly";

  const productName = isMonthly
    ? locale === "es"
      ? "Donación mensual a The Crash Log"
      : "Monthly donation to The Crash Log"
    : locale === "es"
      ? "Donación a The Crash Log"
      : "Donation to The Crash Log";

  let session;
  try {
    const stripe = new Stripe(secretKey);

    const priceData = {
      currency: "usd",
      product_data: { name: productName },
      unit_amount: amount,
    };

    if (isMonthly) {
      priceData.recurring = { interval: "month" };
    }

    const sessionParams = {
      mode: isMonthly ? "subscription" : "payment",
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: `${baseUrl}${safePath}?donated=true`,
      cancel_url: `${baseUrl}${safePath}`,
    };

    // submit_type is only valid for one-time payments
    if (!isMonthly) {
      sessionParams.submit_type = "donate";
    }

    session = await stripe.checkout.sessions.create(sessionParams);
  } catch (err) {
    console.error("Stripe API error:", err.message);
    return Response.json(
      { success: false, error: "Payment service error" },
      { status: 502 }
    );
  }

  return Response.json({ success: true, url: session.url });
}
