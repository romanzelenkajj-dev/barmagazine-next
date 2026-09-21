# Photos first, inside a merit band

This was cancelled once on my bad measurement and is now back on Roman's evidence. I read the page HTML with a window that spilled into the next card, so placeholder cards picked up their neighbour's image tag and the page looked fine. It is not fine. On `/best-bars/us/california/cocktail-bars` four of the first nine cards are placeholders: Trick Dog at 3, Pacific Cocktail Haven at 4, Buena Vista Cafe at 6, Realm of the 52 Remedies at 9. Verify by screenshot, not by parsing HTML.

The rule is not photos before everything. It is photos first among bars of comparable standing.

His words: "I'm only saying that the 50 best photo-less bars will drop behind the 50 best bars with photos."

So a 50 Best bar never falls below a free bar with a snapshot. It falls below another 50 Best bar that has a photo. An accolade holder keeps its standing, and the photo decides the order among its peers.

## Why do it at all

Only 198 of 1,469 active bars carry a photo. A page that is mostly placeholders reads as unfinished, and it fails to reward the bars that did the work. Roman: "it signals to the bars that it's better for them to add a photo and claim the profile if they want to be seen." A bar that wants to move up now has something to do about it, and it is the thing we want them to do anyway.

## The rule

Sort keys in order:

1. Tier, as today.
2. **Merit band**, a coarse grouping rather than an exact score: bars with a renderable accolade, then bars qualified only by a selective editorial source, then everything else.
3. **Photo present.**
4. Exact accolade score, as today.
5. Name.

The change is only that key 3 now sits above key 4 instead of below it. Two bars in different bands never swap. Two bars in the same band swap when one has a photo and the other does not.

The California page is the proof case. True Laurel, Trick Dog and Pacific Cocktail Haven all carry Top 10 and 50 Best, and Buena Vista Cafe carries Top 10. They sit in the same band, so photo-first reorders them among themselves and none of them crosses a band. The first row should come out as three photos.

Apply to every bar grid: region and state by-type pages, best-bars city and city-by-type pages including the "Also in" sections, `/bars/city/<slug>`, the country pages, and the `/bars` directory modes that are not proximity-driven.

## The one exemption

A city's curated Top 10 block keeps its published article order. Those ten are our editorial ranking and several are numbered in a live article, so reordering them by photo would put the site and the article in conflict. Near-me mode is also unchanged, because proximity is the point there.

## Second part, the incentive made explicit

The claim email in `scripts/send-upsell.mjs` should say plainly that listings with a photo rank above listings without one, and that adding one takes a minute after claiming. One sentence, in the existing voice, no new section and no layout change.

Do not send anything. Prepare it and report it. Sends wait for Roman's confirmation in your own chat.

## Guards

Standing layout rule: ordering only, plus one sentence of email copy. No spacing, no card changes, no breakpoints. Which bars appear on a page does not change, only their order.

## Report

Before and after, as an ordered list of names with photo yes or no and the accolade band beside each, for `/best-bars/us/california/cocktail-bars`, `/best-bars/london`, `/best-bars/bratislava`, `/bars/city/amsterdam` and `/bars` filtered to Bratislava, at 390px and 1440px.

Then the check that matters: confirm no bar crosses a band. Name any bar that moves more than ten places and say which band it is in, so Roman can see the change is happening inside bands and not across them.

Finally, how many of the 450 bars holding an accolade or a Top 10 place still have no photo, by country.
