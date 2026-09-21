# The plan dropdown anchors on the discount instead of the price

On the `preview/66-house-style-review` branch, `/add-your-bar`, the Preferred Plan dropdown reads:

```
Listed (Free)
Featured ($19.50/mo — 50% off first year)
Featured + Social ($39.50/mo — 50% off first year)
```

Two problems, both small, both worth fixing before this branch merges.

## 1. Em dashes

Three of them, one per label. Site-wide rule, and this is about to go live. En dashes are fine, em dashes are not.

## 2. The anchor is backwards

Roman: "Maybe it should be 39 a month and then in () the 19,50, 50% off first year?"

He is right. Leading with $19.50 makes that the reference price, so the standard rate later reads as a price rise. Leading with the full price and showing the discount second makes the same money read as a saving. Same numbers, opposite feeling.

Rewrite so the full price leads and the promotional price sits in the parenthetical:

```
Listed (Free)
Featured, $39/mo (first year $19.50, 50% off)
Featured + Social, $79/mo (first year $39.50, 50% off)
```

Use whatever punctuation reads best, but keep that order: full price first, discount second, no em dash.

## 3. Check everywhere else this pattern appears

The same anchoring mistake may be on `/feature-your-bar`, in the pricing cards, and in the outreach email. The pricing cards already show `$39` struck through above `$19.50`, which is the right order, so they are probably fine. Report every place a price appears and which order it uses, so this is consistent in one pass rather than found again later.

## Note on the numbers, do not act on it

Roman is settling pricing next week with Fable: the direction is around $39 a month billed monthly, with 50% off for paying annually, and he has said $19.50 is too low. So the numbers above will change. Build the label format so swapping the figures is a one-line change, and do not hard-code prices in more places than necessary. Report where a price string lives today.

## Guards

Standing layout rule: label text only. The dropdown, the form and the sidebar stay exactly as they are at 390px and 1440px.

**Do not merge.** This goes on the existing `preview/66-house-style-review` branch so Roman sees it on the same preview URL he already has. See the standing rule in SETUP.md.

## Report

The dropdown before and after, and the list of every place a price string appears with the order it uses.
