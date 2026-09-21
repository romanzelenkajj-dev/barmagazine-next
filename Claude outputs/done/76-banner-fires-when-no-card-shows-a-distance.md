# Amendment to task 75: the banner has no threshold of its own

Task 75 was already in progress when Roman caught a gap in it, so this is a correction rather than a new feature. Apply it to the same work.

## The gap

Task 74 keyed the near-me banner to the 80 km radius. Task 75 keys the distance on the card to 30, in the visitor's own unit. Those are two separate numbers, so between them there is a band where **no card shows a distance and no banner explains why**. A visitor whose nearest bar is 45 km away would see a list of bars with no distances and no reason given.

## The rule

**The banner fires whenever no card in the current list shows a distance.** It is derived from the cards, not from a radius of its own.

So: if the nearest bar in the list is past the card threshold, the banner speaks, naming the real distance to the nearest one. If any card is showing a distance, the banner stays silent.

Do not give the banner its own number. Two thresholds will drift apart the next time either is tuned, and this is exactly how the gap appeared in the first place.

## Everything else in task 75 stands

The 30 in the visitor's own unit, miles or kilometres rather than a converted figure. The same country test deciding both the unit and the threshold. Display only, no change to ordering or to the near-me bands.

## Guards

Standing layout rule. **Do not merge to main.** It belongs on the same preview branch as task 75 so Roman sees the whole behaviour at once. This task carries no approval from him: ask in your own chat.

## Report

Three cases from the near-me view: a visitor with bars inside the threshold, one with the nearest bar just outside it, around 45 km, and one with nothing for hundreds of miles. Show that exactly one of the card distances and the banner is doing the talking in each.
