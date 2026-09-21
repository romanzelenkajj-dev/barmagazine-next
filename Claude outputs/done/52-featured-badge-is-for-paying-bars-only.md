# The Featured badge is showing on 15 bars that do not pay for it

Roman: the Featured badge belongs to bars on the paid subscription, and right now that is two bars and no others.

The data is already right. Across 1,565 rows the tiers are 1,332 free, 231 top10, and exactly two featured: `the-loft` in Santiago and `dangerous-water-palma-de-mallorca`. There are no premium rows at all.

The code is what is wrong. Five places compute the badge as tier OR article:

- `src/components/DirectoryBarCard.tsx:36` — `const isFeatured = bar.tier === 'featured' || !!bar.wp_article_slug;`
- `src/components/BarDirectoryMap.tsx:1097` — same line
- `src/app/bars/country/[country]/CountryBarGridClient.tsx:21` — same line
- `src/app/bars/city/[city]/page.tsx:157` — same line
- `src/app/bars/[slug]/page.tsx:319` — `{(isFeatured || isPremium || bar.wp_article_slug) && <span className="bar-v2-badge bar-v2-badge--featured">…`

So every bar we have written an article about wears a Featured badge. That is 17 bars with articles, 15 of which do not pay, 12 of them active: 1986 Steak House, The Grey Room, Wing Lei Bar, The St Regis Bar Jakarta, Les Ambassadeurs, Scarfes Bar, Jin Bo Law, Bar Sathorn, Kink Bar, Flipdog, Horatio, Pop City x Pony, Victor Audio Bar, Himkok, The Honey Moon.

Two of those are top10-tier bars, so they are showing Top 10 and Featured side by side, which reads as though our editorial picks are advertising.

## The fix

`isFeatured` means `bar.tier === 'featured'`. Nothing else, in all five places. `isPremium` stays `bar.tier === 'premium'`.

Having an article stays an ordering signal, because it is a real editorial signal and the directory should keep surfacing those bars. Rename that use to `hasArticle` so the two ideas stop sharing a name, which is how this happened.

But the ordering is not simply preserved, because the same conflation has been giving away the benefit we sell. Roman, confirming the rule: paying bars "are at the top of the regular bar list, not top of the bars that have accolades." Two places rank them wrongly today.

`src/app/bars/city/[city]/page.tsx:155` puts `isFeatured` in the top bucket of the default view, and `isFeatured` includes every bar with an article, so 15 bars that pay nothing currently share the top slot the two paying bars bought. Split it: paid first, then top10, then article, then the rest, photos ahead of no photos inside each bucket as now. The `?view=top10` branch keeps editorial first, so there top10 leads, then paid, then article.

`src/components/BarDirectoryMap.tsx:748` has it backwards outright: `if (b.wp_article_slug) return 0;` ranks article bars above `top10`, `featured` and `premium`, which all share rank 1. Make it paid 0, top10 1, article 2, rest 3, and leave the modes that consume `tierRank` otherwise untouched.

This is the whole point of the paid tier, so say in the report exactly where a paying bar sits on each page before and after.

After the change exactly two bars in the whole directory show Featured, and none show Premium.

The map popup at `BarDirectoryMap.tsx:348` and the upgrade link at `:363` already test the tier alone. Leave them.

## One thing to ask Roman, not to change

`src/app/bars/[slug]/page.tsx:156` reads `const isPaid = isPremium || isFeatured || isTop10;`. That gives our 231 editorial top10 bars whatever `isPaid` unlocks on a profile. It may well be deliberate, since a Top 10 pick should look good. Report what `isPaid` actually controls on that page and let Roman decide. Do not change it in this task.

## Guards

Standing layout rule: the badge disappears on those bars, nothing else moves. No spacing, no card height, no breakpoint changes. Do not edit any bar row: the tiers in the database are correct and this is a rendering bug.

## Report

The five diffs, then `/bars` and `/bars/city/london` and `/bars/city/paris` at 390px and 1440px before and after, plus the profile pages for Scarfes Bar and Himkok. Confirm by query that exactly two active bars render Featured and zero render Premium.
