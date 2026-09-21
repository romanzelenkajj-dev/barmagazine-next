# Task 72: the checkout fallback that charged double

**Shipped to main and confirmed live.** `5d6bb3a`, `src/app/add-your-bar/page.tsx` alone.

## Verified before touching it

I re-checked the diagnosis rather than taking it on trust, because this is a money path:

| | |
|---|---|
| Production POST to `/api/create-checkout` | **200**, returns a `cs_live_...` session URL |
| The coupon | `discounts: [{ coupon: COUPON_ID }]`, route line 42, untouched |
| Preview POST | **401**, exactly the SSO diagnosis |

Stripe was never wrong, and I changed nothing in it: not the route, not the coupon, not the
price IDs.

## It was slightly worse than the task described

The task attributes the fallback to the catch block. The catch block was not the usual path.

A 401 from a protected deployment returns **parseable JSON with no `url`**. That never throws.
So the code fell past the `try/catch` entirely, hit the fallback, and redirected to a
full-price link **without logging anything at all**. The `console.error` in the catch never
ran for the most likely failure. That is why it was silent as well as wrong.

## What changed

### 1. The payment links are gone from the codebase

Not bypassed, deleted. `STRIPE_LINKS` no longer exists, so there is no full-price link left
for any path to reach. On failure the customer stays on the page and is told:

> We could not open the secure payment page just now. Nothing has been charged. Please try
> again in a moment, or email office@barmagazine.com and we will send you a payment link.

The failure logs with its status: `console.error('[checkout] no session', { status, body })`.
A non-2xx or a body without a url is now treated as a failure, rather than only a thrown
error.

### 2. Both sidebar buttons go through the API

`Get Featured` and `Get Started` call the same `goToCheckout` the form uses. One path to
checkout, so one price.

Worth knowing where these actually live, because it sharpens how bad the exposure was: they
are in the **post-submission** view, the "Want More Visibility?" block shown after a free
listing is submitted. So the sequence was: submit a free listing, get told it was received,
click Get Featured in the upsell, and be quoted **$468 beside the $234 printed on the same
screen.**

### 3. The currency exposure is closed

The EUR link rendered as $558.81 to a US browser. There is no link left to render.

**Can any remaining path send a customer to a full-price link? No.** Verified three ways:
`STRIPE_LINKS` is absent from the source, `buy.stripe.com` appears nowhere in the local
production build, and after deploy I scanned all **12** JavaScript chunks the live page loads
and found **zero** occurrences.

## A gap I found while testing, and fixed

The error state only existed inside the form. The tier buttons live in the post-submission
view, where the form is gone, so a failed checkout there set an error that **nothing
rendered**: a dead, silent button. That is the same class of fault as the original, so the
error now renders in that view too.

I caught this because the first failure test came back `errorShown: null` while everything
else passed.

## Verification

Failure path, forcing the 401 that used to trigger the double charge:

| Check | Result |
|---|---|
| API called | `{"plan":"featured","currency":"USD",...}` |
| Navigated away | **no**, still on `/add-your-bar` |
| Stripe links in the DOM | **0** |
| Error shown | the full message above |
| Button re-enabled | yes |
| Duplicate `id` in the DOM | no, the two error blocks are in mutually exclusive branches |

Layout, against the guard:

| | 390px | 1440px |
|---|---|---|
| Tier buttons | `BUTTON`, 137px and 128px wide, **40px** tall | same |
| Error block | 330px wide, 124px tall | full width of the column |
| Horizontal overflow | none | none |

The buttons changed element from `<a>` to `<button>` and kept the same class, the same 40px
height and the same widths, so nothing moved.

## Live confirmation

| | |
|---|---|
| New error copy in the deployed chunk | **present** in `app/add-your-bar/page-b7d8356e0468049f.js` |
| `buy.stripe.com` across all 12 live chunks | **none** |
| `/api/create-checkout` on production, after deploy | **200**, `cs_live_...` |

One note on method: my first liveness check was weak and I nearly reported it. It grepped the
page HTML for `buy.stripe.com`, but the links were only ever in the JS bundle, so that check
would have passed before the fix too. The chunk scan above is the one that actually proves it.

## Screenshots

The error state at 1440 sits between "Submission Received" and "Want More Visibility?", in the
existing `.add-bar-error` treatment. At 390 it is 330px wide with no overflow. Both captured
after the fix, as instructed.
