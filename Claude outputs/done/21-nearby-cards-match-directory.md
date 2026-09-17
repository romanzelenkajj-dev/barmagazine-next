# Nearby cards: use the directory card exactly, no accolade tiles (Roman)

Roman on the task-19 result: the accolade tiles under the nearby cards ("patches") make the cards uneven; make them like the bar directory cards.

Change the "Nearby in <city>" cards to the directory card (.bar-dir-featured-card as rendered on /bars/city/<slug> and by BarDirectory.tsx): 16:10 visual with the photo or the existing placeholder, the status pills on the photo (TOP 10, 50 Best, Featured, exactly the rules the directory uses), the name, and one location line. The location line for nearby is "<street or venue>, <distance>" as now, not "City, Country". Remove the AccoladeBadges from these cards. Reuse the directory card component/markup rather than re-styling the nearby card, so the two cannot drift again; if the component must take a prop for the location line, add that and nothing else.

The "<Bar> in BarMagazine" article cards stay as built in 19.

Standing layout rule: 390 and 1440 before/after; only the nearby cards change. Test on Lyaness (placeholders and photos in the same grid) and a US bar (miles). Deploy and report the commit with a 1440 screenshot of the block.
