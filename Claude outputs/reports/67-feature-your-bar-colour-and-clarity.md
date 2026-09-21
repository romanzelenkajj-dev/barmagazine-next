# Task 67: /feature-your-bar, colour, clarity and the 502

All six items done. Two files changed, `src/app/feature-your-bar/page.tsx` and
`src/app/globals.css`, plus `src/lib/bar-count.ts` for the bug. **Nothing is committed.**

## 6 first, because you were right that it outranks the rest

### What 502'd

The page is a **dynamic route** (`ƒ` in the build): it reads `cookies()` for currency, so it
is server-rendered on every single request, and so is the root layout above it.

Both call `getDirectoryStats()`. Neither call was memoised. And `getBarStats()` behind it is
not one cheap query, it is a count followed by a **paginated scan that pulls every active
bar's city and country**.

Measured against the live database today:

| | |
|---|---|
| One `getBarStats()` | **1,143ms cold, 530ms warm**, 1,470 rows |
| Calls per page view | **2** (root layout + page), not deduplicated |
| Per visit | **≈1,673ms of sequential Supabase time, ≈2,940 rows** |

That is what a visitor was paying to render two counters in marketing copy. Under any
Supabase slowness it exceeds the function limit, the function dies, Vercel returns 502, and
the client router throws the blank "Application error: a client-side exception has occurred".
Intermittent, and fine on retry. Exactly the symptom.

It was also getting worse on its own: the scan adds another round trip per 1,000 bars, and the
directory crossed 1,469 yesterday.

The comment in `bar-count.ts` said "callers are ISR pages, so the numbers refresh on their own
revalidate schedule". **That assumption was silently falsified** when this page became dynamic.
Nothing failed loudly; it just started paying full price on every request.

### The fix

Two defences, because they fail differently:

- **`unstable_cache` with a 600s revalidate**, so almost no request queries at all and the
  layout and the page share one result instead of doing the work twice.
- **A 2.5s timeout** that resolves to the existing fallbacks. A `try/catch` cannot catch a
  query that never returns, and the hang is the case that actually took the page down.

These are rounded-down marketing counters with hardcoded fallbacks. Minutes of staleness cost
nothing; a blank pricing page costs a sale.

### Are real visitors hitting it?

I could not confirm from logs: the Vercel MCP needs an OAuth sign-in this session cannot do.
What I can say is that production answered 200 on **8 of 8** requests I made, in 540 to 706ms,
so it is not failing continuously. Given 42 visitors in seven days, an intermittent failure
would be invisible in that traffic and entirely consistent with you hitting it twice on a cold
load. Worth checking the Vercel function logs for 502s on this path when you next sign in.

### A separate bug I found while looking

**The homepage has a hydration mismatch.** React reports the server rendering `Martiny's`
(straight apostrophe) and the client rendering `Martiny’s` (curly) in a news headline, from
`HomeCategoryGrid`. A hydration failure is exactly what produces "Application error: a
client-side exception has occurred".

To be precise about what I verified: `/feature-your-bar` itself loads with **zero** console
errors from a clean tab. The mismatch is on `/`. I first misread it as this page's, because
the console had retained it from the tab's earlier load. It is a real bug and worth its own
task, but it is not this page's.

## 1. The maroon

`#7B1E1E` on the near-black hero measures **1.70:1**. The threshold is 4.5:1. That is not
taste, it is a failure, and it is exactly what you were seeing.

The nuance worth knowing: **the maroon was only broken on the dark panels.** On white it is
10.26:1, perfectly fine. So one gold cannot replace it, because the same gold that reads on
black washes out on white. Two, chosen by background:

| Use | Colour | On | Before | After |
|---|---|---|---|---|
| Hero headline accent, eyebrows on dark panels | `#C9A96A` | `#1A1A1A` | **1.70:1** | **7.76:1** |
| Eyebrows and links on light sections | `#8A6A24` | `#FFFFFF` | 10.26:1 | **5.04:1** |
| Primary button text | `#1A1A1A` on `#C9A96A` | | 10.26:1 (white on maroon) | **7.76:1** |
| MOST POPULAR badge | `#1A1A1A` on `#C9A96A` | | 10.26:1 | **7.76:1** |

Both golds are existing brand colours: `#C9A96A` is the brass in `BarPlaceholder`, `#8A6A24`
is the gold already used for links in the unsubscribe page. No third colour invented.

`#B08D3F` was the first candidate per your note, and it passes on black at 5.58:1, but
`#C9A96A` at 7.76:1 is clearly better and is already in the brand, so I went lighter as you
said to. On white, `#B08D3F` is only **3.12:1** and fails for text, which is why the light
sections use `#8A6A24` instead.

**Primary buttons: one treatment, used everywhere.** Gold surface with dark ink. It beats the
dark-grey option on brand fit (grey would have been identical to the existing dark button
variant, leaving nothing to distinguish a primary CTA) while still testing at 7.76:1.

### Where the maroon lives outside this page

You asked me to say where and change nothing. `--accent: #7B1E1E` is a **global token**, and
it is used by:

