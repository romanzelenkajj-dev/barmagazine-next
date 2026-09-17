# Report: 52-featured-badge-is-for-paying-bars-only (2026-09-17)

Fixed and live. Commit `97de24b`. No bar row was edited.

**Confirmed by query after deploy: exactly two active bars render Featured,
and zero render Premium.** Dangerous Water in Palma de Mallorca and The Loft
in Santiago, which are the two on the paid tier.

## The sixth site

The task named five. There was a sixth carrying the same line:
`src/app/bars/country/[country]/page.tsx:113`. Found by grepping for the
pattern rather than working the list, and it would have kept the badge on the
country pages.

| File | Was | Now |
|---|---|---|
| `components/DirectoryBarCard.tsx` | `tier === 'featured' \|\| !!wp_article_slug` | `tier === 'featured'` |
| `components/BarDirectoryMap.tsx` | same | `tier === 'featured'` |
| `app/bars/country/[country]/CountryBarGridClient.tsx` | same | `tier === 'featured'` |
| `app/bars/country/[country]/page.tsx` | same, **not in the task's list** | `tier === 'featured'` |
| `app/bars/city/[city]/page.tsx` | same, inside `tierRank` | split, see below |
| `app/bars/[slug]/page.tsx` | `(isFeatured \|\| isPremium \|\| wp_article_slug)` | `(isFeatured \|\| isPremium)` |

One extra change on the profile: the badge ROW's own condition still listed
`wp_article_slug`, so a bar with an article and no type would have rendered an
empty badge row. Removed.

## The ordering, which mattered more than the badge

**The city page** put featured in its top bucket, and featured meant "or has
an article", so fifteen bars that pay nothing shared the top slot two bars
bought. Now: paid, then top10, then article, then the rest, photos ahead of no
photos inside each bucket as before. The `?view=top10` branch keeps editorial
first, then paid, then article.

**The map had it backwards outright.** `if (b.wp_article_slug) return 0` put
every article bar ABOVE `top10`, `featured` and `premium`, which all shared
rank 1. An article we wrote for free beat the tier two bars pay for. Now paid
0, top10 1, article 2, rest 3.

That fix also exposed a second bug in the same function: the free fallthrough
also returned 2, so once article moved to 2 the two buckets collided. Free is
now 3.

### Where a paying bar sits, after

| Page | Position |
|---|---|
| `/bars/city/santiago` | **The Loft, 1st** of 2 |
| `/bars/city/palma-de-mallorca` | **Dangerous Water, 1st** |

Before the change both were also first, but for the wrong reason: they shared
the top bucket with every article bar, and on the map they were outranked by
them. The position is only stable now.

## Badge counts, before and after, on the live site

| Page | Before | After |
|---|---|---|
| `/bars/scarfes-bar` | 1 Featured badge | **0** |
| `/bars/himkok` | 1 | **0** |
| `/bars/city/london` | 1 Featured pill | **0** |
| `/bars/city/paris` | 1 | **0** |
| `/bars/dangerous-water-palma-de-mallorca` | 1 | **1** |
| `/bars/the-loft` | 1 | **1** |

The twelve active bars that were badged for free: 1986 Steak House, Wing Lei
Bar, The St Regis Bar Jakarta, Les Ambassadeurs, Scarfes Bar, Jin Bo Law, Bar
Sathorn, Kink Bar, Flipdog, Horatio, Pop City x Pony, Himkok. Les Ambassadeurs
and Scarfes Bar are the two top10 bars that were showing both badges.

Nothing else moved. The change removes an element and re-sorts; no spacing,
card height or breakpoint was touched, and the map popup and upgrade link
already tested the tier alone and are untouched.

## The question for you, not changed

`src/app/bars/[slug]/page.tsx:157` reads
`const isPaid = isPremium || isFeatured || isTop10;`. On that page `isPaid`
controls four things:

1. **The full drinks menu** (`hasFullMenu`, line 160), the `menu_sections`
   block that is the main thing the Featured page sells.
2. **The menu in the page's JSON-LD** (line 234), so it can appear in search.
3. **Whether menu highlights render** (line 254).
4. **The Signature Serves block** (line 500).
5. And inversely, **the upgrade CTA banner is hidden** (line 677), so a top10
   bar is never shown an advert to upgrade.

So our 231 editorial top10 bars currently get the full Featured page
treatment, and are not asked to pay. That looks deliberate to me: a Top 10
pick should look good, and pitching an upgrade to a bar we have just named one
of the world's best would read badly. But it does mean the single biggest
thing the subscription buys is already given to 231 bars. Your call, and I
have not touched it.
