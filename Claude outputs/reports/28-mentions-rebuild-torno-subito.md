# Report: 28-mentions-rebuild-torno-subito (2026-09-16, 14:50 to 15:00 PT)

Done and deployed: commit d31c693, live 60 s after the push. The three pairs are produced, Barcelona is not, nothing was removed.

## Confirmed pairs, with the sentence each rests on

Added to claude/article-mentions-confirmed.txt (article tato-giovannoni-floreria-atlantico-torno-subito-miami, live, 200):
- torno-subito: "Tato Giovannoni brings the Georgetown outpost of Florería Atlántico to Torno Subito Miami at The Moore for a five-night residency, kicking off a new international collaboration series in the Design District."
- floreria-atlantico-dc: "Giovannoni will take over the bar for the full five nights with Florería Atlántico D.C."
- floreria-atlantico (Buenos Aires): "Hidden beneath a flower shop on Arroyo Street in Buenos Aires, Florería Atlántico opened in 2013 as Giovannoni's tribute to the immigrant communities that shaped Argentina."
- floreria-atlantico-barcelona: the word Barcelona does not appear in the article, so no pair, and the rebuild produced none.

## The regeneration, full diff

scripts/build-article-mentions.mjs against the current WordPress posts: 380 bars, 182 articles, 1024 links (was 1021), 26 held.
- Pairs added (3): torno-subito, floreria-atlantico-dc, floreria-atlantico, each to tato-giovannoni-floreria-atlantico-torno-subito-miami.
- Pairs removed: 0.
- Held list: one change only, behind-bar (Buenos Aires, the generic name "Behind") gained this article as a candidate because the article's text contains the word; it stays held and unlinked, as the generic-name rule requires. Nothing else moved. No other additions to hold for Roman.

## Live checks (after the deploy; the mentions JSON is a build-time import)

torno-subito: block present, one article card, linking to the article (its only mention). floreria-atlantico-dc: block present, the article card present. floreria-atlantico (Buenos Aires): block present with four article cards, the new one among them. floreria-atlantico-barcelona: no mentions block and no link to the article.

## Sitemap and indexing queue

torno-subito is in sitemap-bars.xml (fresh render) and in claude/indexing-queue.json as pending (task 27 item).
