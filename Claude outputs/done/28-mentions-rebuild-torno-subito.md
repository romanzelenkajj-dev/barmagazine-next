# Rebuild article mentions now for the Torno Subito article

Article live: https://barmagazine.com/tato-giovannoni-floreria-atlantico-torno-subito-miami (WP slug tato-giovannoni-floreria-atlantico-torno-subito-miami). Run scripts/build-article-mentions.mjs against the current WordPress posts and confirm these pairs are produced (same-sentence/title rule for the multi-row name Florería Atlántico: the article names "Florería Atlántico D.C." and "Florería Atlántico" Buenos Aires explicitly, and does NOT mention Barcelona):
- torno-subito -> tato-giovannoni-floreria-atlantico-torno-subito-miami
- floreria-atlantico-dc -> same
- floreria-atlantico -> same
- NOT floreria-atlantico-barcelona
Add the three pairs to claude/article-mentions-confirmed.txt with the quoted sentence. Report the full diff of the regeneration (pairs added and removed, expect 0 removed) and hold any other additions for Roman if they involve generic names. Revalidate the three profiles and confirm the block renders live on each. Also confirm the new torno-subito profile is in the sitemap and in the indexing queue.
