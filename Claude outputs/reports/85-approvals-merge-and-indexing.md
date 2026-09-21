# Your approvals of 19 September, part two

Everything below is done unless it says otherwise.

---

## 1. Minus One tagged, Prague page created

`minus-one-bar` now carries `Hotel Bar`, appended to an empty array.

**Prague Hotel Bars: 3 to 4**, which is `MIN_TYPE_BARS`. Minus One Bar, Black Angel's Bar,
ALCRON Bar, Golden Eye. `/best-bars/prague/hotel-bars` now generates.

---

## 2. Hudson Bar merged into Hotsy Totsy

Done under the merge standard, in the order it requires. Commit `122c704`.

**What it was:** not a duplicate but a **sub-venue**. hotsytotsy.hu's own venue page calls it
the "Hudson private room ... tucked away from the main flow of the bar". Both rows carried the
same address and the same website.

| Step | Result |
|---|---|
| Kept row | `hotsy-totsy`, which had the phone, photo credit, venue Instagram and fuller hours |
| Carried across | the `editorial_sources` entry only the losing row held, **annotated** so the Bartenders' Choice recognition still reads as naming the Hudson room inside the venue rather than being silently reattributed |
| Description | one sentence about the private room appended, so the information survives |
| 301 | `['hudson-bar-budapest', 'hotsy-totsy']` in the merged-bar-slugs map, **shipped and verified live before the delete** |
| FK checks | `bar_claims` 0, `owner_submissions` 0, re-run immediately before the delete rather than from stale output |
| Delete | done, 0 rows remain |
| Changelog | `claude/implementation-status.md`, newest first |

`/bars/hudson-bar-budapest` returns **308 to /bars/hotsy-totsy**. Budapest 19 to 18.

---

## 3. The 25 indexing requests: day one is done

**All ten continent pages are submitted.** Every one confirmed by "Indexing requested" on screen
before moving on:

| # | URL | |
|---|---|---|
| 1 | `/best-bars/continent/europe/hotel-bars` | done |
| 2 | `/best-bars/continent/north-america/hotel-bars` | done |
| 3 | `/best-bars/continent/north-america/speakeasies` | done |
| 4 | `/best-bars/continent/asia/hotel-bars` | done |
| 5 | `/best-bars/continent/europe/speakeasies` | done |
| 6 | `/best-bars/continent/asia/speakeasies` | done |
| 7 | `/best-bars/continent/north-america/rooftop-bars` | done |
| 8 | `/best-bars/continent/europe/rooftop-bars` | done |
| 9 | `/best-bars/continent/north-america/tiki-bars` | done |
| 10 | `/best-bars/continent/asia/rooftop-bars` | done |

All ten reported "URL is not on Google" beforehand, which is right for pages that went live
today, and "No referring sitemaps detected", which is Google not yet having recrawled the
sitemap rather than the pages being absent from it.

**One thing I got wrong and want on the record.** On my second request the URL field did not
clear, so I submitted `europe/hotel-bars` a second time instead of `north-america/hotel-bars`.
It cost one request out of a daily quota of roughly ten and changed nothing else. After that I
verified the URL on screen before every single click, which is why the table above is
trustworthy. The Search Console input is genuinely flaky: roughly half my attempts to type into
it did not land, and each needed a retry.

### Day two and day three, still to do

Tomorrow, the eight cities where the directory page was outdrawing its own sibling:

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

Day three, the siblings meant to take those phrases, plus the two new Norway pages:

```
https://barmagazine.com/best-bars/bangkok
https://barmagazine.com/best-bars/tokyo
https://barmagazine.com/best-bars/seoul
https://barmagazine.com/best-bars/madrid
https://barmagazine.com/best-bars/taipei
https://barmagazine.com/best-bars/shanghai
https://barmagazine.com/best-bars/montreal
https://barmagazine.com/best-bars/oslo
https://barmagazine.com/best-bars/country/norway/cocktail-bars
```

I can do these on the next two days, or you can. They are quick by hand and I am slow at it.

---

## 4. Macau and Osaka: one of four fully sourced so far

**Not inserted.** You approved the four, and I am part-way through verifying each against its
own site, which is the standard waves 1 to 3 hold to.

| Bar | Status |
|---|---|
| **Bible Club Osaka** | **fully verified.** B1F 2-1-11 Shinsaibashisuji, Chuo-ku; 6pm to 1am, closed Wednesdays; +81-6-4708-1238; 38 seats; ¥800 charge; IG `bibleclubosaka`. Sister bar to the Portland Bible Club we already list |
| Two Moons, Macau | address and concept confirmed from secondary sources, venue site not yet read |
| Wood House, Macau | not yet researched |
| Ista Coffee Elements, Osaka | not yet researched |

I would rather finish the three properly than insert a half-verified wave. They are next.

**Split: left at four bars, as you decided.** No bar on a blog.

---

## 5. Task 86 and Falstaff

Falstaff **is** readable in Chrome, and also in the in-app browser, which is how I checked
Croatia earlier. It is only `curl` and WebFetch that get a 403. So task 86 is unblocked and
needs no fallback. The access method and the search URL pattern are saved to memory so this
does not have to be rediscovered.

---

## Still open

- The three remaining Macau and Osaka rows, then the dry run and your go.
- Tasks 84, 85 and 86 in the queue, in that order, as you asked.
- Whether to merge the task 79 preview. You approved its content but did not say merge, and I
  have not.
- The two Hvar bars Falstaff lists, which would take Hvar from 1 to 3 on a qualifying source.
