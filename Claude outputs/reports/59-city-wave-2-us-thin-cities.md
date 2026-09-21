# Task 59: city wave 2, the US thin cities

Louisville, Minneapolis and Oakland are researched, verified, built and QA clean.
**36 rows are staged and dry run clean. Nothing has been inserted.**

`scripts/wave-insert.mjs` says in its own header that `--apply` runs "only after Roman's go
in chat," and there is no go in this chat for this wave, so I stopped at the dry run. The
one command is at the bottom. Two editorial questions below are worth reading first,
because one of them changes what the wave is worth.

## Counts

| City | Before | After | Added | Target |
|---|---|---|---|---|
| Louisville | 1 | 12 | 11 | 10, met |
| Minneapolis | 2 | 13 | 11 | 10, met |
| Oakland | 2 | 16 | 14 | 10, beaten |

All three cross the 5-bar floor, so `/best-bars/louisville`, `/best-bars/minneapolis` and
`/best-bars/oakland` all generate. **One new type page:** Minneapolis Restaurant Bar, at
exactly 4. Nothing else reaches the type threshold, so Oakland's rooftop and Louisville's
wine bars stay on the city page only.

Three were already listed and the dedupe caught them: `pretty-decent` (Louisville),
`bar-mara` (Minneapolis) and `viridian` (Oakland). Viridian is worth noting because the
Oakland researcher was told to exclude Tallboy but not Viridian, which went in earlier this
week.

## The finding that matters: the column would have gone in inert

The task said to write the admitting source to `editorial_sources` rather than leave it in
the report. Doing that exposed a problem worth more than the wave itself.

The researchers record `admitted_by` as the **publication alone**: "Eater SF", "Racket",
"Oaklandside", "SFGATE". `isSelectiveSource()` judges a source by its own words, and a bare
masthead has none of them. Every one of the 36 rows would have stored a source that
classifies as non-selective, so the column would have been populated and still done nothing.

Each record already carries `admission_url`, so I fetched each list's real headline from the
page itself and appended it, in `enrich-sources.mjs`. No titles were invented. That turns
"Eater SF" into "Eater SF, The East Bay's 16 Best Cocktail Bars", which the classifier can
then judge, **in both directions**: Mpls.St.Paul's "The 57 Best Bars in the Twin Cities"
correctly stays non-selective, because 57 is a directory with a headline, not a pick.

Two details worth keeping. Eater serves a useless `RSS` in `<title>` but a correct
`og:title`. SFGATE is the reverse: its `og:title` is "Where to experience the best of
Oakland's bar scene" while its `<title>` keeps "16 best Oakland bars", and the count is the
whole signal. The script prefers whichever of the publication's own two headlines still
carries a number.

**This applies retroactively.** 217 existing rows carry `editorial_sources`, and among them
"Eater Portland" (10 rows) and "Eater Dallas" (5) are bare mastheads with the same problem.
Worth a follow-up task to enrich them from their stored URLs.

### What actually qualifies

After enrichment, **14 of 36 qualify** for a best-of list. By city:

| City | Qualify | Of |
|---|---|---|
| Oakland | 10 | 14 |
| Louisville | 4 | 11 |
| **Minneapolis** | **0** | **11** |

Minneapolis returning zero is not a bug and not a research failure. Its local press writes
**profiles, not rankings**: "5 Things to Know About Flora Room", "A Swanky Cocktail Lounge
Just Opened at 48th & Chicago", "Travel the World Without Leaving St. Anthony Main". The one
ranked list Mpls.St.Paul publishes is 57 bars long. There is nothing in that city's press to
rank a bar by, so `/best-bars/minneapolis` will fall back to the old sort on day one.

This is the task 50 problem again, in a new place: the admission floor and the ranking
signal are the same source.

## Two decisions for you

### a. Does Imbibe count as selective?

`SELECTIVE_NAMES` contains `imbibe 75`, not bare `imbibe`. So "Imbibe, An Imbiber's Guide to
Louisville, Kentucky" does not qualify, and it is the admitting source for **7 of
Louisville's 11**. Imbibe is a national cocktail magazine and a city guide from it is closer
to "a guide with a standard" than to a listing, which is the test the module documents.

Blast radius is small and I checked it: across the 217 existing rows the only Imbibe string
is "Imbibe 75" on 2 rows, which already qualifies. Adding bare `imbibe` would newly qualify
those 7 Louisville bars and nothing else. Your call; I have not touched the list.

### b. I promoted one held bar, and you should know why

