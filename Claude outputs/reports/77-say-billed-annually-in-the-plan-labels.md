# Task 77: the plan labels say how the price is billed

On `preview/66-house-style-review`, commit `8c5e034`. **Not merged.**

Same URL you already have:
https://barmagazine-next-git-previ-3b9738-romanzelenkajj-7135s-projects.vercel.app/add-your-bar

## The dropdown

**Before, task 71**

```
Listed (Free)
Featured, $39/mo (first year $19.50, 50% off)
Featured + Social, $79/mo (first year $39.50, 50% off)
```

**After**

```
Listed (Free)
Featured, $39/mo billed annually (first year $19.50, 50% off)
Featured + Social, $79/mo billed annually (first year $39.50, 50% off)
```

EUR renders the same shape. Em dashes: 0. The order from task 71 is unchanged: full price
first, billing period, then the promotion.

## Where the string lives, and what next week costs

`src/lib/plan-pricing.ts`. The period is a **field on the plan**, not text inside the label:

```ts
featured: { full: {...}, promo: {...}, promoNote: '50% off', period: 'billed annually' },
```

You said pricing is being settled at roughly $39 a month billed **monthly**, with 50% off for
paying annually. At that point "billed annually" stops being true of every plan and the labels
have to offer two billing choices rather than state one.

**What this absorbs:** changing the figures, changing the wording of the period, or dropping
it entirely are all edits to that table. No JSX changes, no call sites.

**What it does not absorb, honestly:** two billing options is a shape change, not a value
change. `period` becomes something like `annual` and `monthly` sub-objects with their own
prices, and `planLabel` takes which one the visitor picked. That is maybe twenty minutes in
this file plus whatever UI lets them choose, which does not exist yet. The field buys you the
value change for free and takes the sting out of the shape change; it does not make it free.

## Every place a price appears, and whether it states its billing period

| Where | Shows | States the period? |
|---|---|---|
| `add-your-bar` dropdown | `Featured, $39/mo billed annually (first year $19.50, 50% off)` | **yes** (this task) |
| `add-your-bar` tier cards, price | `~~$39~~ $19.50/mo` | no, but the line below it does |
| `add-your-bar` tier cards, annual line | `Billed annually $234/year (50% off first year)` | **yes** |
| `add-your-bar` sticky summary, price | `~~$39~~ $19.50/mo` | no, but the line below it does |
| `add-your-bar` sticky summary, sub-line | `50% off first year. Billed annually $234/year. Renews at standard rate.` | **yes**, and the only place that mentions renewal |
| `feature-your-bar` pricing cards | `~~$39~~ $19.50 /mo` | no, but the line below it does |
| `feature-your-bar` annual line | `$234 billed annually. One payment covers twelve months.` | **yes** |
| `feature-your-bar` plan descriptions | `Billed annually. Includes a feature article...` | **yes** |
| `feature-your-bar` FAQ answer | `Featured starts at €19.50/month (billed annually, €234/year)` | **yes** |
| `feature-your-bar` hero strip | `Featured from $19.50/mo · Cancel anytime` | **no** |
| `feature-your-bar` page metadata and JSON-LD | `get Featured from €19.50/mo` | **no** |
| `BarDirectorySidebar` promo | `starting at just $19.50/month` | **no** |
| `admin/submissions` plan chip | `Featured ($39/mo)` | no, admin-only |
| `api/bar-submission` notification email | `Featured ($39/mo)` | no, admin-only |

**The dropdown and the cards now agree**, in the same order: full price, billing period,
discount.

**Three visitor-facing places still say a monthly figure with no period**, and all three use
the promotional number rather than the full one, so they carry both problems at once:

1. `feature-your-bar` hero strip, "Featured from $19.50/mo"
2. `feature-your-bar` metadata and the JSON-LD Offer, which is what Google reads
3. the directory sidebar promo, "starting at just $19.50/month"

I have not touched them: this task was scoped to the dropdown, and the second one is
structured data where a wrong edit is worse than a late one. They are the natural companion to
the pricing change next week, and the JSON-LD is the one I would not leave until after.

**The outreach email quotes no price at all.** I checked `send-upsell.mjs` for any figure or
billing word and found none, so there is nothing to fix there and nothing to update next week.

## One thing I did beyond the task, and why

I rebased `preview/69-structured-hours` onto 66 after pushing this, so it still contains 66,
71 and 77. I told you the 69 preview was the one to open if you wanted to judge all of them at
once, and that would have quietly stopped being true. Build is clean on both.

## Guards

Label text only. The dropdown, the form and the sidebar are structurally unchanged, and the
`<option>` values are still `featured` and `featured_social`, so the form posts exactly what it
did. `next build` exits 0 on both branches.
