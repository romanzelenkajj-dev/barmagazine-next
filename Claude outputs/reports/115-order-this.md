# Task 115: "Order this" on every profile with a pick. Branch `preview/115-order-this`, draft PR #80, NOT merged, 2026-09-23

Preview (Vercel SSO): https://barmagazine-next-git-previ-13ea7a-romanzelenkajj-7135s-projects.vercel.app

- Free bar with a pick: /bars/baba-au-rum (the Athens No. 1 card). "Order this: Baba's Zombie, five
  aged rums, fresh tropical juices, bitters, spices, falernum."
- Featured bar, unchanged: /bars/the-loft (Signature Serves, three serves, and the menu, as before;
  no Order this block).

## What changed

`src/app/bars/[slug]/page.tsx`: on a profile that is not premium, featured or top10, the first
menu highlight renders as the card's block (`.best-bars-order`: hairline above, gold ORDER THIS
label, bold name, grey ingredients, through `splitHighlight` so dashes become commas), in the slot
where the paid Signature Serves section sits, between the info card and Plan Your Visit. Paid
profiles render exactly what they did: the full Signature Serves list and, with menu_sections, the
menu. The JSON-LD `hasMenu` block stays paid-only too.

`src/app/globals.css`: `.bar-v2-order` (32px vertical margin, the serves panel's 28px side padding
so the text lines up with the paid section, 18px on phones; name and ingredients a step larger
than on the card since the block stands alone).

## How many profiles gain the block

**198.** Active bars with at least one menu highlight: 209, of which 9 are top10 and 2 are
featured (they already show Signature Serves). The Los Angeles No. 1 card, Apothéke, is top10 and
has no highlights, which is why the free example is the Athens one.

## Rework (Roman, same day): inside the info card

The block sat bare on the page background. It is now the last row of the info card's text column
(`.bar-v2-info`, grid column 1 at 1100px and up, under the details rows, next to the actions
column), hairline above, same type. Measured: desktop block at x 65 to 675 inside the card, actions
column at 715; on 390 the block sits 21px inside the card edge, no overflow. The Loft (Featured)
unchanged: Signature Serves and the menu, no Order this. PR #80 rebuilt green, same preview URL;
merge on Roman's go.

This is also the origin of the standing rule now in SETUP.md: no text is ever rendered directly
on the beige page background.
