# A city's type page is bigger than the city page, which cannot be right

Roman found it on Amsterdam. `/best-bars/amsterdam` is "The 5 Best Bars in Amsterdam". `/best-bars/amsterdam/cocktail-bars` is "The 12 Best Cocktail Bars in Amsterdam", and its twelve contain all five. A subset page listing more than its parent is incoherent to a reader and self-competing in search.

Three separate defects, verified on the live site.

## 1. Type pages never got the task 53 rule

`src/app/best-bars/[city]/[type]/page.tsx` still runs the old `sortSeoBars` and `CITY_PAGE_MAX_BARS` with no qualification test, so it lists twelve where the city page lists five.

Apply the same qualification the city page now uses. Qualification is a property of the bar, not of the page, so the qualified bars of one type are always a subset of the city's qualified bars and the counts can never invert again. Same ordering, same "Also in" section below for the rest of that type.

## 2. A fallback city still shows a number in its H1

Amsterdam has one bar that qualifies, Super Lyan, so the page correctly fell back and filled to five from the old sort. The `<title>` correctly reads "The Best Bars in Amsterdam (2026)" with no number, exactly as task 53 specified. But the H1 reads "The 5 Best Bars in Amsterdam".

The rule was that a fallback page carries no number. Apply it to the H1 and to any intro copy that states a count, not only to the title. London and Bratislava are correct today and must stay correct.

## 3. In a single-type city the type page is a duplicate of the city page

All 14 active Amsterdam bars are `Cocktail Bar`. Once fix 1 lands, `/best-bars/amsterdam/cocktail-bars` will list exactly the same bars as `/best-bars/amsterdam`, under an almost identical heading. Two URLs, one set of bars, competing with each other for neighbouring queries.

When a type page's bars are the same set as the city page's, do not publish it as a second best-of page. Keep the URL alive, point its canonical at the city page, and drop it from the sitemap. That removes the self-competition without breaking any link that already exists.

Roman's alternative, which he raised and which you should cost out in the report rather than build: keep the page and retitle it "Cocktail Bars in Amsterdam", a plain listing rather than a selection. It reads honestly, but it is still the same bars on a second URL, so say in the report which you would ship and why.

## Guards

Standing layout rule. Ordering, counts, headings and canonical tags only. No spacing, no card changes, no new components beyond the "Also in" list the city page already has. `MIN_TYPE_BARS` and the noindex rules are unchanged.

## Report

For Amsterdam, London, New York and Bratislava: the city page and each of its type pages, with the title, the H1 and the bar count for each, before and after. Prove that no type page lists more bars than its city page anywhere in the directory.

Then the number that says how big this is: how many city and type page pairs currently list the same set of bars.
