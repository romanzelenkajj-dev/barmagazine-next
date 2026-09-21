# Near-me distances use browser language, which is not where the visitor is

Roman: "the bars near me are showing distance in miles, which is okay for the US. But for the rest of the world, where they use kilometers, it should be kilometers."

`formatDistance` in `src/components/BarDirectoryMap.tsx` around line 68 already switches units, so the intent is right. The signal is wrong:

```
const loc = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
const region = (loc.split('-')[1] || '').toUpperCase();
const imperial = region === 'US' || region === 'GB' || region === 'LR' || region === 'MM';
```

Three failures, all live:

A browser reporting plain `en`, `de` or `sk` with no region subtag yields an empty region, so `imperial` is false and it happens to give km. Fine by accident, not by design.

The fallback is `'en-US'`, so anything without `navigator` resolves to miles. The default should be kilometres, which is what most of the world uses.

And most importantly, `navigator.language` is a language preference, not a location. A Slovak bartender with their browser in US English, which is very common, gets miles while standing in Bratislava. That is the case Roman is describing.

## The fix

The component already receives `geoCountryCode`, the visitor's country from their IP, and the whole near-me feature sorts on it. Use that.

Order of preference: `geoCountryCode` when present, then the region subtag of `navigator.language` if there is one, then kilometres.

Keep the imperial set as it is: US, GB, LR, MM. Those are the places that use miles for road distance, and GB genuinely does.

`formatDistance` takes a `locale` parameter today. Change its signature to take the country code instead, or add one, and pass `geoCountryCode` at every call site. Do not leave a call site relying on the old default.

## While you are there

Check whether anything else on the site infers a unit, a currency or a format from `navigator.language` rather than from the geo country. The currency cookie on `/feature-your-bar` is the obvious neighbour. Report what you find, change nothing outside this task.

## Guards

Standing layout rule: the unit string on the card only. Nothing moves at 390px or 1440px. The near-me ordering, the distance bands and the 80 km radius are all unchanged, this is display only.

**Do not merge to main.** Preview branch, URL in the report, Roman looks first. See the standing rule in SETUP.md. This task does not carry his approval for anything, ask him in your own chat.

## Report

The distance as it renders for a visitor in the US, the UK, Slovakia and Japan, and for a browser with no region subtag. Then what else on the site reads `navigator.language`.

## Also: cut the near-me banner sentence

It currently reads:

> Closest first. Bars a similar distance away are ranked by quality, so nothing far off leads.

Roman: "this sentence doesn't look good there, and I don't think it's necessary."

He is right on both counts. It explains the ranking logic to someone who did not ask, and once every card carries its own distance it tells the reader nothing they cannot already see. I asked for a reworded banner in task 65 and the wording is accurate, but the banner itself has stopped earning its place.

Remove the sentence.

**Keep one thing:** the line for when the nearest bar is beyond the radius, something like "the nearest bars we list are 340 km away". That is the one fact the cards cannot convey on their own, because a card showing 340 km does not tell the visitor that this is the best we have rather than an ordering mistake. Show it only in that case, and say nothing at all when there are bars genuinely nearby.

The near-me control itself already shows that the mode is on and gives a way out, so nothing is lost by the banner going quiet.