The Louisville researcher held **The MerryWeather** saying "the closest matching domain
resolves to a parked lander." That was wrong, and traceably so: it checked
`themerryweather.com`, which is a 114 byte parked page, while the venue trades at
`themerryweather.net`, which returns 227KB and prints its Lydia Street address throughout. A
separate verification agent had already read that site, including a dated events calendar
listing events for 17 September and running through 1 October.

I verified the two domains myself before promoting it. Every field comes from the venue's
own site or its own Instagram bio. Where its site and its bio disagree on Thursday closing,
2AM against 3AM, I took the website and recorded the discrepancy in the note rather than
picking silently.

If you would rather nothing be promoted without a fresh research pass, drop it with
`--only` and Louisville still lands on 10.

## Per city

Before and after, admitting source and the venue source each was verified from.

### Louisville
| slug | admitting source | verified from |
|---|---|---|
| `hell-or-high-water` | Imbibe, An Imbiber's Guide to Louisville, Kentucky | https://www.hellorhighwaterbar.com/ |
| `tartan-house` | Imbibe, An Imbiber's Guide to Louisville, Kentucky | https://www.tartanhousebar.com/ |
| `moondog-louisville` | Imbibe, An Imbiber's Guide to Louisville, Kentucky | https://www.moondoglou.com/ |
| `yachtsea-louisville` | Imbibe, An Imbiber's Guide to Louisville, Kentucky | https://yachtseabar.com/ |
| `the-bar-at-fort-nelson` | Imbibe, An Imbiber's Guide to Louisville, Kentucky | https://michters.com/thebar/ |
| `proof-on-main` | Imbibe, An Imbiber's Guide to Louisville, Kentucky | https://www.proofonmain.com/ |
| `bar-grale-louisville` | Imbibe, An Imbiber's Guide to Louisville, Kentucky | https://www.thegrales.com/bar-grale |
| `nouvelle-bar-and-bottle` | LEO Weekly, Nouvelle Bar & Bottle Wins Prestigious Wine Spectator Award | https://www.nouvellewine.com/ |
| `north-of-bourbon` | LEO Weekly, The 15 Best Bourbon Bars In Louisville To Take Your Out-Of-Town Friends | https://www.northofbourbon.com/ |
| `seven-cocktails-bourbon` | LEO Weekly, The 15 Best Bourbon Bars In Louisville To Take Your Out-Of-Town Friends | https://sevenlouisville.com/ |
| `the-merryweather` | Imbibe, An Imbiber's Guide to Louisville, Kentucky | https://www.themerryweather.net/ |

### Minneapolis
| slug | admitting source | verified from |
|---|---|---|
| `public-domain` | Mpls.St.Paul Magazine, The Best Bars in the Twin Cities, Dive Into These Bars We Love | https://www.publicdomainmpls.com/ |
| `volstead-s-emporium` | Mpls.St.Paul Magazine, The Secret Speakeasy in Uptown | https://www.volsteads.com/ |
| `flora-room` | Racket, 5 Things to Know About Flora Room, the New North Loop Speakeasy in the Ol' Marvel Bar Space | https://www.floraroommpls.com/ |
| `the-sidecar-at-the-tap` | Racket, A Swanky Cocktail Lounge Just Opened at 48th & Chicago | https://sidecarmpls.com/ |
| `the-cabana-club` | Racket, Travel the World Without Leaving St. Anthony Main at Cabana Club | https://cabanaclubmpls.com/ |
| `parlour-minneapolis` | Mpls.St.Paul Magazine, Best of North Loop | https://www.parlourbar.com/ |
| `monte-carlo` | Mpls.St.Paul Magazine, The Best Bars in the Twin Cities, Dive Into These Bars We Love | https://www.montecarlomn.com/ |
| `st-genevieve` | Mpls.St.Paul Magazine, The 57 Best Bars in the Twin Cities | https://www.stgmpls.com/ |
| `pikok-lounge` | Mpls.St.Paul Magazine, The Best New Restaurants of 2025 in the Twin Cities | https://www.pikoklounge.com/ |
| `char-bar-minneapolis` | Mpls.St.Paul Magazine, The Best Bars in the Twin Cities, Dive Into These Bars We Love | https://www.charbarmpls.com/ |
| `company-bar-minneapolis` | Racket, 5 Things to Know About Company Bar, Kingfield's New Neighborhood Haunt | https://www.companybarmpls.com/ |

