# PRIORITY: the checkout fallback silently doubles the price. Take this before anything else

## What is NOT wrong

Stripe is set up correctly and always was. `/api/create-checkout` builds a Checkout Session with `discounts: [{ coupon: 'raZGg4DL' }]` and applies it. Verified twice today: the live endpoint returns a session reading **$234.00, then $468.00 per year after coupon expires**, and Dangerous Water's subscription in Stripe shows €234.00 paid on 8 August with "50% off for 12 months" attached.

Roman saw $468 because he was testing a **preview** deployment. Preview builds sit behind Vercel SSO, so the POST to `/api/create-checkout` returns `401 Protected deployment`, the catch block runs, and the code falls through to the raw payment links.

Confirmed: production POST returns 200 with a session URL, the preview returns 401.

## What IS wrong

### 1. The fallback charges full price, silently

`src/app/add-your-bar/page.tsx`, around line 249:

```
// Fallback to payment links if checkout session fails
if (STRIPE_LINKS[plan]) {
  const stripeUrl = STRIPE_LINKS[plan][currency] || STRIPE_LINKS[plan]['USD'];
  window.location.href = stripeUrl;
```

The `STRIPE_LINKS` payment links carry no coupon: $468, $948, €468, €948. So any failure of the checkout API, a Stripe timeout, a bad deploy, a network blip, quietly sends a real customer to a page asking double what every surface of the site promised. Nothing tells them, and nothing tells us.

A fallback that doubles the price is worse than no fallback. Remove it. On failure, show the customer an error, keep them on the page, and give them the office@barmagazine.com line the form already uses elsewhere. Log the failure so it is visible rather than silent.

### 2. The sidebar tier buttons bypass the API entirely, on production, today

Lines 365 and 391 of the same file link straight to `STRIPE_LINKS`:

```
<a href={STRIPE_LINKS.featured[currency] || STRIPE_LINKS.featured.USD} className="add-bar-tier-btn">Get Featured</a>
<a href={STRIPE_LINKS.featured_social[currency] || ...} className="add-bar-tier-btn add-bar-tier-btn--premium">Get Started</a>
```

These never touch `/api/create-checkout`, so they always charge full price. That is live right now. A bar that clicks Get Featured in the sidebar instead of submitting the form is quoted $468 against the $234 on the same screen.

Route both through the same flow the form uses so there is exactly one path to checkout.

### 3. While you are there: the EUR links shown to a US browser

The EUR payment link renders as **$558.81** to a US visitor, because Stripe converts €468 at 1.1940 plus a 4% conversion fee. Only reachable through the fallback and the sidebar buttons, so fixing 1 and 2 removes the exposure. Note in the report whether any path can still show a converted price.

## Guards

Standing layout rule: the error state is new, the two sidebar buttons change what they do, nothing else moves at 390px or 1440px. Do not touch `/api/create-checkout`, the coupon, the price IDs or anything in Stripe. Roman is settling new pricing next week and this task must not collide with it.

**This one ships straight to main, and Roman has agreed.** It is a defect on a money path that is live right now, not a design change, so it is an exception to the standing preview rule. His words: "we gotta fix it, 100% fix it as soon as possible."

Commit it alone, push it, confirm from production that the sidebar buttons now reach a discounted session, and put the screenshots in the report afterwards rather than before. If anything about the fix turns out to change how the page looks beyond the error state and the two buttons, stop and put that part on a preview branch instead.

To test the success path on a preview, remember the API is SSO-blocked there: verify against production with a POST rather than concluding from the preview, the way this was diagnosed.

## Report

The diff, the error state at 390px and 1440px, and confirmation that every route to checkout now passes through `/api/create-checkout`. Then say plainly whether any remaining path can send a customer to a full-price link.
