# The award hub pages look like a database dump. Make them look like the site.

Roman found `/awards/bartenders-choice` on Google, which is the good news: the hub pages
index and rank. Then he looked at it: *"don't like how this page looks... it doesn't look
good."* He is right, and the reason is in the code.

## What is wrong, specifically

`src/app/awards/[program]/page.tsx` renders every honoured bar as a text-only tile: name and
city, nothing else, 260px wide, in `.awards-bar-list`. Each category gets its own `<h3>`
("Winner: Best Cocktail Bar (Croatia)") and, on Bartenders' Choice, each category holds
**one** bar. So the page is twenty headings, each over a single small card, marching down
the left third of a 1,000px column with two thirds empty. The hero card is fine. Everything
under it reads as a query result, not a page.

The cause is upstream of the markup. `getProgramYears()` in `src/lib/award-hubs.ts` selects
`name, slug, city, country, state, accolades` and nothing else, so the page **cannot** show
a photo, a placeholder, a tier chip or a type, even though `DirectoryBarCard` renders all of
those for the same bars on every city guide.

The header comment says these are "reference pages for journalists." They are also now
landing pages from Google, and a journalist landing from Google deserves the same card the
rest of the site uses.

## What to build

**1. Use the directory card.** Extend the select in `getProgramYears()` to include what
`DirectoryCardBar` needs: `photos`, `tier`, `type`, `status`, and whatever else its
interface lists. Render each honoured bar with `DirectoryBarCard`, in the same grid the city
guides use, so the hub inherits the photo, the `BarPlaceholder` for bars without one, and
`CardStatusPills`. Do not build a new card.

**2. Put the category on the card, not over it.** The `<h3>` per section is what creates
the orphan rows. Keep the year as the `<h2>` and flow every bar in that year into one grid.
Carry the category ("Winner: Best Cocktail Bar (Croatia)") as a small kicker line on or
directly above the card, in the card's own cell, so it travels with the bar. On World's 50
Best, where one year has forty bars in one list, that kicker will be the rank or the list
name; check it reads well there too, since the same template serves all four programs.

If you think a category heading should survive where a section is large (a 50 Best list of
forty), say so and show it; the brief is "no heading over a lone card", not "no headings."

**3. Order within a year.** Winners before nominees before longlists, then rank where the
program has one, then name. The current order looks alphabetical by category, which is why
Croatia comes first.

**4. Sanity on the hero.** It is the `best-bars-hero` and it is fine. Leave it, except
check the integrity line still sits well once there is something visually heavier beneath it.

## Constraints

- Standing layout rule: change only `/awards/[program]`, its query and its CSS. No new
  breakpoints. 390px and 1440px before-and-after screenshots.
- The four hubs must all be checked, not just Bartenders' Choice: `worlds-50-best`,
  `spirited-awards`, `bartenders-choice`, `james-beard`. The template has to hold from 20
  lone winners to 40-bar ranked lists.
- Nothing in the metadata, the JSON-LD or the integrity copy changes. This page is ranking;
  do not touch what it ranks on.
- No em dashes in any copy you add.
- Preview branch. Roman looks before it ships.

## Report

Before/after at both widths for Bartenders' Choice and for World's 50 Best, the list of
fields added to the select, and anything you chose differently from this brief and why.
