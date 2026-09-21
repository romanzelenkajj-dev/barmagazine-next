# Task 78: city wave 3, Detroit, Tampa, Kansas City

Researched, verified, built and QA clean. **33 rows staged, dry run clean, nothing inserted.**
`wave-insert.mjs` still needs your go and this task file carries none.

All three cities beat the target of 10.

| City | Before | After | Added | Target |
|---|---|---|---|---|
| Detroit | 4 | **15** | 11 | 10, met |
| Tampa | 0 | **10** | 10 | 10, met |
| Kansas City | 0 | **12** | 12 | 10, beaten |

QA clean across all 33: word counts 90 to 120, no dashes, no food negation, address and
source on every row, subtypes from the permitted list, `accolade: none` throughout. No
duplicates against the live directory, checked against a dump refreshed after wave 2.

## The stack question, settled

This is the thing wave 2 raised, and three waves now agree. **Eater is not the lead source. It
was not even available for two of these three cities.**

| City | Eater | What actually carried it |
|---|---|---|
| Detroit | exists, produced **2 of 11** | **Hour Detroit**, the city magazine, 6 of 11 |
| Tampa | **does not exist** | **Tampa Magazine**, 6 of 10 |
| Kansas City | **does not exist** | **Time Out**, 7 of 12 |

I checked `tampa.eater.com` and `kansascity.eater.com` before briefing anyone: neither
resolves in DNS. Eater has roughly two dozen US city sites and stops there.

Even where Eater exists it underperformed. Its only relevant Detroit map is a **new**-bars map,
so it skews to openings rather than the best of the city, and 3 of its 14 entries are
breweries.

**The ranking the evidence supports, replacing "Eater first":**

1. **The city magazine.** Hour Detroit and Tampa Magazine each carried their city alone. This
   is the most reliable source type across all three waves.
2. **Time Out**, where it covers the city. It carried Kansas City outright and is the only
   source here that publishes a genuinely ranked, numbered city list.
3. **The alt-weekly.** Metro Times, Creative Loafing and The Pitch all produced bars, but
   mostly through readers' polls and themed guides rather than editorial best-of lists.
4. **Eater**, where it exists, as a source for new openings rather than the canon.

One surprise worth recording: **Kansas City Magazine's comprehensive list is dated June 2021**
and runs to 87 bars. The researcher refused to admit anything on it, which was right. The
city magazine is the best source type but only when it is current.

## The finding that decides whether this wave is worth inserting

**Only 10 of the 33 would qualify for their city's best-bars page.**

| City | Qualify | Of |
|---|---|---|
| Kansas City | **8** | 12 |
| Tampa | 2 | 10 |
| **Detroit** | **0** | **11** |

Detroit returning zero is not a research failure. Every Detroit bar is admitted by one of
three sources, and all three fail for different reasons:

- **"The 27 Best Cocktail Bars in Metro Detroit"** fails because `MAX_SELECTIVE_N` is 25. It
  is **two over the line**. This is a city magazine's curated pick, which is exactly the
  source type that carried two of the three cities.
- **"The Best New Bars in Detroit Right Now"** has no number at all.
- **"Best of Detroit 2026 readers' picks"** is a readers' poll, which I would argue correctly
  fails: it measures popularity rather than an editorial standard.

Tampa is the same story sharpened. **A bar that WON Tampa Magazine's Best Cocktails award does
not qualify**, while a bar on Creative Loafing's "17 picturesque places to grab a drink" does,
purely because the second headline carries a number under 25.

That is the rule inverted. Winning a city magazine's cocktail award is a stronger signal than
placing on a list of seventeen photogenic patios.

**Two things I would change, and neither is mine to decide:**

1. **Raise `MAX_SELECTIVE_N` from 25 to about 30.** It would admit the Detroit 27-list and
   nothing absurd. 87 would still fail, which is the case the number exists for.
2. **Treat a named "Best X" award as selective**, separately from counted lists. A
   "Best of the City: Best Cocktails" winner is a pick by definition. This is the bigger of
   the two and would change Tampa from 2 to 8 and Detroit from 0 to 3.

I have changed neither. Say which you want and I will, with the blast radius measured across
existing rows first, the way the Imbibe change was done.

