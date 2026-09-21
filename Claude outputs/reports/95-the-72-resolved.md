# Task 95: the 72 inactive rows resolved, plus the importer guard and the test gate

All five groups actioned. **72 rows down to 23 unresolved stubs**, and every decision below is
backed by the venue's own channel rather than by inference.

---

# PROCESS first, because it guards everything else

`npm run verify` is now the single gate (`scripts/verify.sh`).

```bash
npm run verify
```

`set -euo pipefail`, and it **prints its own three-line summary**, so there is no reason to pipe
it to `tail`. That is the actual fix: a pipe I did not need is what masked the failing test.

Proof the mechanism does what it claims:

| | exit code |
|---|---|
| `set -o pipefail; false \| tail -1` | **1** |
| `false \| tail -1` | 0, the bug |

It also treats `next build` correctly: the exit code **and** a grep for "Failed to compile",
because that build prints "Compiled successfully" before it type-checks.

---

# A: closed. 18 rows, and the five unverified were worth checking

**Twelve dated and sourced** set to `permanently_closed` as approved.

**The five I was told to verify first split three ways, and one was not closed at all:**

| Row | Evidence | Outcome |
|---|---|---|
| Analogue Initiative | its domain is now a dead Wix "ConnectYourDomain Error" | **closed** |
| The Honey Moon | domain lapsed, now 301s to an unrelated charity site | **closed** |
| Little Cooler | its own Instagram bio: **"POP UP HAS ENDED"** | **closed** |
| Berlin Bar | no web presence, no dated source either way | **left alone, not closed** |
| **Oriental Elixir** | its **own Oddle page was taking bookings today** | **OPEN, reinstated** |

Oriental Elixir was hidden because the host venue's site did not mention it. Its own reservation
system lists 294 River Valley Road, inside The Spiffy Dapper, which is exactly the address we
already held. It is now live with a description, hours, coordinates and a reservation link.

**The Wise King** set to `temporarily_closed` **and re-activated**, per the standing rule that a
temporarily closed bar keeps its profile and carries a notice.

---

# B: contaminated. The relocate test could not even be applied to most of them

**21 of the 23 have no address at all.** Your condition was "if the address points to a real
cocktail bar in the OTHER city" — with no address there is nothing to point anywhere, so those
delete. Snapshot written first to
`Claude outputs/snapshots/2026-09-21-group-b-contaminated-rows.json` (23 rows, 32 KB).

**22 deleted. One relocated.**

## Radio Bar: relocated, exactly as you predicted

Its address was **Rruga Ismail Qemali, Pall 29, Ap 1, Tiranë**, a real Albanian address. Radio Bar
is a real Blloku cocktail bar, open since 2009, with the vintage radios that name it and a list
built on raki (a blackberry Rakberry, a Balkan Collins on juniper raki and Albanian gin). **We
already list Tirana** (Nouvelle Vague, 800 m away), so it meets admission.

Now live: city and country corrected, precise geocode (`address` granularity), description, hours
and short excerpt written.

## Two "contaminated" rows were plain duplicates

**The Bar in Front of the Bar** is already live in **Athens**, and **Victor Audio Bar** is already
live in **Buenos Aires**. So deleting those rows loses nothing at all.

## Deleting does lose four admission candidates, and I want that on the record

Konbini (Medellín), Anthology (Singapore), Peek-a-Boo (Bangkok) and Toast & Tonic (Bengaluru) are
real bars we do **not** list, whose only trace was a contaminated row with no data. Deleting is
right; they are **admission candidates for a future wave**, not fixes.

---

# C: the accolade importer guard, built

`src/lib/venue-type-guard.mjs`, wired into `scripts/wave-insert.mjs`, with 8 tests.

**It holds the row and prints why. It never drops it**, which was your requirement and is also the
failure mode that produced the batch 15 mail-out:

```
HOLD onyx-coffee-lab: looks like a coffee roaster or coffee house (matched "Coffee Lab").
      It is here on an award, and an award is not an admission rule.
      NOT inserted and NOT dropped. Decide, then re-run with --allow-venue-type
      if it really is a bar we list.
```

