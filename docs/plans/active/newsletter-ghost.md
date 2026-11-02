# Newsletter on Ghost(Pro) — plan

**Status:** proposed 2026-11-01, waiting on Hector's plan choice. Nothing built or bought.

## Goal

Send The Crash Log by email from our own domain, `newsletter.crashlog.ai`. crashlog.ai stays the site; Ghost
handles only subscribers and sending. Substack has no subscribers, so nothing migrates. `newsletter.palamo.ai`
is not needed (Hector, 2026-10-30).

## Facts (checked 2026-11-01)

- Ghost(Pro), billed yearly: Starter $18/mo, Publisher $29/mo (both 1,000 members), Business $199/mo. Custom domain
  on every plan; a **custom sending domain needs Publisher or higher**, plus a custom publication domain first and a
  DMARC record. Warm-up takes about 6 weeks (some recipients get mail from ghost.io meanwhile). Sources:
  ghost.org/pricing, ghost.org/help/custom-sending-domains.
- Signups through Ghost's own form get a confirmation email; unconfirmed signups are never added
  (ghost.org/help/unconfirmed-member-emails). The Admin API's "create member" documents no confirmation email, so
  the site must not add members through it.
- crashlog.ai DNS is on Vercel and locked as a non-sending domain: null MX, SPF `-all`, DMARC `p=reject; adkim=s;
aspf=s`. Subdomains inherit `p=reject`, so a signing mistake on the newsletter subdomain gets mail rejected, not
  junked. `newsletter.crashlog.ai` currently resolves to Vercel.

## Steps

1. **Plan and account (Hector; it costs money).** Rec: Publisher, because owning the sending domain is the point of
   leaving Substack and the warm-up is easiest while the list is small. Case for Starter: $132/yr cheaper, no DNS
   work, ghost.io has a good sending reputation; upgrade later.
2. **DNS on Vercel (Ice prepares, Hector approves):** CNAME `newsletter.crashlog.ai` to Ghost (replaces the Vercel
   record); Ghost's DKIM/SPF records from Ghost Admin → Domain → Custom sending domain → Setup; a subdomain
   `_dmarc.newsletter.crashlog.ai` at `p=none` during warm-up, tightened later. The root's lock stays as is.
3. **Ghost setup:** two newsletters ("The Crash Log", "The Crash Log en español"); From name "The Crash Log" at an
   address such as `hello@newsletter.crashlog.ai`; a postal address in the footer (CAN-SPAM); issues sent as
   email-only posts; Ghost's homepage redirects to crashlog.ai (confirm Ghost(Pro) allows the redirect).
4. **Site (Ice, normal gates):** Subscribe points to Ghost's signup page (`newsletter.crashlog.ai/#/portal/signup`);
   rename `lib/substack.js`; update tests. Not an Admin API form.
5. **Sending:** Hector pastes each issue into Ghost at first. Later, Steam's pipeline creates the email-only draft
   through the Admin API and Hector presses Send (needs a Portable Text to HTML step).
6. **Substack:** links come down with step 4; park or close the publication.

## Done when

A test address subscribes from crashlog.ai, gets Ghost's confirmation email and clicks it; a test issue arrives from
`@newsletter.crashlog.ai` with DKIM and DMARC passing in the headers; the unsubscribe link works.