## Per city

### Detroit
| slug | admitting source | verified from |
|---|---|---|
| `sugar-house` | Hour Detroit, The 27 Best Cocktail Bars in Metro Detroit | https://sugarhousedetroit.com/ |
| `kiesling-detroit` | Hour Detroit, The 27 Best Cocktail Bars in Metro Detroit | https://kieslingdetroit.com/ |
| `bad-luck-bar` | Hour Detroit, The 27 Best Cocktail Bars in Metro Detroit | https://badluckbar.com/ |
| `the-skip` | Hour Detroit, The 27 Best Cocktail Bars in Metro Detroit | https://theskipdetroit.com/ |
| `evening-bar-detroit` | Hour Detroit, The 27 Best Cocktail Bars in Metro Detroit | https://www.eveningbar.com/ |
| `antidote-detroit` | Eater Detroit, The Best New Bars in Detroit Right Now | https://theantidotedetroit.com/ |
| `saksey-s` | Eater Detroit, The Best New Bars in Detroit Right Now | https://www.sakseysdetroit.com/ |
| `candy-bar-detroit` | Hour Detroit, The 27 Best Cocktail Bars in Metro Detroit | https://ash.world/dining/candy-bar/ |
| `side-hustle-lounge` | Detroit Metro Times, Best of Detroit 2026 readers' picks: Bars & Clubs | https://sidehustledetroit.com/ |
| `the-monarch-club` | Detroit Metro Times, Best of Detroit 2026 readers' picks: Bars & Clubs | https://monarchclubdetroit.com/ |
| `motorcity-wine` | Detroit Metro Times, Best of Detroit 2026 readers' picks: Bars & Clubs | https://motorcitywine.com/ |

### Tampa
| slug | admitting source | verified from |
|---|---|---|
| `cw-s-gin-joint` | Tampa Magazine, TAMPA Magazines 2025 Best of the City: Best Cocktails | https://cwginjoint.com/ |
| `the-copper-shaker-ybor` | Creative Loafing Tampa Bay, Tampa Bay's best restaurants, food and drink of 2025, according to our readers | https://www.coppershakerybor.com/ |
| `mandarin-heights` | Tampa Magazine, TAMPA Magazines 2025 Best of the City: Best Cocktails | http://www.mandarinheights.com/ |
| `hotel-bar-tampa` | Tampa Magazine, TAMPA Magazines 2025 Best of the City: Best Cocktails | https://www.hotelbartampa.com/ |
| `tori-bar-tampa` | Tampa Magazine, TAMPA Magazines 2025 Best of the City: Best Cocktails | https://www.toribartampa.com/ |
| `bar-terroir-tampa` | Tampa Magazine, Crafting Cocktails 2025 | https://www.barterroir.co/ |
| `edge-rooftop-cocktail-lounge` | Creative Loafing Tampa Bay, 17 picturesque places to grab a drink in Tampa Bay | https://www.epicureanhotel.com/taste/edge/ |
| `m-bird` | Creative Loafing Tampa Bay, 17 picturesque places to grab a drink in Tampa Bay | https://www.mbirdtampa.com/ |
| `alter-ego` | Tampa Magazine, Tampa Bay's Hottest Bars & Drinks for 2025 | https://www.alteregotampa.com/ |
| `jekyll-tampa` | Tampa Magazine, Crafting Cocktails 2025 | https://www.jekyllhydepark.com/ |

