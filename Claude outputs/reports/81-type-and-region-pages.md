# Task 81: type pages, region pages, and thin cities

**Nothing inserted, nothing pushed, no branch.** Report only, as the task asked.

## The headline, before the four steps

**Most of what this task asks me to build already exists and is live.** I checked each URL
rather than inferring from the rules:

| The task asks for | Reality |
|---|---|
| Best hotel bars in California | **live**, `/best-bars/us/california/hotel-bars` |
| Best speakeasies in New York State | **live**, `/best-bars/us/new-york/speakeasies` |
| Best speakeasies in California | **live**, `/best-bars/us/california/speakeasies` |
| Best bars in the UAE | **live**, `/best-bars/country/united-arab-emirates/cocktail-bars` |
| Step 4: Austria, Ireland, South Africa, Peru country pages | **all four live** |

`src/lib/seo-regions.ts` has built `/best-bars/country/<country>/<type>` and
`/best-bars/us/<state>/<type>` since 16 September, at `MIN_REGION_BARS` = 6. **40 of our 64
countries already have a page.**

The one genuinely new rung is **continents**, and the subtype pass is not what is blocking it.

The task's own data checks out, which is worth saying after the last two: the subtype table is
exact, and `type` really is `Cocktail Bar` on 1,445 of 1,540 bars. The warning not to build type
pages from `type` is correct and I followed it.

---

# Step 1: the subtype pass, and why I am giving you two numbers instead of one

I classified from the descriptions we already hold (1,391 of 1,540 bars have one). I did not
fetch 1,120 websites; that is a much larger job and the description is the same primary source
the existing subtypes follow.

**My first pass found 138 bars. I threw most of it away, and you should know why.** Reading the
actual matches rather than the counts, three false-positive classes appeared:

- **878 Bar**, Buenos Aires: "*originally* a speakeasy... *grew into* the bar". Not one now.
- **18.68**, Lisbon: "the *standalone* reincarnation of the bar *originally at* the Bairro Alto
  Hotel". Explicitly not a hotel bar.
- **Alma Prague**: "a cocktail bar... which *also houses* a restaurant, café and wine bar". The
  wine bar is a different part of the venue.

So I added guards for past tense, neighbouring venues and denials. **Then the guards
over-rejected**, and that is the more important finding:

- **Artesian**, London: killed by "*once* defined the London hotel bar arms race". It is The
  Langham's bar. A true hotel bar, rejected.
- **Catbird**, Dallas: killed by "*above* downtown Dallas". It is a rooftop bar at the Thompson.
- **Almanac**, Philadelphia: killed by "*above* Ogawa Sushi". It is a speakeasy.

**A regex cannot make this call.** "Is a speakeasy", "has a speakeasy feel", "a city full of
speakeasies" and "originally a speakeasy" are four different facts in one word. I was running at
roughly 80% precision in both directions, and a wrong subtype does not just miss a page, it
builds a page that lies to the reader.

So I split the output by how the bar states it, and I am reporting both numbers:

### Tier A: the bar describes itself as the thing. 39 bars.

Matched only on a copula tied to the bar's own name: "*Catbird is a rooftop cocktail lounge*",
"*Bar Chenin is a small wine bar*", "*Harbour Bar is a hotel bar*", "*calls itself*",
"*describes itself as*".

| Subtype | Tier A additions |
|---|---|
| Speakeasy | +13 |
| Rooftop Bar | +9 |
| Wine Bar | +8 |
| Hotel Bar | +6 |
| Restaurant Bar | +2 |
| Tiki Bar | +1 |
| **Total** | **+39 across 39 bars** |

I read all 39. Every one is a genuine self-description. I would insert these.

### Tier B: the word is present in some other construction. 57 bars.

Speakeasy +34, Restaurant Bar +8, Hotel Bar +8, Wine Bar +4, Tiki Bar +3, Rooftop Bar +1.
**These are candidates, not classifications.** Each needs a human or a model reading the
sentence. Artesian, Catbird and Almanac are in here and are all correct; so are the ones that
merely mention the word.

Both lists are on disk (`/tmp/tierA.json`, `/tmp/tierB.json`) and I will write them anywhere you
want them.

### The result that matters, and it is a negative one

**Tier A creates zero new pages. So does Tier A plus Tier B.**

| | non-cocktail city+type pages |
|---|---|
| Today | 25 |
| After Tier A | **25** |
| After Tier A + B | **25** |

Because the 39 bars are spread across 39 different cities. A city needs **4** of one type, and
adding one bar each to 39 cities moves nothing over the line unless it lands on a city already
sitting at 3. None of them did.

**The subtype pass is worth doing for honesty and for the profile pages. It is not a lever on
page count at this size.** I would rather tell you that now than after inserting 96 rows.

---

# Step 2: the thin-city premise is backwards

The task says "thin cities are where a type page changes the most" and asks for city+type
combinations "thin cities first".

**No thin city has 3 of any non-cocktail type.** Not one. There are **28 combinations sitting at
exactly 3**, one assignment from a page, and every single one is in a city of **11 to 41 bars**:

| City (bars) | Type at 3 |
|---|---|
| Singapore (41) | Speakeasy |
| Bangkok (34) | Rooftop Bar |
| Seoul (25), Chicago (25) | Speakeasy |
| Chicago (25), Miami (24), Prague (21) | Hotel Bar |
| Las Vegas (22), Mexico City (21), Taipei (20) | Speakeasy |
| Portland (19), Detroit (16), Mumbai (15), Lisbon (13) | Hotel Bar |
| Budapest (19), Philadelphia (16), Belgrade (16), Atlanta (16), Bratislava (16), Minneapolis (13) | Speakeasy |
| New Delhi (18), Rome (17) | Speakeasy **and** Hotel Bar |
| Washington DC (16), Kansas City (14) | Rooftop Bar |
| Kansas City (14) | Speakeasy |
| Bengaluru (11) | Pub |

That is the real target list: **28 pages, one correct subtype assignment each**, at the 2.9% CTR
the task measured. It is the highest-value work in the task, and it is in the big cities, not
the thin ones.

**Vienna does not contradict this.** The task is right that `/best-bars/vienna/cocktail-bars`
draws 113 impressions against 19 for the bare page, and right about why: surface area, not
depth. But Vienna's six bars carry no second type, so no second sibling exists to build. The
mechanism is real; the thin cities are not where it can be applied.

---

# Step 3: only the continent rung is new, and it is already unblocked

Country and US-state are built. What does not exist is continent. Recomputed from live data
(1,540 bars), `Cocktail Bar` excluded because it is the default on 94% of rows and a continent
page of 479 bars means nothing:

| Page | Bars now | With Tier A | With merit |
|---|---|---|---|
| Best hotel bars in North America | 77 | 77 | 56 |
| Best speakeasies in North America | 70 | 72 | 39 |
| Best hotel bars in Europe | 50 | 50 | 17 |
| Best hotel bars in Asia | 46 | 46 | 14 |
| Best restaurant bars in North America | 42 | 42 | 40 |
| Best speakeasies in Europe | 34 | 37 | 12 |
| Best speakeasies in Asia | 30 | 30 | 7 |
| Best rooftop bars in North America | 19 | 24 | 14 |
| Best rooftop bars in Europe | 17 | 17 | 10 |
| Best tiki bars in North America | 16 | 17 | 4 |
| Best wine bars in North America | 14 | 17 | 14 |
| Best restaurant bars in Europe | 13 | 14 | 10 |
| Best rooftop bars in Asia | 11 | 12 | 1 |

**All thirteen clear the threshold of 6 today, before any subtype work.** The Tier A column
moves nothing across a line. So step 3 does not depend on step 1 at all, and can go first.

### A bug that would bite the moment continent pages ship

**Twelve countries have no continent mapping** in `src/lib/geo.ts`: Iceland, Serbia, Nepal,
Bahamas, Cayman Islands, Ghana, Kyrgyz Republic, Albania, Macau, Sri Lanka, Cambodia, Bosnia and
Herzegovina. Their bars would be silently absent from every continent page, with no error. This
must be fixed before, not after. It is a data addition to one map, not a design question.

### The URL shape, proposed and waiting as instructed

The existing rung is `/best-bars/country/<country>/<type>` and `/best-bars/us/<state>/<type>`.
The consistent sibling is:

```
/best-bars/continent/europe/hotel-bars
/best-bars/continent/north-america/speakeasies
```

**Why this one:** it reads as the same family as the two rungs already shipped, the type stays
last everywhere so one component can render all three, and `continent` disambiguates a segment
that would otherwise collide with a city slug. Neither form the task named
(`/best-bars/rooftop-bars/europe`, `/rooftop-bars/europe`) matches what is already built, and
the first inverts the component order for this rung only.

**Not building it until you pick.** I would also want to settle: whether "Latin America" is a
page (it is not a continent in our map, it would be South America plus Mexico, and the task's
own table has it at 7 bars), and whether these pages are indexable from day one or start
`noindex` until the subtype data is better.

---

# Step 4: nothing to build

Austria, Ireland, South Africa and Peru **all have a live country page**. 40 of 64 countries do.

The countries that do not, and are close: **Norway 5, Philippines 4, Finland 3, Puerto Rico 3,
Macau 3, Sri Lanka 3.** Each needs one to three bars. Norway is one bar from a page.

---

# What I need you to decide

1. **Insert the 39 Tier A subtypes?** High confidence, I read all of them. Creates no new pages
   but makes the data honest and the profile tags right.
2. **Tier B, 57 candidates: how?** I can work them one by one against each bar's own site and
   report before inserting, or leave them.
3. **The 28 one-assignment-away combos** in the big cities. This is the best-value work in the
   task. Same method, report before inserting.
4. **Continent pages: is `/best-bars/continent/<continent>/<type>` the shape?** If yes I will
   spec the template and put it on a preview. The `geo.ts` continent gap gets fixed first either
   way.
5. **Countries at 3 to 5 bars** (Norway especially, one bar short). Small enrichment, your call.
