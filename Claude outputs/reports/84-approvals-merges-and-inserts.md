# Your approvals of 19 September: what is done, and what is blocked

## Done and live

**PR #67, continent pages: merged** (`4279c61`). **PR #68, directory titles: merged**
(`d5e2dcf`). Both already serving on production, verified by fetching them:

- `/best-bars/continent/europe/hotel-bars` returns `Best Hotel Bars in Europe (2026)`
- `/bars/city/bangkok` returns `Bangkok Bar Directory`

All **10 continent pages are in the sitemap** with no sitemap change needed, because it
iterates `getRegionCombos()` through `regionHref()`. That was the payoff for extending the
existing machinery instead of building a parallel rung.

Your four operational files are untouched by both merges: `indexing-queue.json`,
`wave-insert.mjs`, `parked.txt`, `send-upsell.mjs`, all verified by blob hash.

**Section 3, the 39 Tier A subtypes: inserted.** 39 written, 0 failed. The write reads each
row's **current** value and merges, so nothing was replaced: **0 existing subtypes lost**,
checked afterwards against all 39. Bar Chenin kept `Hotel Bar` and gained `Wine Bar`; Rabbit
Hole kept `Cocktail Bar` and gained `Speakeasy`.

Bars carrying any subtype: **420 to 442**. Hotel Bar 151 to 157, Speakeasy 107 to 120, Rooftop
Bar 40 to 49, Wine Bar 15 to 23, Tiki Bar 18 to 19.

---

## Section 2: the four unclear ones, checked against their own sites

**One of four converts, and one of them is not a bar at all.**

| Bar | Verdict | The evidence, from its own site |
|---|---|---|
| **Minus One**, Prague | **Hotel Bar: yes** | "One of the Most Exquisite Bars in Prague **at W Prague**", and "**Nestled within our hotel**, Minus One is more than a bar". The "own entrance" line is about access, not independence. |
| 008 Bar, Bangkok | Rooftop: **no** | "Head up to the 11th floor... our speakeasy-style lounge **tucked beside the pool**", "armchairs cluster around low tables across the main floor, flowing into a library zone". An enclosed 11th-floor room. Its existing Speakeasy and Hotel Bar tags are both confirmed correct. |
| Lennon's, Bangkok | Rooftop: **no** | The site's own title is "Bangkok **Speakeasy & Vinyl Bar**", location "30th floor". An indoor listening bar. Its existing tags are right. |
| **Hudson Bar**, Budapest | **not a bar** | See below. |

### Hudson Bar is a private room inside Hotsy Totsy, and we list it as a separate bar

From hotsytotsy.hu's own venue page:

> **Hudson private room.** The Private Room offers a more intimate side of Hotsy Totsy. Tucked
> away from the main flow of the bar, it was designed for smaller gatherings.

We hold both, **at the same address and the same website**: Hotsy Totsy at Síp u. 24 and Hudson
Bar at "Sip utca 24.", both `hotsytotsy.hu`. Our own description already says it: "a bar within
a bar, tucked away **inside Hotsy Totsy**... private room at the heart of the older venue".

So Budapest's count of 19 includes a room, and a visitor can be sent to a private room as
though it were a venue. **I have not touched it**: it is a listing decision, not a subtype one,
and the merge standard involves a 301 and a delete. Your call.

### The one conversion unlocks a page

Prague has **3** Hotel Bars (Black Angel's, ALCRON, Golden Eye). Minus One makes **4**, which is
`MIN_TYPE_BARS`, so tagging it creates **`/best-bars/prague/hotel-bars`**.

You said report before writing, so I have written nothing. One tag, one new page, on your word.

---

## Section 5: sourced for two cities, blocked for two

You asked for six bars. I have solid admission sources for four of them and I will not invent
the other two.

### Macau: source confirmed, two candidates

**Tatler, The Tatler Best 20 Bars in Macau 2026.** A counted selection of 20, inside
`MAX_SELECTIVE_N`, so it qualifies. I pulled the full list: we already hold 3 of the 20 (Pony &
Plume, The St Regis Bar, Wing Lei Bar), leaving 17 candidates with addresses.

My two: **Two Moons** (32A Rua de Pedro Nolasco da Silva) and **Wood House** (30 Rua Central),
both **independent** rather than casino-resort bars. Macau's three current listings are all
inside integrated resorts, so this widens the city rather than deepening one corner of it.

### Osaka: source confirmed, two candidates

**Time Out, "6 of the best cocktail bars in Osaka".** Counted selection of 6. We hold 2 of the 6
(Craftroom, Bar Nayuta). My two: **Bible Club Osaka** (basement, pre-Prohibition, sister to the
Portland Bible Club we already list) and **Ista Coffee Elements** (eight seats, owner-bartender
Fumiaki Nozato, coffee cocktails with beans roasted in-house).

### Split: no qualifying source found

Time Out's Split guide is **"The best bars in Split"**, with no number in the headline, so it
fails `countedSelection` and Time Out is not in `SELECTIVE_NAMES`. It is also the wrong list:
ten entries of which several are beach terraces and a DJ den, not cocktail bars.

Everything else I found is a travel blog listicle. **Split needs a real source or it does not
get a bar**, and I would rather tell you that than admit one on a blog.

### Norway: source is right, but I cannot read it

**Falstaff is in `SELECTIVE_NAMES`**, and it has both "Oslo's Top 5 cocktail bars" and a "Bar
Guide 2026: the best cocktail bars in Norway". That is exactly the right source.

**falstaff.com is Cloudflare-blocked** to both WebFetch and curl with a browser user agent, 403
on every attempt. I have a search engine's summary naming **Fuglen** (Oslo, mid-century design,
coffee roaster by day, Norwegian-foraged ingredients) as a strong candidate, but a search
snippet is not a source I will insert on.

