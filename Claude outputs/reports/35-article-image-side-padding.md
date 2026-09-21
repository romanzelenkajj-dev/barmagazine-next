# Report: 35-article-image-side-padding (2026-09-16, 17:00 to 17:42 PT)

Done and deployed: commit 3d7301a (changelog fedbd82), production Ready. CSS only; only the phone inset of bare paragraph images changed.

## Cause

Two ways an image reaches an article: inside a figure (the publisher's nested structure, WordPress's figure.wp-caption, or a bare figure) or as a bare `<p><img class="alignnone">` (the older WordPress way, the 1986 Steak House article). Tasks 32 and 34 gave every figure a 16px bleed past the text column on both sides. The rules meant to give a bare paragraph image the same box were written as child selectors, `.article-body > p > img`, and never matched: the article HTML is rendered into a wrapper div inside `.article-body`, so the paragraph is a grandchild. Those images therefore fell back to the plain `.article-body img` rule and sat on the text column. That is Roman's "wide" case: 34px from the screen edge; the figure case is the "narrow" one at 18px.

## Fix (src/app/globals.css)

- Base rule: `.article-body p > img` (descendant), width 100%, the house radius, vertical margins kept at 16px above and 8px below as before, no horizontal bleed on desktop.
- Phone block (768px and below): `.article-body p > img`, `img.alignnone`, `img.aligncenter` and `img[data-large-file]` get margin-left and margin-right -16px and width calc(100% + 32px), the same bleed a figure has. An override with the class and attribute variants spelled out keeps any image that sits inside a figure at width 100% and margin 0, so a figure's own alignnone image can never bleed twice (the first draft did exactly that on the Margarita Mile article, caught in the local check).

## Before and after at 390, left edge and width of the image in px (text column 34 to 356)

| Article | Structure | Before | After |
|---|---|---|---|
| Torno Subito (Tato Giovannoni photo, the reference) | nested publisher figure | 18, 354 wide | 18, 354 |
| 1986 Steak House / Tres Monos (Stefano Cremasco photo) | bare p > img.alignnone | 34, 322 | 18, 354 |
| The Pontiac | figure.wp-caption | 18, 354 | 18, 354 |
| El Tequileño / Margarita Mile | bare figure with alignnone image | 18, 354 | 18, 354 |
| World's 50 Best Bars 2025 (a 2025 article) | figure.wp-caption | 18, 354 | 18, 354 |

The Pontiac's two-up gallery cells stay at the gallery's 24px bleed (10 to 380); galleries were not part of the ask. Document width 390 on every page (no horizontal overflow).

## Desktop, 1440 (unchanged)

1986 Steak House images: 80 to 885 (the text column), radius 24px, margins 16px above and 8px below, before and after. Figures keep their 64 to 901 box from task 32.

## Live

1986 Steak House at 390: all three images 18 to 372 (were 34 to 356). Margarita Mile at 390: 18 to 372, unchanged. Document width 390 on both.
