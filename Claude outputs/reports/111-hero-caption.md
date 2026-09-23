# Task 111: article hero caption, inside the hero (rework). Branch `preview/111-hero-caption`, draft PR #76, NOT merged, 2026-09-23

Preview (Vercel SSO, you are signed in):
https://barmagazine-next-git-previ-f14f56-romanzelenkajj-7135s-projects.vercel.app

Look at:
- `/50-best-bars-2026-extended-51-100-list`: "Boilermaker, No. 57, Goa" in the bottom-right corner
  of the hero photo, inside the rounded corners. That is the whole caption WordPress holds for
  media 5613; "Photo courtesy of The 50 Best Bars" is not in the media library, so it does not
  render until it is added there.
- `/central-europe-hospitality-expo-cehe-2027`: media 5561 carries no caption, nothing renders.

## Rework (your note: the line under the hero broke the spacing)

The caption is now a `<span class="article-hero-caption">` INSIDE `.article-hero`, absolutely
positioned: right 12px, bottom 12px, z-index above the overlay, max-width 60%, right-aligned,
11.5px, white at 70% opacity, pointer-events off. Legibility: the hero already carries a bottom
gradient (`.article-hero-overlay`, 85% black at the foot) under every hero, so the corner is
dark on every photo; on top of that a soft text shadow (0 1px 2px, black at 55%) that only shows
against a light patch. No extra box or per-photo gradient, so nothing is added to photos that do
not need it. Nothing outside the hero changes: the hero height is unchanged (400 at the pane
width, 600 on desktop) and `.article-layout` follows it directly, with or without a caption.

Measured on the branch (local dev server, the pane's own width): caption inside the hero, right
inset 12px, bottom inset 12px, 11.5px, rgba(255,255,255,0.7), shadow as specified, zero caption
elements outside the hero; on the caption-less article, zero caption elements and the same hero
height and following element.

## Unchanged from the first pass

- `src/lib/wordpress.ts`: `WPMedia.caption` typed; `getFeaturedImageCaption(post)` returns the
  caption as one plain line or null, with the theme's trailing "More" link dropped.
- `src/app/[slug]/page.tsx`: renders the span only when the media has a caption and the hero
  image rendered.
- `src/lib/wordpress.test.ts`: three cases, 23 passing.

## Files

Branch only (`70c4088`, rebased on main after PRs #74 and #75 merged). This report on main.
Nothing merged.

## Bug (Roman, 2026-09-23): the description was showing as the caption. Fixed on main, `1fa0508`

On /tato-giovannoni-floreria-atlantico-torno-subito-miami the overlay printed a two-line paragraph.
Cause: WordPress renders an attachment's caption through the excerpt filters, and wp_trim_excerpt
fills an EMPTY excerpt from the post content, which for an attachment is its Description. So the
API's `caption.rendered` for that image carried the description, and the code read exactly the
field it was told to. The raw caption needs an authenticated request (the WordPress.com proxy
refuses unauthenticated media reads, 401), but the site's own `/wp-json/wp/v2/media/<id>` answers
without auth and exposes the description too.

Fix: `fetchFeaturedImageCaption()` reads the media record from the site's own endpoint
(revalidate 300) and `captionFromMedia()` keeps the caption only when the description does not
begin with it; an empty caption, a description-filled caption, or a failed read all mean no
overlay. Alt text is never used. 6 new tests, the old three rewritten. Confirmed live: the Tato
article has no caption element; the 50 Best list shows "Boilermaker, No. 57, Goa".
