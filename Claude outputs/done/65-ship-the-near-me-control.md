# Task 63 is back on. Ship the near-me control you already built

Roman cancelled task 63 mid-build and has now changed his mind, having seen what you were making: "maybe the near me button should be made, not the way it is on the home page, but the way Code planned it."

So the filter-row toggle is the design he wants, not the wide `NearMeBar` strip. That is what you built.

## What to do

The work is in `stash@{0}`, labelled `task63-near-me-control (cancelled mid-build, patch also in scratchpad)`. Restore it, re-verify against the current `main` since task 64's hero changes have landed in `globals.css` in the meantime and the two touch the same page, then commit and push.

Everything in the original task 63 still stands: the control lives in the directory's filter row beside Grid and Map, shows its state, turns off in one click, follows the mode rather than holding its own state, clears when a city or country filter is applied, and requests geolocation on click and never on page load. `NearMeBar` and `showsNearMeBar` stay untouched, so the homepage and the city and country pages keep the strip they have.

## Two things from your own report to fold in

**The em dash in the near-me banner.** It reads "Sorted by distance — bars within ~50 miles first." Task 63 told you to leave the banner alone, so you correctly did not. Now that the control ships alongside it, fix it. One character, and it breaks the site-wide no-em-dash rule.

**The 80 km guard being true of the control but not of the page.** You flagged that removing the older effect would change distance sorting for every visitor, which is more than this asks for. Leave it. If Roman wants the guard true of the whole page it gets its own task, and say so again in the report so it does not get lost a second time.

## Guards

Standing layout rule. One control in the filter row and one character in the banner. The filter row must not wrap onto a second line at 390px, and nothing else on the page moves at 390px or 1440px. Verify in the browser before running a production build, not after, and do not run `next build` against the same `.next` directory the dev server is using.

## Report

Screenshots at 390px and 1440px of the filter row with the control off and on, the page in near-me mode, and the case where the nearest bar is beyond 80 km. Confirm applying a city filter clears both the mode and the control, and confirm task 64's hero is unaffected.

## Added after Roman saw what MODE D actually does

He asked whether near-me shows the closest bar first. It does not, and he does not accept the current behaviour: "if somebody is looking for the best bars near them, they don't want to drive 50 miles to get to the bar."

He is right. `NEAR_RADIUS_KM` is 80, and inside that one band the sort is tier, then photo, then distance. So from Carlsbad a bar 35 miles away outranks one two miles away on tier alone. That is not near me in any useful sense.

### Replace the single radius with bands

Roughly: under 5 km, 5 to 15 km, 15 to 40 km, then everything beyond by pure distance as today. Inside each band keep the existing order, tier then photo then distance then name. Between bands, closer always wins.

The principle: quality competes only between bars that are realistically equally reachable. A great bar in the next town never outranks a decent one the visitor can walk to. Pick the exact boundaries yourself if the data argues for different ones, and say in the report why.

This is the "80 km guard true of the control but not of the page" point from your own task 63 report. It is now in scope, and it changes distance sorting for every near-me visitor deliberately.

### Distance on the card

In near-me mode only, show the distance on each bar card, "2.1 km" or "1.3 mi" by the visitor's locale. Then the ordering does not have to carry the information on its own.

Cards outside near-me mode are unchanged. This must not alter card height or layout at 390px or 1440px.

### Banner wording

With bands in place, "Sorted by distance" is closer to true but still not exact. Reword it to describe the real behaviour in plain language, no em dash.

### Report, additionally

The first twenty results for a visitor in Carlsbad, before and after, with each bar's distance and band, so Roman can see that nothing far away leads any more.
