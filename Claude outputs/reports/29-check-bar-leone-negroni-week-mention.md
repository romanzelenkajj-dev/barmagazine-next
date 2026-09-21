# Report: 29-check-bar-leone-negroni-week-mention (2026-09-16, 15:00 to 15:20 PT)

Done and deployed: commit 6269f11, live 60 s after the push. Only the allowlists and the regenerated mentions JSON were written.

## The Bar Leone pair

The article (Monica Berg and Giorgio Bargiani Headline Negroni Week 2026, slug negroni-week-2026-asia-pacific-guest-shifts) names Bar Leone once in the body: "Berg then continues from Bangkok to Bar Leone Shanghai on September 24, the mainland outpost of the Hong Kong bar named the world's best in 2025, before finishing at Hope & Sesame in Guangzhou on September 26." The guest shift is at the Shanghai room; the Hong Kong bar appears only as the context clause. Roman's screenshot ("Bar Leone, Shanghai" in the Bars in this article block) was therefore right; what was wrong was the OTHER side: the Hong Kong row also carried the article, through a hand-confirmed pair from the 2026-09-15 review that read the context clause as a mention.

Fix:
- Removed from claude/article-mentions-confirmed.txt: bar-leone -> negroni-week-2026-asia-pacific-guest-shifts (with a dated comment saying why).
- Added to claude/article-mentions-excluded.txt: the same pair, reason on the line, so the automatic rule (both cities sit in that one sentence) cannot bring it back.
- Confirmed with the quoted sentence: bar-leone-shanghai -> negroni-week-2026-asia-pacific-guest-shifts.

Regeneration: 1024 -> 1023 pairs; removed exactly that one pair; nothing added; the held list unchanged apart from its timestamp.

## Multi-row audit

Every generated pair for the multi-row names was checked against the article text: the sentences containing the bar's name were extracted and the outpost cities named in them recorded. Rows and results:

- Attaboy (New York; Nashville has 0 pairs): 4 pairs, all name New York in the sentence, or are the New York top ten itself. Clean.
- Employees Only (New York; Singapore 0 pairs): 4 pairs, all New York. Clean.
- Salmon Guru (Madrid, Dubai, Milan): the Madrid row's 4 pairs all name Madrid; the Dubai row's one pair (the Dubai top ten) is the pair already fixed on 2026-09-15 (the Madrid row excluded there). Clean.
- Paradiso (Barcelona; Dubai and Stockholm 0 pairs): 18 pairs, all name Barcelona (Dubai and Stockholm appear only as other bars' cities inside ranking sentences). Clean.
- Zuma (Dubai, Hong Kong, London): Dubai row's 2 pairs name Dubai; the Hong Kong row's one pair is the Negroni article, which says "Zuma Hong Kong hosts the city's opening party". Clean.
- Florería Atlántico (Buenos Aires, Washington DC, Barcelona): the Buenos Aires row's 4 pairs name Buenos Aires (the two rankings, the Bar World 100 list where the name sits in a list item, and the Torno Subito article confirmed in task 28); the DC row has the Torno Subito article only; Barcelona 0. Clean.
- The Living Room (New Delhi, Charleston): 0 pairs each. Nothing to check.
- Bar Leone (Hong Kong, Shanghai): the Hong Kong row's 23 remaining pairs all name Hong Kong or are Hong Kong articles (the two Shanghai-expansion articles are about the Hong Kong bar opening its outpost and were confirmed by Roman; both rows carry them). The Shanghai row's 3 pairs name Shanghai. Clean after the fix above.
- Seed Library (London, New York): one pair to HOLD FOR ROMAN, not changed: seed-library (London) -> seed-library-nyc-new-cocktail-menu-june-2026. The article is about the New York room's new menu; London is named twice, both times as the original. It is the same pattern as the Bar Leone case (context, not participation), but it was produced by the automatic rule and not confirmed by hand, so it is reported rather than moved. The reverse pair (seed-library-nyc on the London top ten) does not exist. The other London pair on a New York article, mr-lyan-brings-seed-library-to-new-york-this-fall, was confirmed by Roman on 2026-09-15 and stands.

## Live

bar-leone (Hong Kong) no longer carries the Negroni Week article in its mentions block; bar-leone-shanghai does; the article's Bars in this article block still lists Bar Leone Shanghai.
