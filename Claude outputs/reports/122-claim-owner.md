# Task 122: owner sign-in on claimed profiles, claim form for existing owners

Status: preview ready, not merged. Draft PR #86 on branch `preview/122-claim-owner`.
PR: https://github.com/romanzelenkajj-dev/barmagazine-next/pull/86
Preview URL (Vercel build success): https://barmagazine-next-git-previ-4b2d76-romanzelenkajj-7135s-projects.vercel.app
Pages to look at there: /bars/citrus-cane (claimed profile), /claim-your-bar?bar=citrus-cane, /owner-dashboard/login, and the footer on any page.

## What changed, point by point

1. Claimed-bar profiles, both routes (`/bars/[slug]` and `/bars-preview/[slug]`).
   The "Is this your bar? Claim it" button is replaced, same position and same style, by an "Owner sign in" button linking to /owner-dashboard. The "managed by its owner" sentence and the office@ line are gone from the profile. The unused owner-note CSS was removed.

2. /claim-your-bar.
   A line inside the form card, above the fields: "Already claimed your bar? Sign in", linking to /owner-dashboard. It sits in the card, not on the page background.

3. Footer.
   The Explore list now ends with "Claim your bar" and "Owner sign-in" (linking to /owner-dashboard).

4. Return address.
   The claim confirmation page (the success card on /owner-dashboard after the confirmation link) and the claim confirmation email both state: "To edit your listing later, sign in at https://barmagazine.com/owner-dashboard with this email address."

5. Claim form, existing owner.
   The start route now looks at who owns the bar before choosing a route:
   - Signed-in owner claiming their own bar: no transfer request, no admin email. Screen: "You already manage this listing" with a "Sign in to manage" button to /owner-dashboard.
   - Owner's own address typed without a session: no transfer request, no admin email, the generic screen (the form never confirms which address owns a bar, Roman 2026-09-23), and a dashboard sign-in link mailed to that address.
   - Any other address: the transfer route as before (request created, admin email, generic screen).
   The decision lives in `ownerClaimOutcome` in `src/lib/claim-routes.ts` with tests (513 tests pass).

6. /owner-dashboard signed-out state (`/owner-dashboard/login`).
   The email box is the first thing in the card, then one line: "We email you a sign-in link. There is no password." Then the button. The page title sits under the form as a small line; the card ends with "Not claimed your bar yet? Claim it, it's free" linking to /claim-your-bar (it used to point at /feature-your-bar).

Ownership-change contact: a new "Ownership changes" card at the bottom of the signed-in dashboard: "New manager, new owner, or a colleague who left with the sign-in address? Write to office@barmagazine.com and we move the listing to the right account."

## Checks

- tsc clean, next lint with pre-existing warnings only, vitest 513 passed.
- Local dev, desktop: claimed profile (Citrus & Cane) shows the "Owner sign in" button in the claim button's slot, no owner note, no office@ in the actions column; footer shows both links; claim page shows the sign-in line inside the form card; the "You already manage this listing" card renders with the button (API response stubbed in the browser, no email sent); sign-in page has the form as the first child of the card and no bare text on the background.
- Local dev, 375 px: button 313 x 48, no horizontal overflow on the profile or the sign-in page.
- No claim was submitted against the live API during testing, so no email went out.

## Observed, not touched

- The home page logs hydration errors in dev: `HomeCategoryGrid` renders a card description with curly apostrophes on the client and straight ones on the server ("Martiny's" vs "Martiny’s"). That is on main and unrelated to this branch. Worth a separate fix.
