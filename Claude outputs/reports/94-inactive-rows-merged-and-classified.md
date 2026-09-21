# Task 94: Svanen redone, 23 merges, and the remaining inactive rows classified

**Your correction stands and I took the wrong route to it.** I renamed and re-geocoded
`svanen-stockholm` without checking `is_active`, and reported `nouveau-vague` as a live coverage
question when it was a dead duplicate. `is_active` first, every time.

---

# 1. Svanen: undone and redone

| | |
|---|---|
| `svanen-stockholm` | now 301s to **`svanen`** |
| `svanen-oslo` | now 301s to **`svanen`** (the slug I wrongly created) |
| dead row | **deleted** after FK check: 0 `bar_claims`, 0 `owner_submissions` |

**The live `svanen` row already held the correct Oslo coordinates**, 59.912419 / 10.744666, which
is exactly what Karl Johans gate 13 geocodes to. My work went onto the dead row and was wasted,
not harmful.

Carried across under the Kwãnt method, the only two fields the live row lacked: **`menu_url`** and
**`menu_highlights`** (Stolen Apples: rum, gin, green apple juice, lapsang souchong, ginger,
shiso). I checked the menu URL resolves, 200, before storing it.

---

# 2. The duplicates with a live twin: 23 merged

You said 14; I found more, because "same name and same city" misses `Bar 878` against `878 Bar`
and `Cane and Table` against `Cane & Table`. Every one was then **confirmed by a matching
address**, not by name, before anything was deleted.

| Dead slug | 301s to | Dead slug | 301s to |
|---|---|---|---|
| 28-hongkong-street | 28-hong-kong-street | hanky-panky-cocktail-bar | hanky-panky |
| bar-878 | 878-bar | high-five | bar-high-five |
| bar-le-mal-necessaire | le-mal-necessaire | mother-cocktail-bar | mother |
| bar-les-ambassadeurs | les-ambassadeurs | nouveau-vague | bar-nouveau |
| cane-and-table | cane-table | rekabar | reka-bar |
| cloakroom | the-cloakroom | rita-cocktails | rita |
| customs-house-bar | customs-house-bar-sydney | selva | selva-oaxaca-cocktail-bar |
| dangerous-water | dangerous-water-palma-de-mallorca | the-7-jokers-cocktail-bar | the-7-jokers |
| dry-martini | dry-martini-by-javier-de-las-muelas | to-infinity-and-beyond | to-infinity-beyond |
| duck-and-cover-cocktailbar | duck-and-cover | viajante87 | viajante-87 |
| gucci-bar | gucci-giardino | **d-bespoke** | d-bespoke-singapore |
| | | **sastreria-martinez** | sastrer-a-martinez |

The last two are city contamination rather than spelling: each venue's own site lists **one**
location. D.Bespoke's row even carried its own diagnosis, and Sastrería Martínez's site shows only
Av. Mariscal La Mar 1263, Lima.

## Two rows would have lost an accolade

Accolades were merged **by union, not replace**. That mattered twice:

- **Selva** held North America's 50 Best **#43 2026**, and the live row had none.
- **Cloakroom** held North America's 50 Best **#56 2026**, and the live row had none.

Deleting either without the union would have destroyed a ranking. Both are now on the live rows.

## One thing I refused to carry

`rekabar`'s website is **`letsumai.com`**, which is a restaurant-reservation SaaS product page,
not the bar. The live `reka-bar` row has no website and is better off that way than with a wrong
one.

## One pair I did NOT merge

**`beaufort-bar` -> `the-american-bar` is not a duplicate.** Same hotel, same address, same
website domain, and **two different famous bars**. Its own description says *"The Savoy's second
bar"*, and the two rows point at different pages: `/beaufort-bar` against `/american-bar`.

This is the case your instruction anticipated: same address was strong evidence and not proof. It
goes into the classification below instead.

## A method note: "same coordinates" is worthless as evidence

My first pass used it and produced nonsense, pairing **Bar Agricole with ABV** and five different
Shanghai bars with Flair. The reason is the task 90 stacking: **13 city-centroid points cover 64
bars**, so a shared point says only that both rows fell back to the same city centre. I dropped
the test entirely rather than weight it.

---

# 3. Coa Shanghai: renamed, and it nearly disappeared

`coa-shanghai-1773995982` -> **`coa-shanghai`**, 301 added, no merge.

**A pre-existing rule sent `/bars/coa-shanghai` to `/bars/coa`**, written by someone who assumed
the Shanghai row was a Hong Kong duplicate. The moment the row took that slug, its live profile
would have 301'd to another city and the bar would have been unreachable.

**The redirect-chain test caught it**, and the rule is removed with the reason written in place.

I also have to report a process failure: my previous commit **pushed while that test was failing**,
because I piped vitest to `tail` and the `&&` chain then ran on tail's exit code instead of the
suite's. Fixed in the following commit, and the lesson is not to pipe a command whose exit code
gates the next step.

---

# 4. The remaining 72 inactive rows, classified. NOTHING WRITTEN.

After the 23 merges, 72 remain. **36 of them already carry the reason in their own description**,
written during an August sweep, which made this far more tractable than it looked.

**Your root cause is confirmed.** All 96 read `status: open` because `status` was added after
these rows were hidden and defaulted every existing row to open. The two markers were never set
together, so the contradiction is an artefact and not a second bug.

## Group A: closed. 18 rows.

Set `status` so both markers agree. **17 permanently, 1 temporarily.**

