# The directory hero and promo are too tall, and the photo is the wrong way round

Roman, on `/bars`: the hero and the "get your bar featured" promo take so much height that the first row of bar cards is pushed down. On a directory page the bars are the product, and a visitor arriving from a search result meets a headline and an advert before a single bar.

## 1. Height

**Desktop only.** Bring the hero and the promo box down so a full row of bar cards is visible at 1440px without scrolling. Both boxes stay in the same grid row and keep matching heights, which is how they are built today.

**Nothing in this task touches mobile. Not the height, not the flip, not the scrim.** Roman has looked at the phone view and it is right as it stands, the hero is about a third of the viewport at 390px, and he wants it left exactly as it is today. Every change below is behind a desktop breakpoint, using the breakpoints that already exist. At 390px the page must render byte-for-byte as it does now.

Noted for later, not for this task: on a phone the block under the hero, the search box plus three stacked full-width dropdowns plus the Grid and Map switch, is taller than the hero itself and is what pushes the first card off screen. That is the target if mobile height is ever revisited, not the photo.

Do not remove anything from either box. The headline, the line under it, the three stat counters and the promo's content all stay. This is tightening padding and type scale, not cutting content.

## 2. Flip the photo

`/images/directory-hero.jpg` has the lit bottle shelves and arches across the left third and a darker area with pendant lamps and seating on the right. The headline currently sits over the busiest part of the frame.

Mirror the image horizontally so the bottles sit right and the calm dark area sits left, under the text. The photo mirrors safely: there is no signage or legible text, the bottle labels are far too small to read, and the one framed picture on the wall reads the same either way.

Flip it in CSS with a transform on the image rather than shipping a second file, so the original asset stays untouched and reverting is one line.

## 3. The scrim, which is the part that actually guarantees legibility

The desktop crop changes with viewport width, so at some widths the calm area slides out of frame and the headline lands back on the bottles. Add a soft dark gradient behind the text, strongest at the text edge and fading out across the frame, on desktop only. Then the headline is readable across the desktop range regardless of how the photo crops, and the flip becomes an improvement rather than a dependency.

## Guards

Standing layout rule: the hero and the promo box only. The filter row, the chips, the card grid, the sidebar and the city-guide block below all stay identical. No new breakpoints. The two boxes must stay equal in height to each other at every width, and the hero text must not overlap the nav at any width.

## Report

Screenshots at 1440px before and after, showing how much of the first card row is visible in each, plus 1024px and 1280px to confirm the scrim holds where the desktop crop is most awkward.

And the check that matters most to Roman: 390px before and after, side by side, proving nothing moved on mobile at all.
