# Top 10 city page cards: photo ratio and the "Order this" callout (Roman approved)

Page: the Top 10 Bars city pages (e.g. Best Bars in London), the bar cards with photo, pills, name, description excerpt, "Order this", address, hours, "Full profile" link. Change exactly two things on that card and nothing else.

1. Photo: the image is cropped to about 3:1 (a letterbox strip). Change the card image to a 16:10 aspect ratio at all widths (object-fit cover, same corner radius, same lazy-loading). Do not touch the directory cards or the profile hero.

2. "Order this": replace the tinted panel with the gold left rule. New markup and style, matching the rest of the site:
   - a hairline above (the same 1px hairline the meta rows use), then
   - small gold uppercase label "ORDER THIS" in the exact style of the "FIND US" / "OPENING HOURS" labels in Plan Your Visit (size, tracking, colour),
   - the drink name on the next line, bold, body colour,
   - the ingredients under it in the secondary grey text,
   - normal spacing to the address line below; no background, no border, no box.
   The data currently renders as "Irish Coffee — Jameson Caskmates ..." with an em dash. Split on that dash into name and ingredients; if a value has no dash, show it all as the name. No em dash may be rendered anywhere in the block.

Standing layout rule: 390 and 1440 before/after against live; the only differences are the two above. Test on Best Bars in London (Swift has both) and a city where a bar has no "Order this" (block absent, no empty hairline). Deploy and report the commit with a 390 screenshot of the Swift card.
