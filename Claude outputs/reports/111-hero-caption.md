# Task 111: article hero caption. Built on `preview/111-hero-caption`, draft PR #76, NOT merged, 2026-09-23

Preview (Vercel SSO, you are signed in):
https://barmagazine-next-git-previ-f14f56-romanzelenkajj-7135s-projects.vercel.app

Look at:
- `/50-best-bars-2026-extended-51-100-list`: the line "Boilermaker, No. 57, Goa" sits under the
  hero. That is the whole caption WordPress holds for media 5613; the "Photo courtesy of The 50
  Best Bars" part you quoted is not in the media library, so it does not render. Add it to the
  caption in WP and it appears on the next revalidation.
- `/central-europe-hospitality-expo-cehe-2027`: media 5561 carries no caption, nothing renders,
  the body sits where it did. (Medellín Cocktail Week does carry a caption, so it was not usable
  as the empty case; the other caption-less recent articles are margarita-mile-hong-kong-2026,
  silver-lyan-folklore-menu, best-cocktail-bars-amsterdam-2026.)

## What changed

- `src/lib/wordpress.ts`: `WPMedia.caption` typed; `getFeaturedImageCaption(post)` returns the
  caption as one plain line or null. The theme appends a "More" link to the attachment page inside
  every rendered caption (`<a class="g1-link g1-link-more">`); it is dropped before the tags are
  stripped, so no caption ends in "More".
- `src/app/[slug]/page.tsx`: one line after the hero, `<p class="article-hero-caption">`, only
  when the media has a caption and the hero image rendered.
- `src/app/globals.css`: `.article-hero-caption`, 12px, `--text-tertiary`, centred, 6px top
  padding, no margin: the same numbers as `.article-body figcaption` and `.wp-caption-text`, so
  the hero caption and the body captions read as one convention. Nothing else on the page moves;
  when a caption renders the body card shifts down by the line's height, which is the change.
- `src/lib/wordpress.test.ts`: three cases for the helper (More link stripped, entities decoded
  and whitespace collapsed, null for missing, empty and whitespace-only captions). 23 passing.

## Rendered check

Server HTML from the branch on a local dev server: the 51-100 article carries
`<p class="article-hero-caption">Boilermaker, No. 57, Goa</p>` immediately after the hero
`</div>`; the CEHE 2027 article has no `article-hero-caption` element. Computed style on the line:
12px, rgb(154,154,154), centred.

## Files

Branch only. This report on main. Nothing merged.
