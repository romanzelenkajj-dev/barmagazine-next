# Near-me sorts 272 bars and calls it the directory

Roman, on a VPN in Bratislava: *"I get the first bar, Antique American Bar, and then I'm
getting bars in Prague, Italy, Italy, Italy... But there is no Mirror Bar, which is
definitely in 50 Best and it's in Bratislava."*

He is right, and the cause is not the distance sort. **Verify this before you fix it**, but
here is what I found.

## The diagnosis

`src/app/bars/page.tsx:47-63` builds `initialBars` from three queries:

```
getBars({ perPage: 200, tier: 'top10' })
getBars({ perPage: 48,  tier: 'featured' })
getBars({ perPage: 24,  tier: 'free', hasPhoto: true })
```

That is about **272 bars out of 1,540**, chosen globally, with no reference to where the
visitor is. `MODE D` in `BarDirectoryMap.tsx:837` then sorts **that array, in the browser**.

So near-me returns the nearest bars *among a global sample of 272*, not the nearest bars in
the directory. From Bratislava that is Antique American Bar, then Prague, then Italy, which
is exactly what he saw.

**Mirror Bar is not in the payload at all.** It is `tier: free` with 1 photo, so it competes
for one of **24** free-with-photo slots worldwide, and roughly 200 bars qualify. It lost the
lottery. It holds 3 accolades and sits about 500 m from where he was.

Every Bratislava bar is `tier: free`. Three have a photo: Mirror Bar, Antique American Bar,
Old Fashioned Bar. Only Antique American made the 24.

## What the fix is not

**Do not raise the 24.** It makes the symptom rarer and leaves the bug: a global sample
sorted by distance is still arbitrary. Near-me has to see every bar with coordinates, or it
is guessing.

## What to weigh

`/api/bars/map` already returns **every active bar with coordinates**, paged past the
1,000-row cap, with `tier`, `photos`, `subtypes` and `accolades` in the select, cached 10
minutes at the edge. `openMapView()` already fetches and geo-sorts it. Near-me wanting the
same data as the map is not a coincidence, and reusing it beats a second endpoint.

Check before committing to it: the `MapBar` type does not declare `accolades` even though
the query selects it, and the shape has no `description` or `short_excerpt`. Work out what
`DirectoryBarCard` actually renders and whether a card built from this payload is the same
card. If it is thinner, say so and propose how to close the gap rather than shipping two
card qualities on one page.

The alternative is a server-side proximity query, which is more work and more correct in
the long run. Your call which, with the reason.

## The wider version of the same bug

Near-me is where it is visible, but **any** proximity sort over `initialBars` has it. `MODE
B` (geo active, no filter, `BarDirectoryMap.tsx:902`) sorts the same 272. A visitor in
Bratislava who never presses the button gets a proximity-flavoured order built from a global
sample too. Report whether MODE B needs the same treatment; do not silently change it.

## While you are in there: remove the near-me sentence

`BarDirectoryMap.tsx:1197`:

> Closest first. Bars a similar distance away are ranked by quality, so nothing far off
> leads, and turning on location makes the distances exact.

Roman asked for this to go when it shipped in `83417ad` and it was never removed. That is my
miss, not yours. Delete the sentence.

Keep the strip itself if it carries the bar count and the place ("N bars, sorted by
proximity to Bratislava"), which is the part that tells him the button worked. If the count
line lives elsewhere and `.dir-near-note` holds nothing but the deleted sentence, remove the
element and the rule with it. No other copy on that page changes.

## Constraints

- Standing layout rule. Verify at 390px and 1440px, before and after.
- Test the actual case: Bratislava coordinates, near-me on, and Mirror Bar in the first few
  cards ahead of anything in Prague or Italy. A screenshot of that list is the proof.
- Check a second city with the same shape, where the nearby bars are free-tier and mostly
  photo-less, so the fix is not tuned to one place.
- Watch the payload size. The map endpoint is lightweight but it is 1,540 rows; if near-me
  now fetches it on a phone, say what that costs and when it fires.
- Preview branch. Nothing to `main` without Roman's word.

## Report

The confirmed cause, which approach you took and why, the before-and-after list for
Bratislava with Mirror Bar's position in both, what you found about MODE B, and the payload
cost.