Driven against a real wave file: it **held both rows that actually got in this way** and let a
genuine cocktail bar through untouched. Held rows are listed again at the end of the run so they
cannot scroll away, and `--allow-venue-type` is the override once a person has ruled.

It is deliberately keyword-based and shallow, so it is only ever wrong in ways you can read off
the matched word, which it prints. It consults the description **only** when the type is not one
we list, so a cocktail bar that roasts its own coffee is not held.

**Onyx Coffee Lab and Bow & Arrow Brewing left inactive**, as instructed.

---

# D: five duplicates merged

Each confirmed by an **identical address**, not by name:

| Dead | Live | Shared address |
|---|---|---|
| harry-s-bar | harrys-new-york-bar | 5 Rue Daunou, 75002 |
| liz-cocktails-co | liz-cocktail-e-wine | Rua Dias Ferreira 679A |
| zapote-bar | zapote-bar-playa-del-carmen | Carretera Federal Km 298 |
| library-bar-at-leela-palace | the-library-bar | The Leela Palace, Chanakyapuri |
| punch-room-at-edition | punch-room-tokyo | The Tokyo EDITION |

301s added, FK-checked, deleted.

---

# E: Beaufort Bar is back, and the four known names are mostly gone

## Beaufort Bar: reinstated, and it needed two fixes first

The Savoy's own page now lists **"Tuesday - Saturday 5pm - Late"**. It has reopened. Our row still
said *"Temporarily closed, exclusive hire only"* in `opening_hours`, **and that string contained
an em dash**, which would have shipped a house-style violation the moment it went live. Hours,
description and excerpt rewritten; it is live.

## The four known names

| Bar | Finding |
|---|---|
| **Tippling Club** | **Closed 31 December 2024** after 17 years. Moved to A. |
| **Scout** | **Closed 11 July 2021**, Whiley and Woods' Hackney bar, did not survive the pandemic. Moved to A. |
| **Bar Agricole** | **Closed July 2024 and will not reopen**, per the owner. Moved to A. |
| **Café Pacifico** | The only Paris venue of the name is a Tex-Mex restaurant on Bd du Montparnasse. **Not verifiable as a cocktail bar: stays hidden.** |

Three of the four "known names" were closed, which is the likeliest explanation for the rest of
the group too.

## 19 stubs remain

Empty rows with no website and no address. Each needs its own check and none should be reinstated
as a stub. **Nothing done to them.**

---

# COA: both rows, and the address was not the stale part

**Names matched.** The bar's own site renders the brand as **COA** (page title "COA Hong Kong",
logo alt text the same), so both rows are now `COA`, with the city telling them apart.

**The address is correct and current, and the hypothesis was inverted.** Two independent sources:

- 50 Best Discovery: *"580 Fuxing Rd(M), Huangpu, Shanghai"*
- NOMFLUENCE: *"580 Middle Fuxing Road, **previously located in Jing'an on Jiaozhou Road**"*

So **Jing'an is the old site**. The bar was cleared out of Jiaozhou Road in February 2024 for a
municipal renewal project and reopened on 5 July 2024 at 580 Middle Fuxing Road.

**The description was the stale part**, and it is rewritten. It described the old three-floor
Jing'an house (La Cantina, El Salon, El Atico); the current venue has **four floors**: Taqueria,
Cantina, Salón and a top-floor Mezcaleria.

**Coordinates left alone, deliberately.** Mapbox returns a `region,place` centroid for that
address, which is the task 89 trap. The stored point sits 215 m from Speak Low at 579 Fuxing Zhong
Lu, across the street from 580, so it is already right and re-geocoding would have made it worse.

---

# Where the numbers landed

| | Before | After |
|---|---|---|
| Active | 1,545 | **1,548** |
| Inactive | 72 | **42** |
| Inactive **and** `status: open` | 72 | **24** |
| `permanently_closed` | 0 | **18** |
| `temporarily_closed` | 1 | **2** |

The 24 still reading inactive-and-open are the 19 unchecked stubs, Berlin Bar, Café Pacifico, and
the two excluded venue types that are supposed to stay that way.

Gate passes: 421 tests, build clean, 783 pages.
