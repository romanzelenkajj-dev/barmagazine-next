# Roman has approved 66, 67 and 68. Merge them, in this order

His words: "all 66, 67, and 68 are fine and resolved." He looked at all three previews. 67 in particular: "love the gold!"

## Order matters, because one of them is not finished yet

**Merge now, both approved and complete:**

- `preview/67-feature-page` — the gold treatment, the em dashes, the middle plan, the annual figure, the testimonial placeholders
- `preview/68-upsell-panel` — the post-claim panel

**Hold `preview/66-house-style-review` until task 71 is on it.** Task 71 fixes the plan dropdown on `/add-your-bar`, which lives on that branch: three em dashes, and the labels anchoring on $19.50 instead of the full price. Merging 66 today would ship both of the things Roman asked to change. Do 71 first, push it to the 66 branch, tell him the preview is updated, and merge 66 once he confirms that one screen.

## Priority

Task 72 comes before all of this. It is a live money defect on the checkout path and it ships straight to main.

If 72 and these merges touch `add-your-bar/page.tsx` together, land 72 first and rebase rather than merging around it. The checkout fix must not be delayed by a design merge, and it must not be silently dropped by one either.

## After each merge

Confirm from production that the merged page renders as the preview did. The hero, the near-me control and the stats caching are already on main, so check that nothing in these three collides with them, particularly in `globals.css`, which all of them touch.

## Report

Which branches merged, the commit for each, production confirmation for each, and the state of 66 and 71.