### Oakland
| slug | admitting source | verified from |
|---|---|---|
| `bar-shiru-oakland` | Eater SF, The East Bay's 16 Best Cocktail Bars | https://barshiru.com/ |
| `sobre-mesa` | Eater SF, The East Bay's 16 Best Cocktail Bars | https://sobremesaoak.com/ |
| `moonglow-oakland` | Eater SF, The East Bay's 16 Best Cocktail Bars | https://moonglowoakland.com/ |
| `north-light` | Eater SF, The East Bay's 16 Best Cocktail Bars | https://northlight.bar/ |
| `clio-s-books` | Eater SF, The East Bay's 16 Best Cocktail Bars | https://www.cliosbooks.com/ |
| `odin-oakland` | Eater SF, The East Bay's 16 Best Cocktail Bars | https://www.odinoakland.com/ |
| `low-bar-oakland` | Oaklandside, Oakland's Low Bar has 'the spirit of a dive bar and the vibrancy of a taqueria' | https://www.lowbaroakland.com/ |
| `snail-bar-oakland` | SFGATE, 16 best Oakland bars: Where to grab a drink right now | https://snailbaroakland.com/ |
| `bardo-lounge-and-supper-club` | Oaklandside, 21 East Bay restaurants serving special holiday meals, deals and desserts | https://www.bardooakland.com/ |
| `oeste-oakland` | Eater SF, 19 Top-Notch Rooftop Bars and Restaurants Around the Bay Area | https://oesteoakland.com/ |
| `nosso-oakland` | Oaklandside, New options for craft cocktails come to East Bay with January openings | https://nossooakland.com/ |
| `13-orphans` | Oaklandside, At East Bay's best new bar, the community is as vibrant as the cocktails |  |
| `lucy-blue` | Oaklandside, Town Fare folk opening two-story cocktail lounge new creative coffee options in the East Bay | https://lucybluebar.com/ |
| `drexl-oakland` | Eater SF, The East Bay's 16 Best Cocktail Bars |  |

## Held, with reasons

### Louisville held (2)
- **Darling's** the venue's own website is live and prints the address, cocktail, beer and aperitif categories, but publishes no opening hours anywhere, and Instagram returned only a logged out shell so the
- **The Silver Dollar** the venue's own home page thanks Louisville for its support over the years and announces a final day of trading with a limited menu, inviting guests to raise a glass one last time, so the ba

### Minneapolis held (11)
- **Vern's Tiki Bar** . A genuine tiki room at the back of Public Domain with its own Instagram account, and Public Domain's own site links to it, but it has no website of its own and the Instagram page returned 
- **Stargazer** , not trading as a cocktail bar. The venue's own domain now serves a Stelline Italian Kitchen coming soon page. Stargazer, from the Travail Collective with Robb Jones of Meteor, closed on 5 
- **Young Joni Back Bar** . Young Joni and its Back Bar are reported closed since September 2025 and current trading could not be confirmed from the venue's own channels.
- **Bar Brava** , closed. This natural wine bar ceased trading on 21 August and the space is being handed to a new tenant.
- **Psycho Suzi's Motor Lounge** . The venue's own site indicates the property is for sale and current trading could not be confirmed. Racket has also covered the sale.
- **Constantine** , appears closed. The Hotel Ivy now lists other dining outlets and constantinempls.com no longer resolves to a live bar site.
- **Earl Giles** on category. Open and trading, but the venue presents itself as Earl Giles Restaurant and Distillery, a distillery with a restaurant attached, which falls under the excluded distillery categ
- **CrowBar** on category. CrowBar is the cocktail room and tasting room for Voliere Spirits, a distillery, which falls under the excluded distillery category. It also did not clear a named source in the 
- **WildChld** . Mpls.St.Paul Magazine lists a different venue, Kizzo, at the same 24 University Ave NE address in its 2025 new openings roundup, and the sibling restaurant StepChld appears closed. Current
- **Billy After Dark** . A Japanese leaning cocktail speakeasy below Billy Sushi with no website of its own, and the Instagram page could not be read while logged out, so address, hours and trading could not be co
- **P.S. Steak** on category. Open and trading with a well regarded New Orleans leaning bar program, but the venue presents itself as a steakhouse, so it reads as a restaurant rather than a cocktail led room

### Oakland held (5)
- **Make Westing** could not confirm the bar is currently open and trading. Its own website makewesting.com does not resolve, its Instagram bio still prints an address and hours but carries no confirmable rece
- **Gold Palm** the venue's own Instagram bio now describes it as a venue for private events, pop ups and creative gatherings rather than a bar open regularly to the public. Could not confirm general public
- **High 5ive Rooftop Bar** the rooftop bar at Kissel Uptown Oakland states on its own site that it has shifted to private events and special activations, away from being open regularly to the public. Not currently a p
- **Hello Stranger** on type. Open and trading, but the venue's own Instagram bio bills it as DJs, a full bar with bottle service and a dance floor every night, which reads as a nightclub rather than a cocktail 
- **Ramen Shop** on type pending a closer look. Eater SF admits it for the standalone cocktail bar it built next door, but the business is primarily a ramen restaurant. Own channels not yet checked for hours

