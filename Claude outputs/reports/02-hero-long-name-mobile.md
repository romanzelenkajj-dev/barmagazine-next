# Report: 02-hero-long-name-mobile (2026-09-15, 13:20 to 13:27 PT)

Fixed and deployed (commit 94858e2, Ready 13:24 PT). Option 4 chosen: on phones the placeholder hero drops the name and shows the glyph plus the category pill; on desktop the name stays and wraps without clamp or ellipsis.

## What was wrong

The no-photo hero is height-capped on phones (max 320px, min 260px at 768px and below) and the placeholder inside it is absolutely positioned with the inscribed name under the glyph ring. The base .bar-placeholder-name rule (meant for card tiles) carries a two-line -webkit-line-clamp with overflow hidden, and the ring (116px) plus gap, padding and 72px of badge clearance already consume about 220px, so a second line of a wide-tracked 19px name lands below the hero's bottom edge. On Captain Foxheart's Bad News Bar & Spirit Lodge at 390px the hero read "CAPTAIN FOXHEART'S" with "BAD NEWS BAR & SPIRIT LODGE" cut off, and the COCKTAIL BAR pill sat over the clipped region. Bitter & Twisted, in Roman's screenshot, now carries a photo, so it was tested through the longest no-photo names instead.

## Why option 4 rather than shrinking the name

The page H1 repeats the full name directly beneath the hero on every profile (the mobile screenshot shows both), so on a phone the inscription is duplication that can only clip or crowd the pill; a three-line 15px inscription would still have needed the hero to grow past its cap. Dropping it on phones leaves the glyph centered with the pills, which is exactly what the card tiles already do. Desktop has a 520px hero and no adjacent name inside the visual, so it keeps the inscription.

## The change (src/app/globals.css)

- .bar-placeholder--hero .bar-placeholder-name: font-size clamp(15px, 1.5vw, 19px), display block (no line clamp), -webkit-line-clamp none, overflow visible, overflow-wrap anywhere, max-width 84%, line-height 1.55. Never truncates.
- @media (max-width: 768px): .bar-v2-hero .bar-placeholder-name display none; .bar-v2-hero .bar-placeholder padding-bottom 56px.
- Photo variant: the name is never overlaid on a photo hero (only the badges are), so nothing to change there. The badges keep their absolute bottom-left position; with the inscription gone on phones nothing can collide with the pill.
- .claude/launch.json gained a "barmagazine-dev" config (npm run dev) for local checks.

## Checks

Fourteen longest active names without a photo (the length query, photo rows excluded): Cause Effect Cocktail Kitchen & Cape Brandy Bar (47), Captain Foxheart's Bad News Bar & Spirit Lodge (46), Rooftop @ The Social Hub Florence Lavagnini (43), Bootlegger Cocktail Bar & Cuisine Montréal (42), El Espacio: Cocktail, Mezcal & Agave Bar (40), Friday Saturday Sunday (39), Champagne Bar at Four Seasons Surf Club (39), The Franklin Mortgage & Investment Co. (38), Cheers Cocktail Bar Adega & Tabacaria (37), L'infâme Tittle Tattle (37), Bang Bang Bar at Teeling Distillery (35), To - Hidden Cocktails Bar (35), The Library Bar at The Lanesborough (35), Sugar Ray You've Just Been Poisoned (35).

- 390px (local dev, then live after deploy): inscription display none; glyph ring inside the hero (ring bottom 251 against hero 260 tall); ring bottom above the badges' top; H1 below carries the full name. Live measurement after deploy: nameDisplay none, ringInsideHero true, ring clear of badges.
- 375px: same result on Cause Effect (the longest name).
- 1280px: all fourteen measured in the browser: font 19px, one line each, name box inside the 520px hero, name bottom at 315px against the badges' top at 482px, no clamp, no ellipsis. Nothing regressed on desktop.

## Screenshots

Before (live, 390px): one line "CAPTAIN FOXHEART'S", second line cut at the hero's bottom edge, pill over the cut. After (live, 390px, post-deploy): glyph ring centered in the hero, COCKTAIL BAR pill bottom-left, full name in the H1 below. Both were captured and reviewed in the Browser pane during the run; the capture tool did not return file paths, so they are not attached here. The live page at 390px shows the after state.

## Commit

94858e2 on main, deployed 13:24 PT. Tests 300/300, build clean.
