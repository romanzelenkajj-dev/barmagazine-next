# Profile page: "Nearby in <city>" and "<Bar> in BarMagazine" as card grids (Roman approved)

Roman (desktop, Lyaness): both blocks are full-width rows carrying one or two short lines, mostly empty space. Replace each with a card grid that matches the directory cards on /bars.

## Shared grid
- Desktop (>= 1100px): 3 columns, equal width, same gap as the directory grid. 2 columns between 700 and 1099px. 1 column below 700px.
- Card: white, house radius, hairline border, image on top at 16:10 (object-fit cover, lazy, radius on the top corners), content padding as the directory cards. Whole card is the link.
- Never stretch a lone card: with 1 or 2 items the grid still uses the 3-column track, cards stay one column wide, left-aligned.

## Nearby in <city>
- Show 6 nearest (currently 5) so the desktop grid is two full rows; same nearby.ts selection, just limit 6.
- Image: the bar's hero photo; when none, the same dark placeholder with the martini glyph used on the profile hero (small version).
- Content: name (card title style), one grey meta line "<street or venue>, <distance>" (e.g. "28 Bow Street, 1.2 km"; miles for US as today), then the accolade tiles if any (AccoladeBadges, max 3). NO description text.

## <Bar> in BarMagazine
- Same card, image = the article's featured image (already in the mentions JSON), title (card title style, up to 2 lines), date in the meta style. Heading and the block's card wrapper stay; the rows inside become the grid. Links keep the exact href and anchor text they have now (the internal-link check from task 03 must still pass).

## Rules
- Nothing else on the profile page changes. Standing layout rule: 390 and 1440 before/after; the two blocks are the only difference.
- Test on Lyaness (3 mentions, 6 nearby), a bar with 1 mention, a bar with no mentions (block absent), a US bar (miles), a bar whose nearby set includes photo-less bars (placeholder renders).
Deploy and report the commit with 1440 and 390 screenshots of both blocks on Lyaness.