Two ways forward, your pick: drive the page in a browser session to read it properly, or accept
a different named source for Norway.

**Nothing written for section 5.** No wave file built yet either, because four verified
candidates out of six is not a wave.

---

## The Search Console URLs to request indexing for

Manual requests are capped at roughly **10 to 12 a day**, so this is ordered.

### Day 1, the ten continent pages

Brand new URLs that no crawler has seen. They are in the sitemap, but a manual request is much
faster for a new rung with no inbound links yet.

```
https://barmagazine.com/best-bars/continent/north-america/hotel-bars
https://barmagazine.com/best-bars/continent/north-america/speakeasies
https://barmagazine.com/best-bars/continent/europe/hotel-bars
https://barmagazine.com/best-bars/continent/asia/hotel-bars
https://barmagazine.com/best-bars/continent/europe/speakeasies
https://barmagazine.com/best-bars/continent/asia/speakeasies
https://barmagazine.com/best-bars/continent/north-america/rooftop-bars
https://barmagazine.com/best-bars/continent/europe/rooftop-bars
https://barmagazine.com/best-bars/continent/north-america/tiki-bars
https://barmagazine.com/best-bars/continent/asia/rooftop-bars
```

### Day 2, the retitled directory pages that matter most

All 78 city pages changed title and H1, but requesting 78 is neither possible nor useful.
**Request the eight where the directory page was outdrawing its own best-bars page**, because
those are the ones where the retitle has something to release:

```
https://barmagazine.com/bars/city/bangkok
https://barmagazine.com/bars/city/tokyo
https://barmagazine.com/bars/city/paris
https://barmagazine.com/bars/city/budapest
https://barmagazine.com/bars/city/hong-kong
https://barmagazine.com/bars/city/new-york
https://barmagazine.com/bars/city/kuala-lumpur
https://barmagazine.com/bars/city/berlin
```

### Day 3, the siblings that should now win those phrases

This is the half that is easy to forget. Retitling the directory page only helps if Google
re-evaluates the page meant to take its place:

```
https://barmagazine.com/best-bars/bangkok
https://barmagazine.com/best-bars/tokyo
https://barmagazine.com/best-bars/seoul
https://barmagazine.com/best-bars/madrid
https://barmagazine.com/best-bars/taipei
https://barmagazine.com/best-bars/shanghai
https://barmagazine.com/best-bars/montreal
```

Seoul, Madrid, Taipei, Shanghai and Montreal are the five from the task 80 report with a live,
indexable page drawing **zero** impressions while their directory page took everything. They are
the clearest test of whether the retitle worked.

**Do not request the remaining 70 city pages.** They will be recrawled from the sitemap, and
spending the daily quota on thin cities earning 20 impressions a month costs the pages above.

---

## What I need from you

1. **Section 2:** tag Minus One as a Hotel Bar and create `/best-bars/prague/hotel-bars`?
2. **Hudson Bar:** it is a private room listed as a bar, at Hotsy Totsy's address. Merge, delete,
   or leave?
3. **Section 5:** proceed with the four I can source (Macau 2, Osaka 2) and hold Split and
   Norway? Or wait and do all six together?
4. **Norway:** browser session to read Falstaff, or a different source?
5. **Split:** accept a weaker source, or leave Split at four bars?

Task 84 is in the queue and read-only. I have not started it; it is next.
