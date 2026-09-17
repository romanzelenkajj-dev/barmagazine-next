# "<Bar> in BarMagazine": horizontal carousel instead of a wrapping grid (Roman)

Roman on Night Hawk (5 mentions): a grid of three plus an orphan row of two looks wrong. Make the article-mentions block a single horizontal row that scrolls sideways when there are more than three cards.

Behaviour:
- Cards: the task-19 article card unchanged (image, title, date, same link href/anchor text).
- Track: one row, CSS scroll-snap (snap to each card's start), horizontal overflow, scrollbar hidden, native touch swipe. Desktop shows 3 cards in the visible width with the same gap as the grid; tablets 2; phones 1 card at about 85% width so the next one peeks in from the right (the peek is the affordance on touch).
- With 3 or fewer cards: no scrolling, no arrows, no peek; a plain row that fills left to right (cards keep their one-third width, not stretched).
- Desktop arrows: two small round buttons (previous / next) at the top right of the block, next to the heading, in the house pill style; each click scrolls by one card with smooth behaviour; the previous button is disabled at the start and next at the end. Hidden below 1100px and hidden when there are 3 or fewer cards. No auto-play, no dots.
- Keyboard: the track is focusable and arrow keys scroll it. Each card remains a normal link for crawlers; all cards are in the server HTML (nothing loads on scroll).
- Small client component for the arrows only; the track itself must render and scroll without JS.

Standing layout rule: 390 and 1440 before/after; only this block changes. Test on Night Hawk (5), Lyaness (3, static row), a bar with 1 mention, a bar with 8+ (find one). Deploy and report the commit with a 1440 screenshot of Night Hawk showing the arrows and a 390 screenshot showing the peek.
