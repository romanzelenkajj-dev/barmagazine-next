# Ship the 502 fix now. Everything visual goes to a preview URL

Two separate things, because they are in different categories.

## 1. Ship the `bar-count.ts` fix on its own, today

The caching fix from task 67 item 6 is sitting uncommitted, so the pricing page is still returning 502s and blank "client-side exception" pages to real visitors while the fix exists on disk.

That is the approval rule being applied too bluntly. Roman's rule is about seeing changes before they go live. A memoisation fix changes nothing a visitor sees except that the page stops breaking, so it sits with backfills and scripts, not with design.

Commit `src/lib/bar-count.ts` alone, with nothing else in the commit, and push it. Leave every visual change in `feature-your-bar/page.tsx`, `owner-dashboard/page.tsx`, `globals.css`, the admin screens and the submission form exactly where they are.

Then confirm from the live site that the page renders cold without a 502, and report the measured cost per visit after the change against the 1,673ms and 2,940 rows before it.

## 2. Preview URLs, from now on

Screenshots are not enough for work Roman judges by feel. He asked where he can see it, and the answer should be a link he can click and move around in.

New standard, and put it in `SETUP.md` next to the approval rule:

For any task that changes what a visitor sees, do not commit to `main`. Commit to a branch named for the task, `preview/<task-number>-<short-name>`, and push the branch. Vercel builds a preview deployment. Put the preview URL at the top of the report, along with the exact pages to look at.

Roman clicks it, moves around, and says go. Only then merge to `main`.

If several tasks are waiting at once, each gets its own branch, so he can approve them independently and reject one without holding up the others.

## 3. Do that now for the three that are waiting

Tasks 66, 67 and 68 are built in one working tree. Separate them into three branches so they can be approved one at a time:

- `preview/66-house-style-review` — `src/lib/house-style.ts`, `src/components/DescriptionReview.tsx`, the admin submissions screen, the submission form, the one grid rule in `globals.css`
- `preview/67-feature-page` — `src/app/feature-your-bar/page.tsx` and its `globals.css` rules, **without** `bar-count.ts`, which ships separately above
- `preview/68-upsell-panel` — `src/app/owner-dashboard/page.tsx` and its `globals.css` rules

The `globals.css` changes are interleaved in one file, so splitting them takes care. If a clean split is not possible, say so plainly and put 67 and 68 on one branch rather than guessing, since they share the gold treatment anyway.

## Report

The commit and the live confirmation for part 1. Then the three preview URLs, or two if you had to combine, each with the pages Roman should look at. Nothing merges to `main` until he says so.