### Kansas City
| slug | admitting source | verified from |
|---|---|---|
| `swordfish-tom-s` | Time Out, 10 Best Bars in Kansas City To Check Out Now | https://www.swordfishtoms.com/ |
| `the-monarch-bar` | Time Out, 10 Best Bars in Kansas City To Check Out Now | https://www.themonarchbar.com/ |
| `goat-and-rabbit` | The Pitch, Best of KC 2025: Goat & Rabbit keeps us coming back for more cocktails | https://www.gandrkc.com/ |
| `xo-hifi` | Time Out, 10 Best Bars in Kansas City To Check Out Now | https://www.xohifi.com/ |
| `blanc-champagne-bar` | Time Out, 10 Best Bars in Kansas City To Check Out Now | https://www.blanconmain.com/ |
| `percheron-rooftop-bar` | Time Out, 10 Best Bars in Kansas City To Check Out Now | https://crossroadshotelkc.com/food-and-drink/percheron-rooftop-bar/ |
| `the-brass-monkey-lounge` | Time Out, 10 Best Bars in Kansas City To Check Out Now | https://www.brassmonkeylounge.com/ |
| `fern-bar-kansas-city` | The Pitch, Downtown KC cocktail tour: Pitch Picks for warm weather sips | https://fernbarkc.com/ |
| `vye-cocktail-lounge` | Kansas City Magazine, Just the right vibe at Vye | https://vyeonmain.com/ |
| `p-s-speakeasy` | KCUR, These Kansas City bars carry on the speakeasy tradition. Here's where to find them | https://www.ps1931.com/ |
| `jade-jaguar` | Kansas City Magazine, Bar Medici to Transition Into Mexico City-Inspired Cocktail Bar, Jade Jaguar | https://jadejaguarkc.com/ |
| `in-good-company` | Time Out, 10 Best Bars in Kansas City To Check Out Now | https://igckc.com/ |

## Held, with reasons

### Detroit held (6)
- **Pocket Change** Instagram is the venue's only channel. The bio confirms it is trading, cocktail led, and gives hours, but no website, street address, email or menu is published on its ow
- **Dirty Shake** address and hours are confirmed on the venue's own site and it is clearly trading, but the site publishes no drink menu and the Instagram bio describes a fun bar with bur
- **The Ghostbar at the Whitney** the Whitney's own site confirms the Ghostbar exists, is open to walk-ins and has a named signature martini, but publishes no opening hours for the bar itself, and no dedi
- **Willis Show Bar** , TEMPORARILY CLOSED: the venue's own Instagram bio reads TEMPORARILY CLOSED (World Famous, Creative Cocktails, Live Music, DJs). Its website still lists hours but the fo
- **Mutiny Tiki Bar** , CLOSED: the venue's own Instagram bio now reads closed. Its website is still live and still lists hours, which is why it continues to appear on current best-of lists. D
- **Castalia at Sfumato** , CLOSED: the venue's own homepage states Castalia closed on 12/31/25, by the owners' choice after eight years. Do not publish. Still carried as current on the Hour Detro

### Tampa held (2)
- **Tanto** because the venue's own channels do not publish confirmable hours. tantotampa.com is a JavaScript application that returns no readable address, hours or contact content t
- **Punch Room** on two counts. First, the bar's own EDITION page prints Hours: Contact us for hours, so no hours can be recorded as published; third party listings report Wednesday and T

### Kansas City held (7)
- **Drastic Measures** because it is in Shawnee, Kansas, not Kansas City, Missouri. Strong bar and fully confirmed from its own site as open and trading; list it under Shawnee or a Greater Kans
- **Wild Child** because it is in Shawnee, Kansas, not Kansas City, Missouri. Sister bar to Drastic Measures next door. Open and trading per its own site.
- **The W** on two counts. First, it is in Lee's Summit, a separate Missouri city about twenty miles from downtown Kansas City, not Kansas City, Missouri. Second, no independent venu
- **The Hey! Hey! Club** on the exclusion rule. It is a basement cocktail lounge with its own bar team and its own reservation platform, but J. Rieger & Co. presents it on its own site as one of 
- **Nighthawk** because its own channel could not be reached. hotelkc.com/dine/nighthawk now 301 redirects to a Hyatt brand page, so no venue controlled page publishing hours, descriptio
- **SoT** as not trading. SoT, short for South of Truman, appears on many older Kansas City cocktail lists, but its Instagram indicates it is temporarily closed for renovations and
- **Manifesto** as CLOSED. Manifesto, the basement speakeasy beneath the Rieger, is shut. Its own Instagram says the spirit of Manifesto lives on at J. Rieger & Co. and the Hey! Hey! Clu

## Ten closures found, none of them in the directory

Three waves, three times this has mattered. Lists go stale and the venue's own channel is the
only reliable check.

**Detroit.** Castalia at Sfumato, permanently closed 31 Dec 2025 and stated on its own
homepage, still on Hour Detroit's list. Mutiny Tiki Bar, closed per its own Instagram while
its website still publishes hours. Willis Show Bar, temporarily closed per Instagram, website
footer reads 2018-2019.

