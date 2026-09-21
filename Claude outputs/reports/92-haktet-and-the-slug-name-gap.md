# Task 92: Häktet, and whether the dropped word is a pattern

Read-only except for the one row you approved. **Nothing else changed.**

---

# 1. Häktet, fixed

## What their site says

`haktet.se/vaenster` is unambiguous. **Häktet** is the restaurant and `vaenster` is one of five
rooms in its own navigation:

> Vänster · Chef's Table · Matsalen · Köksbaren · Chambre Séparée

The page's `<title>` is **Häktet**, its `<h1>` is **Vänster**, and the body calls it *"vår speak
easy-bar Vänster"*. So you were right that neither word alone is the name.

**They never write the two words as one string.** I checked the raw HTML for it specifically: my
first pass reported a match and that was my own tag-stripping joining a logo to a heading, not
their text. So "Häktet Vänster" is not available as a quotable name from the source.

## What I stored, and why

**`Vänster at Häktet`**

That is the directory's own established convention for a bar inside a named venue, not something I
invented for this row. **23 rows already use `<Room> at <Venue>`**:

> Gold Bar at EDITION · Lobby Bar at The Hotel Chelsea · Raines Law Room at the William ·
> The Library Bar at The Lanesborough · The Roost Bar at Brennan's · Vesper at The Dorchester ·
> The Bar at Willett · Bang Bang Bar at Teeling Distillery, and fifteen more

Both words are theirs and the hierarchy is theirs. The convention supplies only the joining word.

It is one PATCH on `bars.name` for `haktet-vanster`. Slug, website, address and coordinates are
untouched, so nothing redirects and no link breaks.

## Verified against the actual search

| Typed | Finds it now |
|---|---|
| `haktet` | **yes** |
| `häktet` | **yes** |
| `vanster` | **yes** |
| `Vänster at Häktet` | **yes** |

Before the change, `haktet` returned nothing.

## The mechanism, confirmed in code

`searchOrFilter()` in `src/lib/ascii-fold.ts:61` builds exactly two clauses:

```
name_ascii.ilike.%<q>%, city_ascii.ilike.%<q>%
```

**The slug is never searched.** So a name that has lost a word is not partially findable, it is
invisible on that word, and the slug carrying it does nothing. That is why this class of row is
worth hunting rather than shrugging at.

**One limitation I did not fix.** Typing `haktet vanster` still returns nothing, because the
filter is a single substring match and our stored order is the reverse. That is true of every
multi-word name typed out of order (`Gold Bar EDITION` fails the same way) and is a property of
substring `ilike`, not of this row. Fixing it means token-wise AND matching. **Flagging, not
changing.**

---

# 2. Is it a pattern? Scanned all 1,641 rows

## Two false starts worth stating, because they change the number

My first scan flagged **113 rows** and most of them were my own comparison, not the data. The
slugifier that produced these slugs does two things mine did not:

- an apostrophe becomes a hyphen: `Angel's Share` → `angel-s-share`
- an accented letter is **dropped**, not transliterated: `Röda Huset` → `r-da-huset`,
  `Sastrería` → `sastrer-a`

Both make a perfectly complete name look truncated. Comparing against **both** slugifiers cuts the
real list to the numbers below.

## The result

| | Rows | |
|---|---|---|
| Slug matches the name exactly | **1,375** | fine |
| Slug carries extra words **at the end** | 187 | the city-suffix convention, fine |
| Name is **richer** than the slug | 73 | fine, and the good direction |
| **Slug STARTS with a word the name lacks** | **6** | the Häktet shape |

## The six, checked one by one against their own sites

| Slug | Stored name | Their site says | Verdict |
|---|---|---|---|
| `haktet-vanster` | Vänster | Häktet → Vänster | **the real one. Fixed above.** |
| `bar-hommage` | Hommage | title: **HOMMAGE** | **name is correct**, the slug adds "bar" |
| `bar-de-vie` | De Vie | title: **De Vie**, domain `devie.bar` | **name is correct** |
| `the-lucky-liquor-co` | Lucky Liquor Co. | **The Lucky Liquor Co.** | drops a leading "The" |
| `the-punch-room-at-edition` | Punch Room | matches its Madrid, Rome and Tokyo siblings | consistent, leave it |
| `cocktail-gastronomy-kyu-yasui-tokyo` | KYU YASUI | slug carries a Google listing descriptor | **name is correct** |

**Häktet is the only row of its kind in the directory.** Four of the other five have the correct
name and an over-decorated slug, which is the harmless direction. The fifth is a missing "The".

**So: not a pattern.** One row, not a wave. I had expected worse.

## What the scan did surface, which is a different problem

Not the shape you asked about, so **nothing is changed and I am reporting it only**.

**a. Nine rows where the slug names a different bar than the name does.** These read like renames
or rebrands that updated one field and not the other:

| Slug | Stored name | City |
|---|---|---|
| `nomad-bar-las-vegas` | The Reserve Bar | Las Vegas |
| `teeling-whiskey-bar` | Bang Bang Bar at Teeling Distillery | Dublin |
| `mag-cafe` | Mag i Navigli | Milan |
| `nouveau-vague` | Bar Nouveau | Paris |
| `blind-duck` | The Blind Duck (website `raffles.com`) | Boston |
| `canopy-lounge-rooftop-bar-kl` | Canopy Lounge by Tigerbay | Kuala Lumpur |
| `elysian-bar-budapest` | Elysian Budapest | Budapest |
| `lovo-cocktail-bar-madrid` | Lovo Bar | Madrid |
| `isa-cocteleria` | Isa Restaurant & Cocktail Bar | Madrid |

The last four are benign (the name is simply fuller or shorter). The first five are worth a look:
a slug that says `nomad` on a row named The Reserve Bar is either a rebrand we half-recorded or a
row pointing at the wrong venue.

**b. About a dozen slugs built from a Google listing title rather than a name.** They work, they
are just ugly and long, and they are permanent because changing a slug costs a redirect:

```
scentique-cocktail-bar-a-bold-fragrance-an-unforgettable-impression
lost-my-voice-bar-breakfast-barsnacks-wine-and-drinks
lonely-avenue-premium-spirits-cocktail-bar-in-rome
shosin-art-club-vzdelanie-od-svetovych-mentorov
mariposa-negra-cocktail-bar-cocteleria-artesana
```

The names on all of these are correct, so search works. **I would leave them.**

**c. Two rows that look like data errors, unrelated to naming.**

- `coa-shanghai-1773995982` carries a raw timestamp in the slug.
- `svanen-stockholm` is stored with city **Oslo**. One of the two is wrong.
- `shosin-art-club-...` has a Slovak listing description and city **Rio de Janeiro**.

**Say the word on any of these and I will take them; none is touched.**

---

# 3. What I would do next, one line

Nothing here is urgent. The one thing I would actually pick up is **(a)**, the five rows where the
slug and the name disagree about which bar it is, because unlike a long slug that is a row we may
be describing wrongly to a reader.