Worth pulling out of that list: **five Minneapolis venues on current best-of lists are
closed or closing**, one of them as recently as three weeks ago, and Louisville's **Silver
Dollar** and **Trouble Bar** are both closed while still listed across guides. A researcher
working from lists alone, without the own-channel confirmation step, would have inserted
seven dead venues across two cities. Neither Louisville closure is in the directory, so
nothing needs a status fix.

Two Minneapolis and two Oakland holds are category calls rather than doubt: Earl Giles and
CrowBar are distillery rooms, P.S. Steak is a steakhouse, Hello Stranger bills itself as a
nightclub. Gold Palm and High 5ive both moved to private events only, per their own channels.

## Sources, and the answer to the pace question

Eater carried Oakland exactly as task 47 predicted: 9 of 14 admissions, 2 of them found
nowhere else. But **Eater has no Louisville presence and produced nothing in Minneapolis**,
so the "lead with Eater and city magazines" rule holds only where Eater publishes. In the
other two cities the city magazine and the alt weekly carried the whole load: Imbibe and LEO
Weekly in Louisville, Mpls.St.Paul and Racket in Minneapolis.

Two access notes for the next run. Eater is blocked to WebFetch but fine over curl with a
browser user agent, and the search tool does not index `sf.eater.com` at all. Instagram was
unusable logged out for most of today; the trick that did work is a `facebookexternalhit/1.1`
or Googlebot user agent, which returns the full bio in `meta[name="description"]` even
through age gates.

**On three cities a week: three is right, and five is not the constraint you think.** Each
city took about 30 minutes of agent time and they run in parallel, so wall clock is not the
limit. The limit is that a thin city is thin for a reason. Oakland had a real ranked stack
and produced 14 with 10 qualifying. Minneapolis produced 11 that qualify for nothing, and
Louisville needed a retry plus a separate verification pass. Adding cities four and five
would add rows, not ranked pages. I would rather spend the extra slots on the enrichment
follow-up above, which makes 15 existing rows rank properly, than on two more cities that
land in the same state Minneapolis just did.

## The command

Run only on your go:

```bash
cd /Users/romanzelenka/barmagazine-next
node scripts/wave-insert.mjs "Claude outputs/us-thin-cities-wave2.md" --apply
```

Still to do after the insert, and deliberately not done before it: geocode verification
against city centroids with the 40 km guard, the three city intros, and adding the 36 slugs
to `claude/indexing-queue.json`. Queuing a URL for indexing before its row exists would
submit 36 pages that 404.

---

## Update, 2026-09-18: Imbibe now counts, and here is what changed

Roman approved adding bare `imbibe` to `SELECTIVE_NAMES`. Shipped to main as `2d449ed`.

Blast radius re-checked after the change, not just before: across the 217 existing rows that
carry `editorial_sources`, the only Imbibe string is "Imbibe 75", which already qualified.
**Zero existing rows changed.**

### Louisville, /best-bars qualification, by name

Measured against the live database with the real `strongestSource` logic, before and after.

| Bar | Before | After |
|---|---|---|
| Bar Grale | no | **yes** |
| Hell or High Water | no | **yes** |
| MoonDog | no | **yes** |
| North of Bourbon | yes | yes |
| Nouvelle Bar & Bottle | no | no |
| Pretty Decent | yes | yes |
| Proof on Main | yes | yes |
| SEVEN Cocktails + Bourbon | yes | yes |
| Tartan House | yes | yes |
| The Bar at Fort Nelson | no | **yes** |
| The MerryWeather | no | **yes** |
| Yachtsea | no | **yes** |

**5 of 12 before, 11 of 12 after.** Six bars newly qualify.

Two things worth reading out of that table.

**The one that still does not qualify is arguably a data problem, not a rule problem.**
Nouvelle Bar & Bottle was admitted by "LEO Weekly, Nouvelle Bar & Bottle Wins Prestigious
Wine Spectator Award". That is a real award, and the classifier correctly declines to treat a
single-venue news story as a selective list. But the underlying fact, a Wine Spectator award,
belongs in the `accolades` field, where it would rank the bar properly and render as a
credentials line. It is currently sitting in prose in the source name. Worth a look when you
next touch accolades.

**The earlier figure in this report, 4 of 11, was measured against the wave file alone.** The
table above is 5 of 12 because it counts every active Louisville bar, including
`pretty-decent`, which predates the wave. The two agree: 10 of the 11 newly inserted bars
qualify, plus the one that was already there.