**Tampa.** Ciro's Speakeasy, closed, site now a farewell page. Haven, closed May 2026. Rox
Rooftop, replaced by Casa Cami at the same address. Rome + Fig, closed June 2026, and it was
on Tampa Magazine's December list **and** its Hottest Bars feature.

**Kansas City.** Manifesto, closed. SoT, temporarily closed for renovations. Bar Medici,
closed and reopened as Jade Jaguar, which was verified in its place.

None of the ten is in the directory, so nothing needs a status fix.

Useful for future Tampa runs: Creative Loafing maintains a running kill list, "The Tampa Bay
bars and restaurants we've lost so far in 2026". Checking that first would be cheaper than
catching them one at a time.

## Two judgement calls flagged rather than made

**Swordfish Tom's has no hours.** Its own site is two pages and prints none, and the Instagram
bio is unreadable logged out. Third-party hours exist and were deliberately not imported. It
would insert with an empty hours field, which is honest but thin. Your call whether that is
acceptable or whether it should be held.

**The Hey! Hey! Club, Kansas City.** It has its own bar team and reservation platform, but
J. Rieger presents it as one of four drinking spaces inside its distillery, so it trips the
distillery exclusion. Held, and it needs a human call rather than a rule.

**Drastic Measures and Wild Child** are both genuinely strong, both in Shawnee, **Kansas**.
Held because the city is Kansas City, Missouri. If you want the metro rather than the city,
they are the first two to add.

## Outreach candidates

17 of the 33 publish a contact address on their own channel: **7 of 11** in Detroit, **7 of
12** in Kansas City, **3 of 10** in Tampa. Tampa is the weak one and matches what the email
harvest found generally, that contact pages are now forms.

These are not staged into a batch. They cannot be until the rows exist, and the rows need your
go.

## Access notes for the next run

- **Metro Times is Cloudflare-blocked** to curl and WebFetch. The browser tool gets through.
- **Michelin has a "Best Cocktails in Tampa" page and blocks every user agent tried**, 403 or
  an empty 202. It would be a strong admitting source if reachable.
- **Tampa Bay Times bar guides are paywalled** past the first venue, so they are near-useless
  for extraction.
- **Instagram bios are no longer readable logged out**, even with the `facebookexternalhit`
  user agent that worked yesterday. Meta now returns a stripped shell. Handles came from links
  on the venues' own sites instead, and the Detroit researcher had to drive the browser to read
  bios, which is what caught two of the three closures.

## The command

Run only on your go:

```bash
cd /Users/romanzelenka/barmagazine-next
node scripts/wave-insert.mjs "Claude outputs/us-metros-wave3.md" --apply
```

After the insert, and deliberately not before: geocode verification against city centroids
with the 40 km guard, the three city intros, adding the 34 slugs to `claude/indexing-queue.json`,
and confirming the city and type pages generate.

---

# Addendum, 19 September: Drastic Measures and Wild Child

You asked for both. One of them we already have, and the other turned out to be a much stronger
bar than the wave researcher recorded.

## Drastic Measures is already live, and nothing needs doing

It was admitted on **15 September by the James Beard wave 4**, four days before this wave was
built, which is why the wave's city+name dedupe never saw it: the researcher's candidate carried
`city: Shawnee`, and so does the live row, but the two runs never met.

The live row is **better than what the wave captured**, so there is nothing to merge in:

| | Live row | Wave researcher |
|---|---|---|
| Hours | `Tue-Thu 4pm-11pm; Fri-Sat 4pm-1:30am; Sun private events; Mon closed` | `4pm-11p Tues, Weds & Thurs; 4pm-1:30am Fri & Sat` |
| Email | `info@drasticbar.com` | none found |
| Accolades | **three** James Beard Outstanding Bar listings, 2023 nominee, 2024 and 2026 semifinalist | none recorded |

I have added nothing and changed nothing on it.

## Wild Child was genuinely missing, and is now row 34

Checked four ways before adding: website, street address, Instagram handle, and every bar in
Kansas state. The directory holds exactly two KS bars, Drastic Measures and John Brown's
Underground in Lawrence. The only near-name match, **Wild Child Wines in Lafayette, Louisiana**,
is a different bar.