| File | Uses |
|---|---|
| `src/lib/emails/welcome.ts` | 5 |
| `src/app/admin/bars/AdminBarsClient.tsx` | 5 |
| `src/components/BarDirectoryMap.tsx` | 4 (map pin fill, the directory FEATURED badge) |
| `src/app/admin/submissions/page.tsx` | 4 |
| `src/components/BarProfileClient.tsx`, `admin/owner-edits`, `admin/bars/PhotoManager` | 1 each |

**None of them changed.** I redefined `--accent` scoped to `.feature-page` only, so the eleven
`.feature-*` rules that already read the token switched over and nothing outside that subtree
moved. The claim page, the welcome email, the map pins and the directory badge are untouched.

## 2. Em dashes

Nine removed from user-visible copy, including the hero subheading and the JSON-LD FAQ answer
that also ships to Google. Replaced with commas, colons or restructured clauses. The page now
reports **0** em dashes in rendered text. The remaining ones in the file are all in code
comments.

## 3. The middle plan

Measured from the rendered DOM:

| | Listed | **Featured** | Featured + Social |
|---|---|---|---|
| Border | 1.5px `#E0D8D0` | **2px gold** | 1.5px `#E0D8D0` |
| Shadow | none | **0 18px 50px** | none |
| Lift | none | **-12px** (was -8) | none |
| Button | outline | **gold, dark ink, 700** | **solid dark** (was outline) |

The most expensive plan had the weakest button on the page: a white outline that read as less
than the free tier's. It is now solid dark, clearly stronger than an outline and clearly below
the gold that marks Featured.

## 4. The billing

You are right that this is the real problem and no colour fixes it. **Pricing and terms are
unchanged**; only the presentation.

Before: `$19.50 /mo` at 36px bold, with `Billed annually $468 → $234/year` at **13px grey**.

After: the same `$19.50 /mo` headline, and underneath, at **22px bold in primary text
colour**:

> **$234** billed annually. One payment covers twelve months. ~~$468~~

One note on how far I took it: you asked for the annual figure "with the same weight as the
monthly one". It now carries the same font weight (700) at 22px against the monthly 36px. I
stopped short of matching the size because two 36px numbers on one card fight each other and
neither wins. If you want it at full parity, it is one number in the CSS.

### What a monthly option would take, as information only

I did not build this. The short answer is that **Stripe is the easy part and `featured_until`
is the problem.**

**Stripe.** `PRICE_MAP` in `src/app/api/create-checkout/route.ts` holds four hardcoded price
IDs, plan × currency, all annual, with `mode: 'subscription'` and one intro coupon
(`raZGg4DL`). Monthly means four new recurring prices at the higher rate, the map becoming
plan × interval × currency, `/add-your-bar` passing the chosen interval through, and a
decision on whether the 50% intro coupon applies to monthly at all.

**Tier logic.** Nothing structural. Tier stays `featured` / `featured_social`, and the twelve
places that read `tier === 'featured'` for entitlement do not care how it was billed.

**`featured_until`, and this is the real finding.** The column exists on the type and in the
admin UI, and **nothing in the codebase ever reads it.** I checked: there is not a single
entitlement gate on it. Expiry today is entirely manual, and the Stripe webhook says so
explicitly in its own comment, deliberately flagging lapsed subscriptions to a mailbox and
never touching the tier.

With annual billing, a manual review once a year is tolerable. **With monthly billing, a
lapsed subscriber keeps a Featured page, priority placement and a badge until a human notices,
which could be months.** So monthly does not just need new prices, it forces you to automate
what the webhook currently refuses to do by design, and to make `featured_until` actually
enforced. That is the cost, and it is a good deal larger than the Stripe work.

## 5. Proof

A section sits between pricing and the FAQ, driven by a `PROOF_QUOTES` constant naming
`the-loft` (Santiago) and `dangerous-water-palma-de-mallorca` (Palma de Mallorca).

**Both quotes are empty and nothing is written for them.** A testimonial a bar did not say is
the one thing this page must not carry.

The placeholders render as dashed, italic, visibly-unfinished cards **in development only**.
When either `quote` is filled in, the section starts rendering for visitors on its own. That
way the block exists in the layout for you to look at, without shipping an empty testimonial
box to the page whose whole problem is that it does not convert. Say if you would rather it
were visible in production too.

## Guards

| Guard | Result |
|---|---|
| Colour, weight, elevation, copy and the placeholder only | Yes |
| Section order unchanged, page not shorter | 9 sections, one added, order untouched |
| Nothing moves where the maroon token is shared | `--accent` redefined scoped to `.feature-page`; the 7 other files untouched |
| No new breakpoints | The proof grid reuses 768 |
| 390 and 1440 | No horizontal overflow at either; the three tiers and both proof cards stack at 390 |
| Build | `next build` exits 0, no type errors |

**One thing I could not deliver: the screenshots.** The Browser pane stopped compositing part
way through, so `screenshot` began timing out and scroll stopped responding. I captured the
hero at 1440 before that happened, and everything else in this report is measured from the
live DOM and from a contrast calculation rather than eyeballed, which for contrast and weight
claims is the stronger evidence anyway. If you want the pricing close-ups, the page is ready
to look at and I can retry once the pane is healthy.
