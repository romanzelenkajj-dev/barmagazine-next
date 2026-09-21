# Task 85: the award hubs use the directory card

**PR #73, preview branch `preview/85-award-hub-cards`. Not merged.**

---

# The fix was upstream of the markup, as the brief said

`getProgramYears()` selected six columns. No photo could reach the page no matter what the
template did. **Five fields added to the select:**

| Field | What it feeds in `DirectoryBarCard` |
|---|---|
| `photos` | the image, and the `BarPlaceholder` when the array is empty |
| `type` | the type line under the name |
| `tier` | the tier chip |
| `status` | `CardStatusPills` |
| `wp_article_slug` | the "read more" affordance the card already draws |

Nothing else in the query changed. Metadata, JSON-LD and the integrity copy are untouched,
which was the constraint on a page that is already ranking.

---

# Measured on all four hubs, not just the one Roman looked at

| Hub | Before | After | Page height |
|---|---|---|---|
| **Bartenders' Choice** | 20 `<h3>`, 20 lists, **every one holding exactly one bar** | 0 `<h3>`, **one grid of 20** | 3538 → **3237px** |
| **World's 50 Best** | 14 sections, biggest 100 bars, 0 photos | 4 list headings kept, 9 small years flowed | 12746 → **40722px** |
| **Spirited Awards** | — | 10 headings kept, 26 winners flowed above them | 21725px |
| **James Beard** | — | 1 heading kept, 3 winners flowed above it | 5346px |

390px and 1440px on both required hubs: **no horizontal overflow, no new breakpoints**, cards
370px wide in a single mobile column. All **163 images lazy**, so the long page is scroll
length and not load weight.

---

# The thing to look at before merging

**The 50 Best hub is 3.2 times taller than it was**, 12,746px to 40,722px.

That is the arithmetic of the brief rather than a mistake: 360 bars that were 72px text tiles
are now 360 real cards with photos, three to a row. 360 ÷ 3 × ~340px is the number you get.

I did not cap, paginate or collapse it, because that is a different page design and the brief
scoped this to the card, the kicker and the heading rule. **If 40,000px is too long, the fix
is a decision about how many years a hub shows at once, and it is yours to make.**

---

# Two places I chose differently from the brief

## 1. Large sections keep their heading

The brief says flow every bar in a year into one grid, then offers: *"If you think a category
heading should survive where a section is large, say so and show it."*

**They should, and here is why.** On the 50 Best hub a single year holds "Asia's 50 Best Bars"
**and** "World's 50 Best Bars", and a bar can sit in both. With the headings gone, the year
2026 is 250 cards in one undifferentiated grid and nothing tells a reader which list they are
looking at. The kicker cannot carry it either, because in a ranked list the kicker has to be
the rank.

So: **a section keeps its `<h3>` at four bars or more.** Four is the smallest number that
fills a row at the narrowest desktop grid width, which means a surviving heading can never
again introduce a row with a hole in it. That is the actual defect from the brief, stated as a
rule rather than as "no headings".

Under a kept heading the kicker becomes `No. 1`, `No. 2`, because the list name is already
above. In a flowed grid the kicker is the category, because nothing else says it.

## 2. Sections render in merit order, not all-small-then-all-large

My first version filtered the year into `small` and `big` and rendered every small section
first. That silently reordered the page: **any small section, whatever it was, jumped above
every headed section.**

It was already doing visible damage on Spirited Awards. The 2026 year has
`Nominee: Best New U.S. Cocktail Bar` split across three groups, Regional Honoree, Top 10 and
Top 4. The first two are large and kept their headings; the **Top 4 group, being small, was
hoisted to the top of the year and parked among the winners**, three cards away from the two
sections it belongs to.

It now walks the sections in the order the query returns and collapses only **consecutive**
runs of small ones. Spirited Awards 2026 reads correctly:

```
flow(26)  first = Winner: Best International Bar Team
HEAD:     Nominee: Best New U.S. Cocktail Bar (Regional Honoree)
HEAD:     Nominee: Best New U.S. Cocktail Bar (Top 10 Nominee)
flow(3)   first = Nominee: Best New U.S. Cocktail Bar (Top 4)
HEAD:     Nominee: Best U.S. Bar Team (Regional Honoree)
```

The same bug had a second, latent form: a program whose **winner** category held four or more
bars would have printed its nominees above its winners, breaking requirement 3 outright. No
hub does that today, which is exactly why it was worth closing now rather than after some
future year's results make it visible.

---

# Ordering

Winners, then nominees, then longlists, then rank, then name. It holds inside a section and
across sections, since the same comparison orders both.

**Bartenders' Choice still opens on Croatia**, and that is worth saying plainly because it
looks like the brief's complaint survived. It did not. Every one of those 20 entries is a
winner of the same category type and none carries a rank, so the comparison falls through to
the bar's name, and **"Bar Sistema" happens to sort first**. It is no longer alphabetical by
category, it is alphabetical by bar. If you want a different order there it needs a different
rule, because merit cannot separate 20 equal winners.

---

# One near miss

I deleted `.awards-bar-list` and `.awards-bar-link` from `globals.css` as dead code, since
this page stopped using them. **`/awards/page.tsx` still does.** Caught before pushing and
restored with a comment saying who else reads them. The build would not have failed, the index
page would simply have lost its styling.

---

# Gate

`npm run verify`: **443 tests passed, build clean, 832 pages.**

Untouched and still flagged from earlier tasks: `cocktails-dreams` is in Gurugram not New
Delhi, `tesouro` cannot be placed in Mumbai, `miss-t` may be closed, and
`beogradski-koktel-klub`'s stored Instagram handle is dead.