Every field is from the venue's own site, fetched today: address, phone `(913) 444-0905`, and
hours `TUES- THURS 4-11 / FRIDAY 4-12 / SATURDAY 3-12`, house-formatted to
`Tue-Thu 4pm-11pm; Fri 4pm-12am; Sat 3pm-12am; Sun-Mon closed`. The site publishes no email, so
the row carries none rather than a guess.

### The admission evidence is national, not the city listing the researcher found

The researcher had it in on *Kansas City Magazine, KC Cocktail Bar Named Top 5 New Bars In
America*, which is a local outlet **reporting** a national list. I went and found the lists
themselves:

| Source | List | Size | Verified |
|---|---|---|---|
| **Punch** | The Best New Bars of 2023 | **5 bars, nationally** | Fox4 and Johnson County Post both name the five; Punch's own companion recipes piece links the list |
| **Bon Appetit** | The 11 Best New Bars in America, 2024 | **11 bars, nationally** | Johnson County Post, with the direct Bon Appetit URL |

Wild Child was the only Kansas bar on the Bon Appetit list. I checked both against the
qualification module rather than assuming: **each one passes on its own**, Punch because
`punch` is already in `SELECTIVE_NAMES`, Bon Appetit because 11 is inside `MAX_SELECTIVE_N`.

### Why they are recorded as sources and not accolades, which is a question for you

Honestly, these read more like accolades than listings. A five-bar national list is a stronger
signal than most things in the accolades column.

I did not promote them, because `ORG` in `wave-insert.mjs` holds only `totc` and `jbf`, and
adding Punch or Bon Appetit means **assigning them a score that ranks them against James Beard
across the whole directory**. That is a directory-wide ordering decision, not a row decision,
and not mine to make quietly. They are in `editorial_sources`, which is truthful and which
already qualifies the row. Say the word if you want them scored.

## The city field: I filed it as Shawnee, not Kansas City

You said they are in Kansas City, and in the metro sense you are right. I filed it as
**Shawnee** anyway, and here is the reasoning so you can overrule it.

- **Drastic Measures is already in the directory as `city: Shawnee`.** Wild Child is 0.6 miles
  away on the same suburb's main street. Filing it as Kansas City would put two bars a few
  doors apart on two different city pages.
- **Both venues print their own address as Shawnee, KS.** Neither says Kansas City. The metro
  claim lives in their domains and handles, `wildchildkc.com` and `drasticmeasures.kc`.
- **The live Drastic Measures description already solves this editorially**, and I mirrored it:
  it says the bar is *"in Shawnee, on the Kansas side of Kansas City"*. The city field stays
  accurate and the description carries the metro. Wild Child's now does the same.

**The alternative, if you want it:** move both to `city: Kansas City`. There is precedent for
metro rollup in the directory, Brooklyn addresses filed under New York and Collingwood under
Melbourne. It is two rows and I would do it in one pass. It is your call, not a thing I should
decide by picking whichever I typed first.

## The ownership story, stated plainly

You sent me the Kansas City Star reporting on allegations against **Jay Sanders**, who owns
both bars. I recommended holding, you said they are top cocktail bars and we should have them,
and that is your decision, so I have acted on it.

Three things worth having on the record:

1. **This was never really two decisions.** Drastic Measures has been live since 15 September
   through the James Beard wave, before you and I discussed it at all. The only live choice was
   Wild Child.
2. **Neither description mentions the allegations, and I think that is right.** A directory
   entry is about the drinking. Allegations are not findings, and a bar listing is the wrong
   place to adjudicate them.
3. **They are one decision going forward, not two.** Same owner. If the story develops, revisit
   both together rather than one at a time.

## Wave 3 is now 34 rows, still uninserted

Kansas City goes 12 to 13. QA is clean: 34 blocks, no duplicate slugs, no missing required
field, no em dashes, every description over 70 words. Dry run prints 34 payloads and writes
nothing.

```bash
cd /Users/romanzelenka/barmagazine-next
node scripts/wave-insert.mjs "Claude outputs/us-metros-wave3.md" --apply
```

Still waiting on your go.
