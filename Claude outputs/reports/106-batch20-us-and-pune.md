# Task 106: batch 20 (US harvest from Wave B) built and dry-run clean, NOT armed; Pune stays at seven, 2026-09-22

## 1. Batch 20: 54 bars, dry run clean, not armed

Candidates came from `scripts/outreach-candidates.mjs` (active, unclaimed, not in the sent log,
not parked, not opted out): 58 United States rows with an address, all from task 105 (56 from
Wave B, plus The Jungle Bird and The Roost in Sacramento from Wave C). None of the 58 sits in an
armed batch 18 or 19 list, so the 88-bar gap that bit batch 18 does not recur here.

### The eyeball: four parked

Read against the venue's own site and the domain the address sits on, the same test as batch 18.

| Bar | Address | Verdict |
|---|---|---|
| Bloom's (Baltimore) | info@hotelulysses.com | **Parked.** Hotel Ulysses' general inbox; the bar's site is on ash.world. |
| The Roof at The Durham | info@thedurham.com | **Parked.** The Durham Hotel's general inbox. Same domain as the bar's page, which is the hotel-bar trap batch 18 found. |
| Society Lounge (Cleveland) | events@hangry-brands.com | **Parked.** The operating group's events desk, different domain. |
| Flower on Freeman (Cleveland) | mc@luxecleveland.com | **Parked.** A person at Luxe, the group's other venue, different domain. |

Reasons and addresses are in `outreach/parked.txt` under a dated header.

Two more are venue-named aliases on an operator's domain, the class you unparked for batch 18
(Lyaness, La Commune), so they stay in and are flagged rather than parked: **The Conspiracy**
(conspiracy@nwravin.com; nwravin.com answers 405 to a HEAD and nothing else) and **Copper
Common** (common@copperslc.com, the Copper group's domain). Say the word and either comes out.
The rest match the venue's own domain or are the venue's published Gmail.

### The dry run

`node scripts/send-upsell.mjs --batch batch20-us $(cat outreach/batch20-us.slugs)`: node exit 0,
**54 to send, 54 would send**, no refusals, nothing already contacted, nothing closed, no
corporate-domain hits. Slug list: `outreach/batch20-us.slugs`.

The 54, by city:

- **Baltimore:** The Coral Wig
- **Birmingham:** Juniper, Pilcrow Cocktail Cellar, The Collins Bar, Tucana Tiki Bar
- **Charleston:** Doar Bros., Last Saint, The Gin Joint
- **Charlotte:** Humbug, Idlewild, Merchant & Trade, The Conspiracy
- **Cleveland:** Cloak & Dagger, Porco Lounge & Tiki Room, The Velvet Tango Room
- **Columbus:** Law Bird, The Citizens Trust
- **Durham:** Alley Twenty Six, Arcana
- **Houston:** Angel Share, Houston Watch Company, The Toasted Coconut
- **Milwaukee:** At Random, Lost Whale, The Mothership
- **Nashville:** Coral Club, L.A. Jackson, Love's Alibi, Martha My Dear, Rosemary & Beauty Queen
- **Pittsburgh:** Bar Botanico, Bridges & Bourbon, Hidden Harbor, Lorelei, The Warren
- **Providence:** Loma, Marcelino's Boutique Bar, The Eddy, The Red Door, The Walnut Room
- **Raleigh:** Foundation, The Blind Barbour, William & Company
- **Sacramento:** The Jungle Bird, The Roost
- **Salt Lake City:** Copper Common, Melancholy
- **Savannah:** Alley Cat Lounge, Savoy Society
- **St. Louis:** Good Company, Lazy Tiger, None of the Above, Planter's House, Thaxton Speakeasy

### The window you named

Tuesday 2026-09-29 09:00 PT (12:00 ET). For the record, the batch 19 windows already armed are
Europe A Tue 09-29 00:30 PT, Asia Tue 09-29 21:00 PT, Americas **Wed 09-30** 09:00 PT, Europe B
Thu 10-01 00:30 PT; so batch 20 at 09-29 09:00 PT lands a day before batch 19 Americas, on the
same calendar day as Europe A and Asia. Nothing is armed. When you say go, the command is:

```
outreach/arm-window.sh batch20-us w1 09 29 09 00 outreach/batch20-us.slugs
```

Other non-US candidates with an address now sit in the pool for a later batch (Canada 2,
Colombia 1, France 1, Germany 3, India 4, Italy 4, Japan 1, Norway 3, South Africa 3,
Switzerland 5, UK 3, Vietnam 1, most of them from Waves C and D); not touched.

## 2. Pune: stays at seven, and here is why

The directory has Cobbler & Crew, Elephant & Co., Juju, Malaka Spice, Paasha, Qora and Soy Como
Soy. Beyond the award lists I read Condé Nast Traveller India (its only Pune bar piece is on
Cobbler & Crew, already in), LBB's three Pune lists (best cocktails, best bars, newest cocktail
bars, January 2026), and 50 Best Discovery's Pune page (one entry, Ukiyo, a restaurant). There
is no Time Out Pune. Every candidate that surfaced then went to its own site and Instagram:

| Candidate | Why not |
|---|---|
| Filament Cocktail Bar (Baner, Wakad, Kalyani Nagar) | Cocktail bar by name and LBB's pick, but its own site and Instagram bio give only the three neighbourhoods, no street, and the site's first line is "where fine dining meets spirited evenings" with DJ nights. **Held on the address test.** |
| Code, The Speakeasy Bar (Kothrud) | "Pune's first speakeasy bar, an intimate bar and all-day kitchen" on Instagram; no website, no street in the bio. **Held on the address test.** |
| Ouza Cocktail Bar & Kitchen (Baner) | Its domain ouza.in now 404s; the Instagram bio leads with Mediterranean, Asian, Modern Indian food and beers on tap. Out. |
| Asilo (The Westin) | Own site's title is "Luxury Asian Restaurants in Pune"; address and hours are on it, but it calls itself a restaurant. Out on venue type (and its email is on a Marriott domain, partner-track). |
| Al Di La (Conrad), Tsuki, Farro, Lucia, Trooh, The Daily All Day, Tao Fu | Restaurants by their own words (Italian rooftop, pan-Asian, fine dining, all-day cafe). Out. |
| Millers, Publiq, L7, High Spirits | Club, nightclub, nightclub, live-music venue. Out. |
| Toit, Oi Brewhouse, Independence, Nincasa | Breweries. Out. |
| Swig Bar & Eatery | A twenty-year-old neighbourhood bar and eatery with nightly events; no list you named puts it forward as a cocktail bar. Out. |

So no bar I can defend takes Pune past seven. The two held rows would go in the moment either
publishes a street on its own channels; Filament's Kalyani Nagar branch is the one worth asking
about, since LBB calls it a cocktail bar and the site calls it a high-energy cocktail bar in the
party district.

## Files

`outreach/batch20-us.slugs` (54), `outreach/parked.txt` (four lines), this report. One push.
Nothing sent, nothing armed.

## Armed (2026-09-23, on Roman's go in chat)

`outreach/arm-window.sh batch20-americas w1 09 29 09 00 outreach/batch20-americas.slugs`: 57
recipients, LaunchAgent `com.barmagazine.batch20-americas-w1` loaded for Tuesday 2026-09-29 09:00
PT. Dry run re-run just before arming: 57 to send, no changes since the list was posted. The
generated runner retries on any non-zero exit (three attempts, 10 then 30 minutes apart), safe
because send-upsell.mjs skips anything already in `outreach/sent-log.txt`. The one-shot deletes its
plist before unloading, so it cannot fire twice.
