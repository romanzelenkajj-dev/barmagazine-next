# Style the "<Bar> in BarMagazine" article-mentions block on profiles

Roman's screenshot (desktop, Little Rituals, Phoenix): the article-mentions block renders as a bare heading plus a plain bulleted list of links. It looks unstyled next to the Plan Your Visit card and the Get Featured banner.

Keep the block and its links exactly as generated (same allowlist and same-sentence rules, no change to which articles appear). Change only presentation:
1. Wrap it in the same white rounded card used for the profile info card. Heading: "<Bar name> in BarMagazine" in the card heading style.
2. Each article as a row: cover image thumbnail (small, rounded, lazy-loaded, from the article's existing featured image), title, and publish date in the muted meta style. Whole row is the link. No bullet markers.
3. Render nothing at all (no heading, no empty card) when a bar has no confirmed mentions.
4. Mobile: rows stack, thumbnail stays on the left at a fixed small width, title wraps.
5. Confirm the links keep their current href and anchor text so the internal-link graph is unchanged, and that the block still renders server-side (it must be in the HTML for crawlers, not client-only).

Test on Little Rituals (2 mentions), a bar with 1 mention, a bar with 4+ mentions, and a bar with none, at 390px and desktop. Deploy and report the commit with screenshots.
