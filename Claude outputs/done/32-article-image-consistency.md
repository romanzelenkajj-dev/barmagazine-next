# Article images: WordPress-inserted figures must render like publisher figures (Roman)

NOTE: the publisher-side fix and the cleanup of the Torno Subito post's HTML (unwrapping the nested figures, removing the empty figure, fixing the two captions) are being done in the BarMagazine-Publisher-Web project right now. Do NOT touch the post content in this task. Check the live post after that work lands; if it is already clean (3 figures, none nested, no en dashes), skip step 2 entirely.

Facts from Roman: images inserted by the publisher app render inset to the text column with rounded corners and the caption below (the standard; see the El Tequileño / drinks99 article bottle photo at 390px). Images inserted directly in WordPress render edge to edge (image 2, Ruben Cabrera, on barmagazine.com/tato-giovannoni-floreria-atlantico-torno-subito-miami).

1. In the article CSS (src/app/[slug] article body styles): make ANY image in the article body, whichever way it was inserted (clean figure.wp-caption, figure with an img and no caption, bare img in a p), render the same: inset to the text column, house radius, caption below in the caption style, on phones and desktop. Do not change the publisher app.
2. (Only if still needed, see NOTE.) Nothing.
3. Verify at 390 and 1440 on the Torno Subito article (3 images) and the El Tequileño article that every image has identical width, radius and caption placement. Standing layout rule for anything else on the article page.
Deploy and report the commit with the 390 screenshots.
