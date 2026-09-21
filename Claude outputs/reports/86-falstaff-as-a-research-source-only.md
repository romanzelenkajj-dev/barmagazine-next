# Task 86: Falstaff as a research source. Dry run, nothing inserted.

**No row has been created or changed except two description fixes**, which the task itself
required and which are explained in section 5. **Nothing is inserted without your go.**

---

# 1. The split: mine is 64 listed / 115 not

After dropping the 10 non-bar rows (9 `/restaurants/`, 1 `/spiritproducer/`), **179 bars** remain.

| | Listed | Not listed |
|---|---|---|
| **Mine, after hand-checking** | **64** | **115** |
| Yours | 67 | 112 |
| Mine on 20 September | 61 | 118 |

**My own earlier 61/118 was wrong too**, and I would not have caught it without redoing the
match: the directory changed underneath it. Between then and now I merged 28 duplicate rows,
deleted 22 contaminated ones and renamed several slugs, so a count taken on 20 September cannot
be compared with one taken today.

**Your threshold predictions all reproduce exactly**, which is the real cross-check:

| City | Yours | Mine |
|---|---|---|
| Munich | 0 to 9 | **0 to 9** |
| Cologne | 1 to 8 | **1 to 8** |
| Hamburg | 1 to 8 | **1 to 8** |
| Helsinki | 3 to 6 | **3 to 6** |
| Basel | 1 to 5 | **1 to 5** |
| Vienna | 6 to 13 | **6 to 13** |

Country split: **Germany 56, Switzerland 22, Austria 11** against your 55 / 22 / 11.

## The three rows that separate the counts, named

I reproduced the loose matcher exactly and ran it over my 115, which is the only honest way to
find where two counts diverge. It claims three of them are already listed. **All three are
wrong:**

| Falstaff row | The loose matcher claims | Why it is wrong |
|---|---|---|
| **Bar Cock** (Madrid) | Solange Cocktails (**Barcelona**) | different name, different city; it matched on country |
| **Bar Seibert** (Kassel) | Seiberts Bar (**Cologne**) | two different bars. Falstaff lists both |
| **Sky Bar & Restaurant** (Bratislava) | Sky Bar (Bratislava) | **the loose matcher was RIGHT and mine was wrong** |

Sky Bar was **my** false negative: my core-name test stripped "bar" and "restaurant" and left
"sky", three characters, below my own minimum length. Checked on Falstaff's page: Hviezdoslavovo
námestie 7, skybar.sk, identical to our row. **Counted as listed.**

So of the difference between 67 and 64, I can account for two as loose-matcher errors and one as
mine. The remaining gap is most likely the same effect in your run over a directory that has since
changed.

---

# 2. The hand-check: ten flagged, two were not matches

The task was right that the matcher needed watching. Ten rows matched on containment only:

**Eight are the same bar** and are counted as listed: Cadierbaren (the Swedish name of The Cadier
Bar at the Grand Hôtel), HIMKOK Storgata Destilleri, Le Hibou at Bank Hotel, Josef Cocktailbar,
Röda Huset Cocktailbar, Dry Martini Bar, Limonadier, and Bird Uptown.

**Two are not, and this is the Bloom trap firing correctly:**

- **Anonymous Shrink's Office** (Prague) is **not** our AnonymouS Bar. Two separate venues.
- **bird : downtown** (Copenhagen) is **not** our Bird. I checked Falstaff's own page for Bird
  Uptown: Gl. Kongevej, Frederiksberg, which is our row's exact address, and birdcph.dk calls
  itself "BIRD | FREDERIKSBERG". So **Bird Uptown is the one we hold and bird : downtown is a new
  admission candidate.**

## The near-duplicates you named

- **Two Eden Bars** (Zurich, Ascona): **we hold neither**, so nothing could mismatch.
- **Two Jahreszeiten Bars**: confirmed distinct on their own pages, Munich at Maximilianstraße 17
  (Kempinski) and Hamburg at Neuer Jungfernstieg 9-14 (Fairmont). **We hold neither.**
- **Woods Cologne**: Friesenstraße 49. Only the Cologne one is in the 93+ band; **we hold neither
  it nor the Seefeld one.**

None of them could have produced a false match, because we list none of them. That is worth
saying plainly rather than reporting "checked, fine".

---

# 3. The five threshold cities: VERIFIED counts, not candidate counts

I pulled each candidate's address and website from its Falstaff page, then went to **the venue's
own site**. A candidate counts as verified only when its own site answers.

| City | Now | Candidates | **Verified** | Held | Crosses 5? |
|---|---|---|---|---|---|
| **Munich** | 0 | 9 | **7** | 2 | **yes, 7** |
| **Cologne** | 1 | 7 | **5** | 2 | **yes, 6** |
| **Hamburg** | 1 | 7 | **4** | 3 | **yes, 5** |
| **Basel** | 1 | 4 | **4** | 0 | **yes, 5** |
| **Helsinki** | 3 | 3 | **2** | 1 | **yes, 5** |

