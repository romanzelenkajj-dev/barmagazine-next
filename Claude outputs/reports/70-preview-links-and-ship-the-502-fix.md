# Task 70: the 502 fix shipped, and three preview branches

Taken ahead of task 69, which is still queued, because this one is about a bug that was live
while the fix sat on disk.

## 1. The 502 fix is on main and live

Committed alone, nothing else in it, and pushed:

```
0f4082e  perf: cache the directory stats, which were 502ing the pricing page
         src/lib/bar-count.ts  (1 file)
```

Every visual change stayed in the working tree, then went to the branches below.

### Measured, live, before and after

Same method both times: twelve cache-busted requests to `/feature-your-bar` from this machine.

| | Before | After |
|---|---|---|
| Response time | 0.540 to 0.706s, mean **0.591s** | 0.208 to 0.336s, mean **0.257s** |
| Improvement | | **about 56% faster** |

The strongest evidence is the shape rather than the mean: **the very first request after the
deploy took 0.575s and every one after it fell to roughly 0.25s.** That first request is the
one that populated the cache, and it lands exactly on the old profile. That is a cache
signature, not noise.

### Cost per visit

| | Before | After |
|---|---|---|
| `getBarStats()` calls | **2** (root layout + page, not deduplicated) | **0** on a cache hit |
| Supabase time | **about 1,673ms** | **0ms** on a hit |
| Rows pulled | **2,940** | **0** on a hit |
| On a miss | every time | one call, 1,470 rows, at most once per 600s |

Worth being precise about why the hit rate will be high despite only 42 visitors a week on
this page: `getDirectoryStats()` is called by the **root layout**, so ordinary traffic to the
rest of the site keeps the cache warm. The pricing page is no longer paying to populate it.

And the part that matters most for the 502 itself: the 2.5s timeout means a Supabase **hang**
now degrades to the hardcoded fallbacks instead of riding past the function limit. A
`try/catch` never covered that case, and that is the case that actually took the page down.

## 2. The new standard is in SETUP.md

Added under the existing approval rule: visual work goes to a `preview/<task>-<name>` branch,
never straight to `main`, and the report leads with the preview URL and the pages to look at.
Each waiting task gets its own branch so you can approve them independently.

I also wrote down the exception, because it is the thing this task corrected: a fix that
changes nothing a visitor sees except that something stops being broken is not a visual
change, and waiting on approval for it leaves the bug live. That ships alone, straight to
main, and gets confirmed from the live site.

## 3. The three branches

A clean three-way split **was** possible, so you get three, not two.

The `globals.css` changes looked interleaved but are not: task 67's are eleven hunks of edits
to existing `.feature-*` rules in the middle of the file, and 66 and 68 each appended one
self-contained block at the end. I verified each reconstructed file independently, for
balanced braces, for containing its own selectors, and for containing **none** of the other
tasks' selectors. All three passed.

| Branch | Look at | Files |
|---|---|---|
| `preview/66-house-style-review` | `/admin/submissions` (Pending tab, a submission with a description) and `/add-your-bar` (the description field's help line) | `house-style.ts`, `DescriptionReview.tsx`, admin submissions, add-your-bar, one grid rule |
| `preview/67-feature-page` | `/feature-your-bar`, the hero, the three plan cards, the pricing block | `feature-your-bar/page.tsx`, its `globals.css` rules |
| `preview/68-upsell-panel` | `/owner-dashboard` right after a claim, the panel under the green card | `owner-dashboard/page.tsx`, its `globals.css` rules |

`bar-count.ts` is on **none** of them. It is already on main.

The branch graph is three siblings off the 502 fix, each touching only its own files:

```
* 18ac744 (preview/68-upsell-panel)
| * 3c37f8d (preview/67-feature-page)
|/
| * d4d1111 (preview/66-house-style-review)
|/
* 0f4082e (main) perf: cache the directory stats
```

### The preview URLs

All three Vercel builds finished **SUCCESS**. The links are behind Vercel's SSO, so they ask
you to sign in and then open normally; an anonymous visitor gets a 302 to the Vercel login,
which is the protection working as it should.

| | Preview | PR | Open this page |
|---|---|---|---|
| **66** house style | https://barmagazine-next-git-previ-3b9738-romanzelenkajj-7135s-projects.vercel.app | [#61](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/61) | `/add-your-bar`, then `/admin/submissions` |
| **67** feature page | https://barmagazine-next-git-previ-2a88d3-romanzelenkajj-7135s-projects.vercel.app | [#62](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/62) | `/feature-your-bar` |
| **68** upsell panel | https://barmagazine-next-git-previ-60ddbd-romanzelenkajj-7135s-projects.vercel.app | [#63](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/63) | `/owner-dashboard` after a claim |

**A correction to the task's assumption.** Pushing a branch was not enough on its own. This
project does not have Vercel's `<project>-git-<branch>-<team>` branch aliases turned on, and
I confirmed that by finding that even `-git-main-` 404s while a deliberately bogus team slug
fails DNS outright. The URL is a hashed alias that only surfaces on the deployment, so I
opened a **draft pull request** per branch and took the URL from the Vercel check. Drafts
also give you the merge button when you are ready. I have added this to the SETUP.md note so
the next task does not repeat the guesswork.


Nothing is merged to `main`. Say go on each and I will merge them one at a time.

## One thing waiting on you that is not on a branch

`src/lib/editorial-sources.ts` carries the bare-`imbibe` change you approved this morning. It
is committed nowhere, so **on the live site Louisville's ten qualifying bars still do not
qualify.** The insert is done and the bars are live; only the ranking rule is unshipped.

It is a one-line data-classification change with a verified blast radius of zero existing
rows, but it does change what `/best-bars/louisville` shows, so under the new standard it
should not go straight to main without you seeing it. Tell me which you want:

- its own `preview/71-imbibe-selective` branch to look at first, or
- straight to main, since you already approved the substance.

## Note on the admin screen in branch 66

`/admin/submissions` is behind the admin password, so a preview URL will show you the login
rather than the panel. I verified the panel against a stubbed API rather than typing your
admin secret. If you want to see it on the preview, you will need to sign in there yourself;
the screenshots in the task 66 report show it with the real Sackville submission.
