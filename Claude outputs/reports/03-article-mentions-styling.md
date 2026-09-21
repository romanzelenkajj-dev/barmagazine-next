# Report: 03-article-mentions-styling (2026-09-15, 13:49 to 14:01 PT)

Done and deployed: commit da4f3b2 (Ready 13:58 PT), changelog b1b0a3d.

## What changed (presentation only)

src/app/bars/[slug]/page.tsx and src/app/globals.css.

1. The block is now the same white rounded card as the profile info card (var(--bg-card), var(--radius), the 1px hairline border, 2rem/2.5rem padding; 1.5rem/1.25rem on phones). Heading "<Bar name> in BarMagazine" in the card heading style (1.35rem, 600). The block also carries id="mentions".
2. One row per article: a small rounded lazy-loaded thumbnail on the left (the article's featured image, 96x64 on desktop), the title, and the publish date beneath it in the muted meta style. No bullet markers (list-style none on an ordered list; the order is the generator's alphabetical order, unchanged). Rows are separated by hairlines. The whole row is clickable: the title's stretched ::after covers the row.
3. Nothing renders for a bar with no confirmed mention; the existing mentionedIn.length > 0 guard is unchanged.
4. Phones: rows keep the thumbnail on the left at a fixed 72x48, the title wraps beside it (Little Rituals' two titles wrap to two lines at 390px), the date sits under the title.
5. Links: the anchor wraps the thumbnail (alt "") and the title only, so href and anchor text are exactly what they were; the date is a sibling outside the anchor. Verified by extracting every (href, text) pair in the block from the LIVE pages before the change and from the local and then live pages after: identical on Little Rituals (2) and 1930 (5). Server-rendered: the card, its anchors and the lazy <img> tags are in the HTML returned by curl.

## Data (the only non-presentation change)

The mentions JSON carried only slug and title per article, so the thumbnail and date had to come from somewhere. scripts/build-article-mentions.mjs now also reads date and jetpack_featured_media_url from the same WordPress posts query and writes date and image per pair. The matching rule, allowlist and same-sentence rule are untouched. Because the directory has grown since the JSON was last built, a full regeneration would have ADDED 11 pairs (0 removed), and the task said no change to which articles appear, so only the two new fields were merged into the committed 1,010 pairs. All 1,010 have an image and a date. The 11 a regeneration would add, for Roman's next regeneration decision:
- crown-shy -> musket-room-unveils-new-all-female-wine-leadership-team
- crown-shy -> top-10-nominees-for-the-2024-spirited-awards
- dolores -> barcelonas-cocktail-evolution
- jewel-box -> 2025-james-beard-awards-semifinalists-announced
- lone-wolf-lounge -> 2025-james-beard-awards-semifinalists-announced
- nubeluz -> top-10-nominees-for-the-2024-spirited-awards
- nubeluz -> top-4-finalists-for-the-2024-spirited-awards-announced
- raines-law-room-william -> top-10-nominees-for-the-2024-spirited-awards
- the-bar-at-willett -> 2025-james-beard-awards-semifinalists-announced
- water-witch -> 2025-james-beard-awards-semifinalists-announced
- wolf-tree -> 2025-james-beard-awards-semifinalists-announced
(The regeneration also reported 26 held generic-name matches, up from 24; claude/article-mentions-held.md was left as committed.)

## Tests

- Little Rituals (2 mentions), 390px local and live: two rows, 72px thumbnails left, titles wrapping to two lines beside them, dates "January 22, 2025" and "May 30, 2024", images loading="lazy", hrefs and texts equal to the baseline.
- 1920 (1 mention), 390px: one row, heading "1920 in BarMagazine".
- 1930 (5 mentions), 1280px local and live: five rows, anchors equal to the baseline, five lazy images, dates present.
- The Snug (no mentions), 390px and live HTML: no block, no heading, no empty card.
- Build clean, 300 tests green.

## Screenshots

Captured from the live site after deploy in the Browser pane, at 390px (Little Rituals) and 1280px (1930), with the block brought to the top of the page in the browser only so the capture shows it (the pane was hidden and would not scroll). Mobile: the card with two rows, thumbnail left, wrapped titles, dates. Desktop: five rows with 96px thumbnails, titles and dates, hairlines between rows. The capture tool does not return file paths, so the images are not attached here; the live pages show the same.

## Commit

da4f3b2 on main, deployed 13:58 PT.