**All five cross on verified rows alone.** Basel and Hamburg cross exactly, with no margin: one
failed verification either way and they do not.

## Verified (22)

**Munich** Les Fleurs du Mal · Schumann's Bar am Hofgarten · Jahreszeiten Bar Munich · Bar Montez ·
Call Soul Breaking Bar · Die Goldene Bar · Barroom München
**Cologne** Little Link · Suderman · Ona Mor · Woods Cologne · Friesenvierzig
**Hamburg** Puzzle Bar · Fontenay Bar · The Chug Club ("Tequila & Mezcal Bar Hamburg St. Pauli,
since 2015") · plus Jahreszeiten Bar on the Fairmont's address
**Basel** Bar Les Trois Rois · Das Werk 8 · Herz Cocktailbar · Baltazar
**Helsinki** Kupoli · Bardem

## Held (8), and why

**Falstaff lists no website for seven of them**: Zephyr (Munich), Toddy Tapper and Zest and Spice
(Cologne), COLLAB Bar, Martini Bar im Grill and Bā Nomu (Hamburg), The Firm (Helsinki). I have an
address for each but no channel of the venue's own, and the rule is to hold what I cannot verify.

**Falk's Bar** (Munich) is held for a different reason: its site is the hotel group's
`bayerischerhof.de`, which curl gets a 403 from and whose English homepage does not name the bar.
I could have guessed a deep URL and one I tried 404'd, so I stopped rather than invent a source.

Each of the eight needs one search against its own name. That is an hour, not a blocker, and I
will do it before any insert if you want them.

## Two same-address pairs, both legitimate

**Les Fleurs du Mal and Schumann's Bar am Hofgarten** are both Odeonsplatz 6-7 on schumanns.de,
and **Martini Bar im Grill and Jahreszeiten Bar** are both Neuer Jungfernstieg 9 at the Fairmont.
These are the Savoy pattern, two real bars in one building, not duplicates. Worth flagging now so
the address check does not reject them at insert time.

---

# 4. The Paradiso error, not copied

Falstaff files Paradiso as "Barcelona, **Puerto Rico**". We list it correctly as Barcelona, Spain,
and it is in my matched set, so the wrong country never enters anything.

---

# 5. "Falstaff" in user-facing output: IT WAS THERE, ON TWO LIVE PROFILES

You said to check before finishing rather than after. I did, and the check found something.

## Where I looked

1. **All of `src/`** (every rendered page, component, meta description, JSON-LD generator)
2. **`public/` and `next.config.mjs`**
3. **`src/lib/accolades.ts`** for an `org_key` or tile definition
4. **Every text column of `bars`**: `description`, `short_excerpt`, `name`, `admin_notes`,
   `status_note`, `opening_hours`, `specials`

## What it found

**Two live bar descriptions named Falstaff, one of them with its points**, and a description
renders on the profile page and in the meta description:

- **Seiberts Bar** (Cologne): *"The bar cites first place in the Falstaff Barguide 2025/26 with
  **98 points** and a Mixology Bar Awards 2025 Top 10 listing."*
- **Tür 7** (Vienna): *"It was named American Bar of the Year in the **Falstaff Bar Guide 2026**."*

Both predate this task, from when Falstaff was still being treated as an accolade.

**Both are fixed.** Seiberts keeps its Mixology Bar Awards line, which is a different award and was
never in scope. Tür 7 loses the claim outright, because Falstaff was its only source and a claim
we cannot attribute is better dropped than laundered. The writer refuses to save a replacement
that still contains the word, or the words "points" or "glasses".

**Re-checked afterwards: 0 rows in every text column.**

## One legitimate occurrence that stays

`src/lib/editorial-sources.ts` lists `'falstaff'` in `SELECTIVE_NAMES`, the set of guides that
select by their own standard. That is the mechanism that makes a Falstaff entry in
`editorial_sources` count toward a city's merit band, which is exactly the treatment you asked
for. I confirmed it never reaches a reader: `level2Reason` builds a `label` from the source name,
and **that label is computed and never rendered** — its callers read only `.rank`, for sorting.

**No `org_key: falstaff` exists and none was sketched.**

---

# 6. What I am asking for

Nothing is inserted. To proceed I need your go on:

1. **The 22 verified bars in the five threshold cities**, inserted with `editorial_sources` only,
   which would take Munich 0 to 7, Cologne 1 to 6, Hamburg 1 to 5, Basel 1 to 5, Helsinki 3 to 5.
2. Whether to spend the hour finding own-channel sources for **the 8 held**.
3. **The 64 matched rows**: appending the Falstaff URL to `editorial_sources` and nothing else.
4. The remaining **93 candidates** outside the threshold cities, which I have not verified yet.

Say which and I will dry-run the exact payloads before writing.
