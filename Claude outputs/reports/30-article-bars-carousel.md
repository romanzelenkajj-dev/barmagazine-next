# Report: 30-article-bars-carousel (2026-09-16, 15:00 to 15:12 PT)

Done and deployed: commit 0bd3021. Only the "Bars in this article" block changed; the article body, its inline links, the share bar and everything else are untouched.

## What the block is now

- src/components/ArticleBarsCarousel.tsx, a server component: takes the slugs from article-mentions.generated.json for the article (the same map as before, alphabetical by name, order kept), fetches those rows from Supabase (active only; the public 300-second cache), and renders the task-22 track: `.bar-v2-mentions-track` with scroll-snap, hidden scrollbar, native swipe, the track focusable for the arrow keys when it scrolls; three cards visible on desktop with the previous/next buttons (MentionsArrows, the only client bit) when there are more than three, two visible on tablets, one at 85% on phones with the next card peeking in; a static row for three or fewer. Every card is in the server HTML.
- Each card is the directory card (DirectoryBarCard, shared with /bars/city and the profile's nearby block): 16:10 photo or the dark placeholder with the glyph, TOP 10 / 50 Best / Featured pills on the photo, the name, and the "City, Country" location line as on /bars. The whole card links to /bars/<slug>, the same href the old list item carried.
- Wrapper: the outlined box is gone. A hairline above (the site's rgba(0,0,0,0.06)), 24px of space, the heading "Bars in this article" at the profile block size (1.2rem, 600) with the arrows beside it on the right. The article body underlines its links; that rule is overridden inside the cards so names and location lines are not underlined.
- Renders nothing when the article names no bar, and nothing when none of the named rows is active.

## Internal-link check

Negroni Week article, before: /bars/bar-leone-shanghai, /bars/connaught-bar, /bars/milli, /bars/the-haflington, /bars/zuma-hong-kong (list items). After: the same five hrefs, in the same order, one per card. Eco Totes (one bar): /bars/28-hong-kong-street before and after.

## Before and after, Negroni Week 2026 APAC article (5 bars)

1440: block top 3796 both; height 312 (the list box) to 337 (heading row plus one row of 250px-wide cards); the share bar below moves from 4132 to 4157. Track 781 wide, scrollWidth 1313, three cards fully visible, two arrows (previous disabled, next enabled), cards Bar Leone (Shanghai, China, placeholder), Connaught Bar (London, United Kingdom, TOP 10 + 50 Best), Milli (Singapore), then The Haflington (Hanoi, Vietnam) and Zuma (Hong Kong) off to the right.
390: block top 5446 both; height 312 to 328; track 298 wide, first card 253 (85%), 29px of the second card peeking in, arrows hidden, document width 390.

## Other test pages (local build)

- Eco Totes (1 bar): block present, one 250px card at the left of the 781px row, no arrows, static, no underline.
- Top 10 Bars in Dubai 2025 (10 bars): ten cards, arrows, scrollWidth 2642 in a 781 track.
- Tato Giovannoni / Torno Subito (3 pairs on the profile side): NO block, by the build script's standing rule that the article side skips bars whose WP body already links the profile (the body links all three: torno-subito, floreria-atlantico, floreria-atlantico-dc), so the article never carries two links to one bar. The three-card static case was checked on Eco Totes (one) and on the rule itself (the `is-scrollable` class and the arrows appear only above three).

Live after the deploy (4d12a1b, 60 s after the push): the Negroni Week article serves five directory cards, two arrows, and the same five hrefs in the same order.

## Screenshots

Negroni Week block at 1440: heading with the two round arrows at the right, three directory cards in a row (Bar Leone placeholder, Connaught Bar photo with its pills, Milli placeholder), the share bar beneath. At 390: the heading, the Bar Leone card at 85% width with the Connaught card peeking in from the right, then the share bar. The capture tool returns no file path.
