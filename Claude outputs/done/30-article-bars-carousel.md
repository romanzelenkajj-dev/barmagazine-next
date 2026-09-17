# Article pages: "Bars in this article" as the card carousel (Roman: yes)

Today the block at the end of each article is an outlined box with a plain list (name, city). Replace it with the same component as the profile page's article-mentions carousel (task 22), using the directory card (task 21: photo or placeholder, pills on the photo, name, location line) for each bar.

- Heading "Bars in this article" stays; same heading style as the profile blocks; hairline above the block as now.
- Cards: the directory card exactly (photo 16:10 or the dark placeholder, TOP 10 / 50 Best / Featured pills, name, "City, Country" location line as on /bars). Whole card links to the profile with the same href as today's list items (the internal-link check must show identical hrefs before and after).
- Layout: the task-22 carousel: 3 visible on desktop with arrows when more than 3, 2 on tablets, 1 at ~85% width on phones with the next card peeking; scroll-snap; static row when 3 or fewer; server-rendered cards, arrows the only client bit.
- Keep the inline links in the article body untouched.
- Bar order: as generated now (alphabetical), unchanged.
- Render nothing when an article has no bar mentions.

Standing layout rule: 390 and 1440 before/after on the Negroni Week 2026 APAC article (5 bars), the Torno Subito article (3), an article with 1, and one with 8+; only this block changes. Deploy and report with a 390 screenshot of the Negroni Week block and a 1440 screenshot showing the arrows.
