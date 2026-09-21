# Three page levels per city. This replaces Part 2 of task 50

Read the report for task 50 first. Its Blocker 2 is correct and this task answers it. Part 1 of task 50, the `editorial_sources` column and backfill, is unchanged and still needed.

Roman's structure, in his words: "we can actually have 10 best bars in New York or top 10 bars in New York on one list. Then we can have a 32 best bars in New York and then just bars in New York."

So nothing falls off a page. Each bar moves down a level instead.

## Level 1: the curated ten

The editorial article, `/top-10-bars-in-new-york-2026`, plus the ten `tier = 'top10'` rows in the directory. Exists for the 23 Type A cities. Not changed by this task.

## Level 2: `/best-bars/<city>`, the qualified list

Title carries the real number: "The 32 Best Bars in New York (2026)", "The 5 Best Bars in Bratislava (2026)". This page, not the Top 10, targets the head term. That also settles the cannibalisation worry in task 50: the article owns "top 10 bars in new york", this page owns "best bars in new york", and they link to each other.

A bar qualifies by one of these, and this is also the rank order:

1. A renderable accolade.
2. Our own curated ten, or a BarMagazine article, or a paid tier.
3. A selective editorial list: Falstaff, Michelin, a named "Top N" from a real outlet.
4. Nothing else. A tourism board page, a festival participant roster or a broad city map does not qualify a bar, because in a city we filled from local press that is the admission floor for every bar in it, which is the point the task 50 report makes.

The curated ten always sit at the top of this page, in their article order, each marked as a Top 10 pick and linked to the article. The rest follow in the rank order above, then photo, then name. No cap: the number in the title is the length of the list. If fewer than five qualify, fill to five from the current `sortSeoBars` and leave the number out of the title.

## Where a paying bar sits, which Roman settled explicitly

A paid tier never puts a bar in the curated ten. Level 1 is editorial and cannot be bought, so `tier = 'featured'` or `'premium'` is not a route into it and no upgrade ever adds a bar to a Top 10 article.

A paying bar does belong on Level 2, its city's best-bars list. It is rank reason 2 above, alongside our own article and our curated ten.

Inside Level 2 it ranks on merit, not on payment: a paying bar with no accolade sits below the accolade holders. The Featured package sells "priority placement in a directory", and the directory is Level 3 and `/bars`, where priority placement already works and stays exactly as it is. An editorial best-of list that can be bought into the top spot is worth nothing to the bar that buys it, so the placement benefit is not extended to Level 2 ordering.

Today this changes nothing in practice: the only two paying bars are `the-loft` in Santiago and `dangerous-water-palma-de-mallorca`, and neither city has a curated ten. Write the rule anyway, because the first paying bar in New York or London is the one that will test it.

## Level 3: `/bars/city/<city>`, every bar

Unchanged. "Bars in New York", all 54. Both levels above link down to it.

## The override, which is the part that actually settles Bratislava

The task 50 report is right that no rule built on sources drops Baudelaire Bar, because Refresher.sk ranked it fifth in Bratislava and that is a real selection. Roman disagrees with that outlet. That judgement has to be storable.

Add `editorial_pick` to `bars`, a small integer, default null. Positive pins a bar to the top of its Level 2 list in that order. `-1` drops it off Level 2 entirely, keeping it on Level 3. Null means the rank order above decides. Nothing else reads this field, and it never touches accolades or tier.

Then set Baudelaire Bar to `-1`, with the reason in `admin_notes`: Roman's call, listed by Refresher.sk but not a best-of-city bar. Nothing else gets an override until Roman says so.

## Guards

Standing layout rule: the "Top 10 pick" marker and the numbered title are the only new elements. Nothing else moves at 390px or 1440px. `MIN_CITY_BARS` and the noindex rules are unchanged. `editorial_pick` is never rendered, never scored as an accolade.

## Report

Level 2 before and after, as a list of names in order with each bar's qualifying reason, for New York, London, Bratislava, Warsaw, Prague and Budapest. The report on task 50 said Bratislava lands on twelve under the old rule; say what it lands on under this one.

Then the count of Level 2 pages that still fall back to `sortSeoBars` because fewer than five qualify, and which cities those are. Those go to the front of the coverage programme.
