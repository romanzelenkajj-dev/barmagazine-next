# Report: 31-article-meta-description-more (2026-09-16, 15:15 to 15:34 PT)

Done and deployed: commit 86da0c0 (changelog d773792), live 60 s after the push.

## Cause

WordPress renders an auto-excerpt as a paragraph ending in a read-more link (`<a class="g1-link g1-link-more" href="...">More</a>`). stripHtml keeps the link text, so the description, the Open Graph and Twitter descriptions (both take `description` in generateMetadata) and the article JSON-LD all ended "September 22-26, 2026. More" for the Torno Subito article. The excerpt Roman sees in WordPress is the same text without the link.

## Fix

- src/lib/read-more.ts, `stripReadMore(text)`: removes, at the end of the string only and case-insensitively, "More", "Read more" or "Continue reading" together with the ellipsis or "[...]" before it and the whitespace around it. A sentence that merely ends with the word ("we wanted to see more of it.") is left alone. Pure, so client components use it too.
- src/lib/wordpress.ts, `postDescription(post, maxLen = 160)`: the WP REST posts endpoint exposes All in One SEO's per-post fields as `aioseo_meta_data` (title, description, keywords); there is no Yoast field (yoast_head_json is null). The helper prefers that description when the post has one, else the excerpt with the marker removed, then truncates at a word. WPPost gains the optional `aioseo_meta_data` field.
- src/app/[slug]/page.tsx uses postDescription for the meta description (and through it Open Graph and Twitter) and for the JSON-LD description; the two hand-built truncateAtWord(stripHtml(...)) calls are gone.
- The same marker showed on the article cards, so ArticleCard, HomeCategoryGrid and LoadMoreGrid strip it from their excerpts as well (the two grids keep their own local strip and truncate helpers and import only the pure stripper).
- Tests: 8 new cases in src/lib/wordpress.test.ts (the marker with a sentence, with an ellipsis, with the bracket, each phrase, any case, end only, the real excerpt shape through stripHtml, and postDescription's preference, fallback and truncation). Suite 323/323.

## Live (filled in after the deploy)

The article route is cached six hours, but a deploy starts a fresh ISR cache, so the pages were re-rendered on first request after the build. Checked live, meta description and og:description identical on each, the NewsArticle JSON-LD description the same text:
- Torno Subito article: "Tato Giovannoni and Florería Atlántico Georgetown take over Torno Subito at The Moore in Miami for a five-night residency, September 22-26, 2026." (ends at "2026.", the SEO plugin's own description).
- Negroni Week 2026 APAC: "Negroni Week 2026 sends Monica Berg, Giorgio Bargiani, Erik Lorincz and Iain McPherson across Asia Pacific for 20 guest shifts from September 21 to 27."
- Top 10 Bars in Dubai 2025: "Discover the top 10 bars in Dubai for 2025, featuring exceptional cocktails, world-class design, and the city's most influential drinking destinations."
- Eco Totes: "Eco Totes, the green innovation in spirits distribution that's saving thousands of bottles and paving the way for sustainable mixology on a global scale."
None ends in "More".
