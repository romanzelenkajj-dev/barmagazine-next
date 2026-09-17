# Profile hero: long bar names clipped on iPhone when there is no photo

Roman's screenshot (iPhone Safari, /bars/... for Bitter & Twisted Cocktail Parlour, Phoenix): on profiles without a hero photo, the placeholder hero shows the bar name in wide-tracked uppercase. A long name wraps to a second line and the second line ("PARLOUR") is cut off at the bottom of the hero, hidden behind the gradient / card overlap. Only the first line is readable.

Fix in the profile hero component (the no-photo placeholder variant):
1. Let the name wrap and fit: reduce letter-spacing and font size on small screens (clamp), allow up to 3 lines with `overflow-wrap`, and give the hero enough min-height (or let it grow) so all lines are inside the hero, above the card that overlaps it. Do not truncate with ellipsis.
2. Check the same for the photo variant if it also overlays the name, and for the "COCKTAIL BAR" pill so it never collides with the name.
3. Test at 375px and 390px widths with the longest active names in the DB (query `select name from bars where active order by length(name) desc limit 15`) and confirm every one renders fully, then at desktop widths to confirm nothing regressed.
4. Since the H1 in the card already repeats the full name directly under the hero, consider whether the placeholder hero should drop the name entirely on mobile and show only the martini glyph plus category pill; if you go that way, keep the name in the hero on desktop. Report which option you chose and why, with before/after screenshots at 390px.

Deploy after the checks pass and report the commit.
