# URGENT: profile sidebar disappears on bars with many mentions (task 22 regression), plus the footer gap

## 1. Sidebar blowout (live now on /bars/handshake-speakeasy at 1440; verified with a headless render)
The mentions carousel track (.bar-v2-mentions-track, flex, non-wrapping, 8 cards) reports a min-content width of all its cards. The grid column .bar-v2 has the default min-width:auto, so the 3fr column expands to that width, the sidebar is pushed out of the viewport and the info card's buttons render off the right edge. Bars with 3 or fewer mentions (Mírate) are unaffected.

Fix: `.bar-v2 { min-width: 0; }` and `.bar-v2-mentions { min-width: 0; }` (and overflow hidden on the block if needed), and make the track `overflow-x: auto` unconditionally (not only under .is-scrollable) so it can never widen its container even if the class is missing. Verify at 1440 on Handshake Speakeasy (8 mentions), Night Hawk (5), Lyaness (3), Mírate: sidebar visible at 1fr, main column 3fr, arrows working on Handshake. Also check the nearby grid and the carousel do not overflow at 1000 and 390.

## 2. Gap above the footer (Roman, Mírate screenshot at 1440)
The space between the bottom of the last block in the main column (the nearby grid) and the top of the footer is visibly larger than the gap between the main column and the sidebar (var(--gap)). Make the vertical gap from the end of the profile content to the footer exactly var(--gap), the same as the column gap. Find what adds the extra (bar-profile-outer margin-bottom plus the last block's margin plus the footer's separator rule) and collapse it to one gap; if the hairline above the footer is a site-wide element, keep it but include it inside that one gap. Check the same on a directory page so the footer gap stays consistent site-wide.

Standing layout rule applies to both. Deploy and report with 1440 screenshots of Handshake Speakeasy (sidebar back) and the bottom of Mírate.
