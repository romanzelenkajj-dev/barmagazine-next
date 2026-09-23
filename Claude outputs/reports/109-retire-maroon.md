# Task 109: retire the maroon. Built on `preview/109-retire-maroon`, draft PR #75, NOT merged, 2026-09-23

Preview (Vercel SSO, you are signed in):
https://barmagazine-next-git-previ-9c9db0-romanzelenkajj-7135s-projects.vercel.app

Look at:
- an article with body links: `/medellin-cocktail-week-2026` (the "Medellín Cocktail Week" link in the
  first paragraph, and the "Bars in this article" block further down)
- a bar profile: `/bars/panda-sons` (the gold 50 Best tile is untouched; the maroon is gone from the
  page's CTA banner at the foot)
- for the rest of the moves: the homepage (section links, article category labels, CTA banner),
  `/feature-your-bar` (unchanged, it already ran on gold), `/near-me` (the icon disc).

## What changed, all in `src/app/globals.css` (38 insertions, 29 deletions)

**Article and body links** (`.article-body a`): colour inherited, weight inherited, underline in the
badge gold `#B08D3F` at 1.5px with a 3px offset; hover turns the text gold. Verified by computed
style on the branch against live: live `color rgb(123,30,30)`, underline maroon, thickness auto,
offset 2px; branch `color rgb(107,107,107)` (the body grey it now inherits), underline
`rgb(176,141,63)`, 1.5px, 3px, weight 400. The global `a { color: inherit }` rule already covered
every other link, so nothing else needed a colour.

**Tokens.** `--accent` is not deleted: the welcome email template, the admin screens and
add-your-bar read it by name, so removing it would blank them. It now resolves to the gold ink
`#8A6A24` (5.04:1 on white), `--accent-rgb` to `138, 106, 36`. Two new tokens: `--gold: #B08D3F`
(the World's 50 Best badge outline) and `--gold-ink: #8A6A24`. `.feature-page`'s own
`--accent: #8A6A24` override stays; it is now the same value as the root.

**Every remaining use of the token, and where it went:**

| Line (before) | Rule | Was | Now |
|---|---|---|---|
| 413 | `.section-link` colour | maroon | gold ink |
| 465 | `.article-card-cat` (category label on cards) | maroon | gold ink |
| 870-876 | `.article-body a` / `:hover` | maroon text, maroon underline; hover black | inherit; gold underline 1.5px/3px; hover gold |
| 1135 | avatar initial letter (author circle) | maroon | black (`--text-primary`) |
| 1860 | `.cta-banner` background | maroon | black (`--bg-dark`) |
| 1913 | `.cta-submit` background | maroon | black |
| 7166 | `.feature-hero::before` radial wash | `rgba(123,30,30,0.18)` | `rgba(176,141,63,0.18)` |
| 7050, 7298, 7581, 7642, 7664, 11134 | feature-page kickers, tier ticks, FAQ border and chevron, proof caption link | already gold via the page override | unchanged (listed for completeness) |
| 7944 | `.deck-dot.active` | maroon | black |
| 7990 | `.nearme-icon` background | maroon | black |
| 8084 | `.claim-card` kicker | maroon | gold ink |
| 8278 | `.dir-typeahead-footer` | maroon | gold ink |
| 8551 | `.reading-progress-fill` | maroon | gold |
| 8578 | `.share-copied` | maroon | gold ink |
| 8624 | `.ticker-label-star` | maroon | gold |
| 9602 | `.owner-dash-signout:hover` | maroon | black |
| 9787, 9791 | `.admin-claim--transfer` border, `.admin-claim-transfer-flag` background | maroon | black |
| 9856, 9857, 9867 | `.admin-claim-revoke` border/text, hover background | maroon | black |
| 9986, 9990 | `.admin-review-tab.is-active` underline, `.admin-review-count` background | maroon | black |
| 10006 | `.admin-review-editor-link:hover` | maroon | gold ink |
| 10605 | `.claim-offer-kicker` | maroon | gold ink |

Nothing else in the CSS references the maroon: `grep` for `var(--accent)`, `--accent-rgb`,
`#7B1E1E` and `123, 30, 30` now returns only the token definitions and the feature-page lines above.

## Not touched: hard-coded maroon outside the CSS (say if you want a follow-up)

These carry the hex `#7B1E1E` literally, not the token, so the task's grep of the CSS does not
reach them. Two are visitor-facing:
- `src/components/BarDirectoryMap.tsx` 461, 488, 514: the directory map pin and cluster colours
  and the FEATURED tag in the map popup.
- `src/components/BarProfileClient.tsx` 45: the profile map marker.
- `src/lib/emails/welcome.ts` 16, 21, 25, 28, 81: the welcome email's rule, dot, button and link.
- Admin only: `src/app/admin/bars/AdminBarsClient.tsx` (859, 883, 885, 1042, 1043),
  `src/app/admin/submissions/page.tsx` (157, 176, 215, 219), `src/app/admin/bars/PhotoManager.tsx`
  89, `src/app/admin/owner-edits/page.tsx` 289.
- `src/app/add-your-bar/page.tsx` 760-761 reads `var(--accent)` and so moves to gold ink with the
  token; listed so you know that page's info card changes colour too.

## Before/after

Computed styles were compared on the article link at 1440 and 390 (numbers above). Rendered
screenshots of the scrolled article did not composite in the in-app browser pane at either width
(the pane returned blank frames once scrolled), so the visual check is yours on the preview; the
profile page rendered identically at both widths apart from the CTA banner colour, which is a
named change.

## Files

`src/app/globals.css` on the branch only. This report on main. Nothing merged.
