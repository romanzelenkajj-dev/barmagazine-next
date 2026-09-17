# Profile page: move the location map above the "Nearby in <city>" block

Roman (mobile): the map is more relevant to the bar than the nearby list, and on a phone it takes too long to reach it.

Change exactly one thing: on the bar profile page, swap the order of the location map block and the nearby-bars block so the map comes first, on all viewports. No change to either block's content, styling, spacing or headings, and nothing else on the page moves. Standing layout rule applies: 390px and 1440px before/after comparison against live, with the swap as the only difference, reported.

Test on Junebug (New Orleans), Daisy Margarita Bar, and a bar with no coordinates (confirm the page still renders and nothing is left empty). Deploy and report the commit with the 390px screenshot.
