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

---

# Round two: Roman's four changes

Same branch, PR #73, still not merged.

## 1. The integrity note

No gold rule. Centred, 13px (down from 14), `--text-secondary`, no card
background, and a 1px hairline above it instead of a colour beside it. Capped at
620px so the centring has something to centre against on a wide screen.

It now reads as a footnote to the intro, which is what it is, rather than as a
box competing with the award results below it.

## 2. Every accent left border, listed

Grepped `src/` for `border-left`. Four live rules had the pattern, all in
`globals.css`, and all four are changed:

| Where | Was | Now | Visible on |
|---|---|---|---|
| `.awards-integrity` | 3px gold `#B08D3F` | gone, hairline above instead | the four award hubs |
| `.article-body blockquote` | 3px `var(--accent)` | gone; radius closes on all four corners; **text upright, not italic** | any article with a quote |
| `.dir-section-header--top10` | 3px gold `#C9A84C` | gone; gradient wash and gold icon stay | **nowhere today, see below** |
| `.bar-status-notice` | 3px red `#8a2b2b` | 1px of the same red all the way round | a temporarily closed bar's profile |

Two things worth knowing before you check them:

**`.dir-section-header--top10` renders nowhere.** Its only consumer is
`SectionHeader` in `BarDirectoryMap.tsx`, which carries an
`eslint-disable-next-line @typescript-eslint/no-unused-vars` and has no callers.
The rule is changed for consistency, but there is no page on which you can see
the difference. Worth deciding separately whether that dead component should go.

**The status notice kept a border, just not that one.** Removing the red bar
outright left a pale pink paragraph that no longer read as a warning, and this is
the only callout on the site carrying a fact a visitor can act on before
travelling to a bar. A 1px hairline of the same red all round keeps the signal
without the left-bar pattern. Say if you would rather it went entirely.

**One left border deliberately not touched:** `src/lib/emails/welcome.ts` styles
a `.expect-section` with a 3px left border. That is an HTML email, not site CSS;
the pattern exists there because mail clients strip most of everything else, and
changing it alters mail we send. Left alone.

**Also fixed:** a comment above `.owner-upsell-strip` described it as using "the
same border-left card language as the full offer card". The rule sets no border
and the language no longer exists anywhere, so the comment was pointing at
nothing.

To check on the preview: any bar profile for Tayēr + Elementary, Juniper Bar,
Baltazar or The Wise King shows the status notice. Blockquotes come from
WordPress and **no article currently in the directory has one**, so I verified
that rule by injecting a blockquote into a real article body and reading the
computed style: 0px left border, 24px radius, beige, upright.

## 3. The card

Two defects, not one.

**Cards in a row already matched at the edges.** The grid stretches them. What
was ragged was the inside: a one-line name pushed its location line up while the
two-line name beside it pushed its own down.

**The name box is now always two lines tall**, so every location line in a row
sits on the same baseline. Measured on the 50 Best hub at 1440px: card heights
309/309/309, location-line tops 894/894/894, exactly equal.

**Names too long for two lines drop one size.** Which names those are is decided
at render from the name itself, so nothing reflows in front of the reader.

The threshold is measured, not guessed. I served all 1,646 active bar names to
the browser and wrapped each one in the real card box:

| Box | Names needing a third line |
|---|---|
| hub grid, 241px at 21px | **1** |
| tablet band, 249px at 16px | 0 |
| mobile, one column | 0 |

The one name is **"Cause Effect Cocktail Kitchen & Cape Brandy Bar"** (Cape Town,
47 characters). The threshold is set at 42 rather than 47, because 46 fits and 47
does not: the true boundary depends on where the words happen to break, and
sitting on it would make the layout depend on luck. Four names are at or above
42. `src/lib/card-name-fit.ts`, 7 tests, including BOP and the other two-line
names as fixtures that must NOT be shrunk.

**BOP (Bartenders of Pony) was never overflowing.** It wraps to two lines and
used to sit beside one-line names, which is the raggedness the fixed box fixes.
It stays at full size, and there is a test that says so.

**Two bugs I introduced and caught while checking this**, both the same mistake:
sizing the box with `calc(2em * ...)`. `em` resolves against each rule's own
font-size, so the smaller variant computed a shorter box and pushed its location
line 9px up, which is precisely the defect the change exists to remove. Then the
same thing in the tablet band, where the base drops to 16px but the "one size
down" variant was pinned at 17px and so was LARGER than the size it steps down
from. Both are now custom properties, `--card-name-size` and `--card-name-box`,
so the two move together. No new breakpoints; the tablet band already restyled
this element.

**One case the instruction does not cover.** On a city page in the 769-1024px
band the card body is only 163px wide, and at that width the Cape Town name does
not fit two lines even one size down. It clamps with an ellipsis: "Cause Effect
Cocktail Kitchen & Cape Brandy...". One bar, one band, and the row stays aligned.
Fitting it would need roughly 9px type, which is worse than the ellipsis.

## 4. Ties sort photo, then tier, then name

`compareHonoredBars` now orders equal-merit bars by photo, then tier, then name.

**Sorting inside a section was not enough, and the screenshot is what showed it.**
On Bartenders' Choice every category holds exactly one bar, so the twenty bars
that tie on merit live in twenty separate sections; ordering within each one can
never move anything, and the grid still opened on three placeholder cards. The
page now re-sorts the merged cells whenever it flows a run of small sections into
one grid. Bartenders' Choice opens on all six of its photographed bars:

```
Satan's Whiskers (Top 10)  Bar DECO  Elysian Budapest
Mirror Bar                 Svanen    Taigen
... then the fourteen placeholders
```

Satan's Whiskers leads on tier, the other five are alphabetical, exactly the
requested order.

**One thing to be aware of in the tier step.** `featured` is the paid
subscription. I put editorial `top10` above it so a paid listing can never lead a
row on this page, which would sit badly next to the integrity line directly
above it. A paid bar still sorts above an untiered one. Only one active bar holds
`featured`, so this is close to theoretical today; say if you would rather tier
be ignored on the hubs entirely.

## Gate

`npm run verify`: **450 tests passed** (7 new), build clean, 832 pages.

**Blast radius, since two of these reach past `/awards/[program]`:** the card
change affects every city guide, `/bars`, the nearby block on profiles and the
article bar lists; the blockquote and status-notice changes affect articles and
profiles. That is what items 2 and 4 asked for, but it is wider than the standing
"change only the hub" rule, so it is worth a look beyond the award pages.
