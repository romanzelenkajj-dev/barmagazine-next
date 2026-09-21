# Task 86, written: 97 bars admitted, 65 sources appended, 16 held

Follows report 86. Everything here is applied.

---

# The guard went in first

`src/lib/hidden-sources.mjs`, wired into `wave-insert` as a **refusal with no override**. Unlike a
venue type there is nothing for a person to rule on: the word is not allowed in visitor copy and
the fix is to reword the sentence.

It refuses the **name** and the **score**, because dropping "Falstaff" and keeping "98 points"
still tells any reader who knows the guide. Patterns: a two or three digit points score, a glasses
rating spelled or numeric, and a bare "Bar Guide 20xx".

**Proved before trusting it with a hundred descriptions**: fed it one row naming the guide and one
quoting only the score. It refused both and passed the clean row. 11 tests, including both real
violations as fixtures.

It earned itself almost immediately. **D-Bar's own Ritz-Carlton page quotes its Falstaff award** in
the copy surrounding the facts, which is the exact route both earlier violations took.

---

# What was written

| | |
|---|---|
| Threshold cities inserted | **29** |
| Vienna inserted | **6** |
| Everything else inserted | **62** |
| **Total new bars** | **97** |
| Falstaff URL appended to existing rows | **65** |
| Held | **16** |

**Every one of the 97 geocoded to `geo=address`.** Not one centroid fallback across three waves,
so the loud-failure block never printed. **Zero guard refusals**, because the descriptions were
written clean rather than cleaned up afterwards.

## Cities that crossed MIN_CITY_BARS

| City | Before | After |
|---|---|---|
| **Munich** | 0 | **8** |
| **Cologne** | 1 | **8** |
| **Hamburg** | 1 | **8** |
| **Basel** | 1 | **5** |
| **Helsinki** | 3 | **6** |
| **Vienna** | 6 | **12** |
| Geneva | 0 | 3 |
| Frankfurt | 0 | 3 |
| Stuttgart | 0 | 3 |

Vienna is the one to watch: it had **zero merit bars** while its cocktail-bars page was already
drawing impressions, and it now has twelve.

Geneva, Frankfurt and Stuttgart do **not** cross. Each is at 3, so each needs two more from a
qualifying source before it earns a page. Every bar admitted there still counts toward that.

---

# One more match, found late

**Jerry Thomas Speakeasy (Rome) is our existing `jerry-thomas-project`.** Same address, Vicolo
Cellini 30, same website. My name matcher missed it because the names differ, and the duplicate
check caught it only because I ran the new candidates against the live directory by address before
inserting.

It got the source appended rather than a new row. **The split is 65 listed / 114 not, not 64/115.**

---

# The 16 held, each with its reason

## No website at all (5)

Delano Cocktailbar (Nice), CV Distiller (Athens), Speakeasy The Pharmacy (Málaga), Woda Ognista
(Warsaw), Mondhügel Bar (Berlin). Falstaff lists no site and I found none. Each needs one search
against its own name.

## Restaurant-first by its own description (5)

The Fabios test, which is your own: a `/bars/` URL on Falstaff does not override what the venue
says it is.

| Bar | Its own title |
|---|---|
| Bambou Speakeasy (Geneva) | "Chez Piaf - **Restaurant**" |
| Schoellmanns Bar & Küche (Offenburg) | "**Restaurant** Schöllmanns Offenburg" |
| Eatrenalin (Rust) | "Fine Dining **Restaurant** Eatrenalin beim Europa-Park" |
| Clouds Bar (Zurich) | "CLOUDS | **Restaurant** im Prime Tower Zürich" |
| Kombo (Trondheim) | domain is **komborestaurant**.no |

Plus **Fabios (Vienna)** itself, held earlier on the same test.

## The page does not evidence the bar (4)

**MO Bar** and **Rivage Café** (Geneva), **Les Bars du Negresco** (Nice) and **W Lounge** (Rome).
In each case the link goes to a hotel group's site and lands on a homepage or a different outlet.
Les Bars du Negresco is the clearest: the bar URL redirects to "Le Versailles", the hotel's
restaurant. Rivage Café has a second problem, that Falstaff's own slug for it is
`albertines-im-beau-rivage-geneve`, so the guide holds two names for one entry.

## Cannot verify as a distinct bar (1)

**Den Grimme Ælling (Oslo)** carries **Svanen's address and Svanen's website**, Karl Johans gate 13
and svanenoslo.no, and svanenoslo.no makes no mention of it. Either it is a second room the site
does not name or the guide is holding a stale entry. Not admitted, not merged, flagged.

---

# Two bugs in my own tooling, caught before they wrote anything

**`IFS=$'\t'` collapses repeated tabs.** Bash treats tab as whitespace in IFS, so five rows with an
**empty website column** shifted the Falstaff URL into the website field. The verification then
curled falstaff.com for those five and reported Cloudflare 403s, which reads exactly like a
blocked venue site. Had I trusted it, five bars with no website would have looked merely blocked.

**A name-keyed lookup collided.** Two bars in this set are called **Eden Bar**, in Ascona and
Zurich. Keying the Falstaff URL by name alone silently gave Ascona the Zurich URL. It is keyed on
name and city now, and **throws** if two keys collide rather than keeping the last one.

I also ran `--apply` twice on the last wave by putting a second invocation in the same command.
**Nothing was duplicated**: 1,584 + 62 = 1,646 active, exactly right, because the create path
rejects an existing slug. It should not have happened and the arithmetic is the proof it did no
harm.

---

# "Falstaff" in user-facing output

**0 rows** across `description`, `short_excerpt`, `name`, `specials` and `status_note`, checked
after every wave.

`editorial_sources` carries it on 451 rows, which is the point: it is the admission record, it is
never scored or rendered as a tile, and the only thing that reads it is the merit band.

---

# Where the directory stands

| | |
|---|---|
| Active bars | **1,646** |
| Rows with `editorial_sources` | 451 |
| Build | 830 pages, up from 782 |

Next: task 97, the 33 bars without an address.
