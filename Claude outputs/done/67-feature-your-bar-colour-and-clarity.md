# /feature-your-bar: the maroon goes, the plans get clearer

42 visitors reached this page in the last seven days, against 134 on the claim page. Two bars have ever paid. Roman: the options are "not visible, understandable enough", and the maroon is hard to read.

## 1. The maroon is the page's accent, not a leftover

`#7B1E1E` (rgb 123,30,30) is on `.feature-accent` (the "BarMagazine." in the hero headline), `.feature-btn-primary`, four `.feature-eyebrow` labels, three `.feature-step-num`, the `.feature-tier-featured` border and the `.feature-badge`. On the near-black hero the wordmark and the primary button both sit at poor contrast.

Roman's call, and it is right: the brand already has a gold. `#B08D3F` is the gold on the outreach email's CTA and `#C9A96A` is the brass in `BarPlaceholder`. Use those rather than inventing a third colour.

Replace throughout:

- Hero headline accent and the eyebrow labels: gold, checked for contrast on the near-black panel. If `#B08D3F` is too dim on black, go lighter towards `#C9A96A`, not darker.
- Primary buttons: the same dark grey the header uses, with the gold reserved for accents, or gold with dark text if it tests better. Pick one and use it for every primary button on the page.
- The Featured card border and the MOST POPULAR badge: gold. That is what should draw the eye to the middle plan.

Check contrast on every change. The reason the maroon failed is readability, so do not swap one unreadable colour for another.

## 2. The em dashes

At least three on this page, including the hero subheading "coverage across our channels — plus a profile page". Site-wide rule. Remove all of them here, periods, commas or colons.

## 3. Make the middle plan win

The three cards read at similar weight today. Featured is the plan we want chosen, so it should be visibly the answer: gold border, gold badge, more elevation, and a primary button that is clearly stronger than the other two. Featured + Social currently has a white outline button that looks weaker than the free tier's, which is backwards for the most expensive plan.

## 4. The billing, which is the real problem

The card shows **$19.50 /mo** in large type and **Billed annually $468 → $234/year** underneath. The actual commitment is $234 up front for a year. A bar reads the big number, gets interested, and finds a year's commitment at the point of paying. That gap is the most likely reason this page does not convert, and no colour fixes it.

Do not change pricing or billing terms. That is Roman's decision. What to do here is make the real number honest at a glance: show the annual figure with the same weight as the monthly one, so nobody feels the terms appeared late.

Then report what it would take to offer a monthly option at a higher rate, purely as information: what changes in Stripe, in the tier logic, in `featured_until`, and in the entitlement checks. Roman decides whether to offer it.

## 5. Proof

There is no word from a paying owner anywhere on the page. Two bars pay: `the-loft` in Santiago and `dangerous-water-palma-de-mallorca`. Leave a clearly marked placeholder for one short quote from each, in the layout, empty until Roman has the quotes. Do not write a testimonial. Do not invent one.

## 6. A real bug, check this first

On a cold load from a clean browser this page returned two 502s and rendered "Application error: a client-side exception has occurred", a blank page with one line of text. It worked on retry, so it is intermittent. Find what 502'd and whether real visitors are hitting it. An intermittent blank pricing page is worth more than every other item in this task.

## Guards

Standing layout rule: colour, weight, elevation, copy and the placeholder block only. Section order does not change, the page does not get shorter, and nothing moves on the claim page or anywhere else the maroon token is shared. If `#7B1E1E` is used outside this page, say where and change nothing there without asking.

## Report

The page at 390px and 1440px before and after, the pricing block close up in both, a contrast figure for every colour pair you changed, and what the 502 was.
