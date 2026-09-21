# Task 71: the plan dropdown leads on the full price

On `preview/66-house-style-review`, commit `e6ecb23`. **Not merged**, as instructed.

**Preview URL, unchanged from the one you already have:**
https://barmagazine-next-git-previ-3b9738-romanzelenkajj-7135s-projects.vercel.app/add-your-bar

The branch alias is stable across pushes, so that link now serves this change. Open
`/add-your-bar` and look at **Preferred Plan**.

## The dropdown

**Before**

```
Listed (Free)
Featured ($19.50/mo — 50% off first year)
Featured + Social ($39.50/mo — 50% off first year)
```

**After**

```
Listed (Free)
Featured, $39/mo (first year $19.50, 50% off)
Featured + Social, $79/mo (first year $39.50, 50% off)
```

EUR renders the same shape: `Featured, €39/mo (first year €19.50, 50% off)`.

Em dashes in the labels: **0**.

One small correction to the task: it says three em dashes, one per label. There were **two**.
`Listed (Free)` never had one.

## Where the figures live now

`src/lib/plan-pricing.ts`. Changing next week's prices is editing one table:

```ts
featured:        { full: {USD:'$39', EUR:'€39'}, promo: {USD:'$19.50', EUR:'€19.50'}, promoNote: '50% off' },
featured_social: { full: {USD:'$79', EUR:'€79'}, promo: {USD:'$39.50', EUR:'€39.50'}, promoNote: '50% off' },
```

The label format is one function, so if the shape of the offer changes as well as the numbers,
that is one more line rather than a hunt through JSX.

## Every place a price string appears, and its order

You asked for this so it is fixed in one pass rather than found again. **Nothing below was
changed**, because they already lead with the full price, which is the order you want.

| Where | What it shows | Order |
|---|---|---|
| `add-your-bar` dropdown | `Featured, $39/mo (first year $19.50, 50% off)` | **full first** (this task) |
| `add-your-bar` tier cards | `~~$39~~ $19.50/mo` | **full first**, struck through |
| `add-your-bar` tier annual | `Billed annually $234/year (50% off first year)` | promo only |
| `add-your-bar` sticky summary | `$19.50/mo` | promo only |
| `feature-your-bar` pricing cards | `~~$39~~ $19.50 /mo` | **full first**, struck through |
| `feature-your-bar` annual line | `$234 billed annually. One payment covers twelve months. ~~$468~~` | promo first, full struck |
| `feature-your-bar` hero strip | `Featured from $19.50/mo` | promo only |
| `feature-your-bar` FAQ answer | `Featured starts at €19.50/month (billed annually, €234/year)` | promo only |
| `feature-your-bar` page metadata | `get Featured from €19.50/mo` | promo only |
| `BarDirectorySidebar` promo | `starting at just $19.50/month` | promo only |
| `admin/submissions` plan chip | `Featured ($39/mo)` | **full only** |
| `api/bar-submission` notification email | `Featured ($39/mo)` | **full only** |

Two things worth your eye when pricing changes next week:

1. **Six of these carry the promotional figure alone**, with no full price beside it. That is
   the same anchoring problem as the dropdown, just without a visible comparison. The hero
   strip, the FAQ, the metadata and the sidebar promo all say "from $19.50" with nothing to
   read it against. If $19.50 rises, every one of those is a separate edit today.
2. **Only the dropdown reads from `plan-pricing.ts`.** The other eleven are literals in JSX,
   JSON-LD and an email template. Moving them all onto the table is maybe an hour, and it is
   worth doing before the prices change rather than after, because the JSON-LD and the
   metadata are the two most likely to be missed and the two Google reads.

I did not do that here: this task was scoped to label text, and rewriting eleven surfaces
would have been a much larger change than you asked to look at.

## Guards

Label text only. The dropdown, the form and the sidebar are unchanged structurally, and the
`<option>` elements carry the same values (`featured`, `featured_social`) so the form posts
exactly what it did. `next build` exits 0.

## Two things to know before 66 merges

**The branch was rebased onto main.** It was cut before the checkout fix, the two merges and
the stats caching landed. Task 73 was right that a design merge must not silently drop the
money fix, so rather than merging around it I rebased: `preview/66-house-style-review` now
sits on top of `f82dcbf` and **contains the checkout fix**. Verified on the branch:
`STRIPE_LINKS` count 0, new error copy present. The `globals.css` conflict was the same
append-vs-append as the other merges and resolved by keeping both blocks.

**One em dash is still on that page and I have not touched it**, because you scoped this task
to the labels and I have now flagged it three times. `src/app/add-your-bar/page.tsx:562`, the
photo hint:

> Your profile photo should show the room **—** an interior shot is what makes readers want
> to visit.

It is one character. Say the word and it goes on this branch before you merge.