Dated and sourced in their own descriptions: **Bar Margaux** (Mar 2025, with The Everleigh),
**The Everleigh** (Mar 2025), **BlackTail** (Jan 2020), **Double Deuce Lounge** (late 2025),
**Dram Bar** (Denmark St, relocating to Dalston), **Frank Bar** (Dec 2021, with Maksoud Plaza),
**Hacha Agaveria** (25 Apr 2026), **NoMad Bar** (2021), **Peyotito Bar**, **The Grey Room** (May
2026), **The Hook** (Mar 2025), **Tropic City** (Apr 2026).

Marked closed but unverified, so I would confirm before writing: **Analogue Initiative**,
**Berlin Bar**, **Little Cooler**, **Oriental Elixir**, **The Honey Moon**.

**Temporarily closed:** **The Wise King**, Hong Kong, redirecting bookings to The Blind Spot with
no reopening date. That one wants `temporarily_closed`, not permanent, and under the existing
rule a temporarily closed bar stays active with a notice.

## Group B: city contamination or a bogus row. 23 rows.

Not bars we are hiding; rows that were never real at that address. Seventeen say so themselves:
**Anthology Bar** (the name belongs to a Singapore bar), **Bijoux** (a costume-jewellery boutique
since 1983), **CICA**, **Clap / Ongaku** (Dubai, not Bangkok), **ClubHouse**, **Goldfish by
Reynold**, **High Five Bar** (Bar High Five is Ginza), **Konbini** (Medellín), **Mas Por Favor**
(Las Vegas), **Mondo**, **N.Y.C Bar**, **Outlaw Lab**, **Paréa**, **Peek-a-Boo**, **Radio Bar**
(the row carried a Tirana address), **The Bar in Front of the Bar** (Athens, and No.2 Europe's 50
Best), **Victor Audio Bar** (Buenos Aires).

Six more show the same signature, an empty row whose live counterpart sits in a different city:
**Argo** Bergen (live: Hong Kong), **Mint Gun Club** London (live: Johannesburg), **Sip & Guzzle**
Melbourne (live: New York), **SpeakLow** New York (live: Speak Low, Shanghai), **Toast & Tonic**
Bengaluru (live: Mumbai), **Vault Bar** Brisbane (live: Berlin).

**These should be deleted, not merely hidden.** They are not history; they are import errors.

## Group C: excluded venue type. 2 rows. Leave inactive.

- **Onyx Coffee Lab**, Rogers, Arkansas: a coffee roaster.
- **Bow & Arrow Brewing Co.**, Albuquerque: a brewery.

Both entered because they hold a **James Beard Outstanding Bar 2026** award, which is exactly how
an accolade import pulls in a venue type we do not list. Leave them inactive, and the accolade
importer is the thing worth a guard.

## Group D: five more duplicates, ready for item-2 treatment on your word.

Missed by the first sweep because the city strings differ or the names do. **Each confirmed by an
identical address:**

| Dead | Live twin | Shared address |
|---|---|---|
| harry-s-bar [Paris] | harrys-new-york-bar | 5 Rue Daunou, 75002 |
| liz-cocktails-co [Rio] | liz-cocktail-e-wine | Rua Dias Ferreira 679A, Leblon |
| zapote-bar [Riviera Maya] | zapote-bar-playa-del-carmen | Carretera Federal Km 298, Solidaridad 77710 |
| library-bar-at-leela-palace [New Delhi] | the-library-bar | The Leela Palace, Chanakyapuri |
| punch-room-at-edition [Tokyo] | punch-room-tokyo | The Tokyo EDITION |

## Group E: hidden with no stated reason. 24 rows. The ones that need you.

Empty rows, mostly no address, no website, no description, created in the 20 March and 21 August
waves. Several are **real and well-known bars**, which is why this group cannot be swept:

> Tippling Club (Singapore) · Scout (London) · Bar Agricole (San Francisco) · Underdog (Austin) ·
> Nineteen80 (Singapore) · Café Pacifico (Paris) · Proclamation Jewellers (Dublin) ·
> Mostly Harmless (Hong Kong) · Cloak Bar (Cape Town) · Sugar Hall (London) · Boca Chica
> (Barcelona) · Bullard & Worth (Edinburgh) · The Bon Vivant's Companion (Edinburgh) · Hacha Bar
> (London) · Ars & Delecto (Shanghai) · The Odd Couple (Shanghai) · Atelier by Taste Buds
> (Shanghai) · ABSTRCT Bar (Jakarta) · Bar Marilou (New Orleans) · Margo (Moscow) · Re (Sydney) ·
> Srisawat (Bangkok) · Shōsin Art Club (Rio de Janeiro)

**Plus `beaufort-bar`**, which is a different case: a complete, well-written row for a genuinely
famous bar, hidden for no reason I can find.

My reading is that most of Group E is **not "hidden by mistake" but "never finished"**: stub rows
from a wave that were deactivated because they had no content, and a few, like Hacha Bar, look
like earlier spellings of rows now handled elsewhere. But that is a guess on 24 rows and each
needs its own check, so I am not acting on it.

**Beaufort Bar is the one I would reinstate first**, and it only needs your yes.

---

# What is live now

- 23 duplicate rows deleted, 23 301s added, two accolades rescued.
- Svanen is one row with the right coordinates and its menu.
- Coa Shanghai has a clean slug and is still reachable.
- PR #70 merged (`6d35424`) on your word.
- 413 tests pass; build clean.
