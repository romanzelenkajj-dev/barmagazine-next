# Half the type filters return three bars or fewer

Roman filtered the directory to "Omakase Cocktail Bar" and got one card. A filter that lands a visitor on a single result is worse than not offering it, and it makes a directory of 1,469 bars look thin.

Counts across active bars, type and subtypes together, 16 in all:

Cocktail Bar 1443, Hotel Bar 174, Speakeasy 128, Restaurant Bar 49, Rooftop Bar 48, Tiki Bar 21, Wine Bar 12, Pub 8, **Whiskey Bar 3, Japanese-Influenced Bar 2, Distillery Bar 2, Beer Bar 1, Hidden Bar 1, Omakase Cocktail Bar 1, Music Bar 1, Gin Bar 1**.

Two different problems are mixed in there.

## 1. Synonyms that should never have been separate

- **Hidden Bar** is Speakeasy. Merge into Speakeasy, which has 128.
- **Beer Bar** is Pub. Merge into Pub.
- **Omakase Cocktail Bar** and **Japanese-Influenced Bar** are the same idea split in two. Merge into one subtype and pick the name that a reader would search, then say which you chose and why.

Merging raises real counts rather than hiding a category. Do this first, then recount.

## 2. Rare but legitimate

Whiskey Bar, Gin Bar, Music Bar and whatever survives the merge are real kinds of bar, we just hold very few. Do not delete them from the bars.

**Hide a chip from the directory type filter when fewer than six active bars carry it**, matching `MIN_REGION_BARS`. The subtype stays on the bar row and stays visible on its profile, because Hanashi genuinely is an omakase bar and that is worth saying on its page. It simply is not worth a filter. A category reappears on its own as it reaches six, so nothing needs maintaining.

## 3. One to check, not to merge

**Distillery Bar, 2 bars.** The standing admission rule is that distillery taprooms which are not cocktail bars are not admitted. Check both rows against it and report what they are. Do not remove anything without telling Roman first.

## Guards

Standing layout rule: the chip row loses entries, nothing else moves at 390px or 1440px. `MIN_TYPE_BARS` and the type page rules are unchanged, so a type page that already exists keeps existing. Subtype merges are data edits on the bars, recorded in `admin_notes` with the reason.

## Report

The counts before and after the merges, which chips are now hidden and which survive, what the two Distillery Bar rows actually are, and a screenshot of the filter row at both widths.
