# Task 99: runner resilience, batch 18, and the harvest

Parts 1 and 3 are applied on `main`. Part 2 is built and **not armed**, waiting on your eyeball.

---

# 1. Runner resilience: done, with 10 hours to spare

Three attempts, then 10 minutes, then 30. Applied to the armed Tuesday, Wednesday and
Thursday batch 17 runners **without re-arming them**: the plists invoke the runner by path, so
rewriting the file changes what fires and leaves the schedule alone. All three verified still
loaded, `runs = 0`, plists untouched from 18 September. Also folded into `arm-window.sh` so
every future window inherits it.

**ANY non-zero exit retries, not just a crash**, and that is the part worth explaining.
`send-upsell.mjs` runs a pre-flight that counts every slug it cannot resolve as "no email on
file". An unreachable Supabase resolves none of them, so the script exits 2 announcing a
malformed list when the list is perfect. An outage and a bad list are indistinguishable at the
point of failure.

**This is not theoretical, and I watched it happen tonight.** The first batch 18 dry run
reported six of eleven Asian bars as "not found or inactive" and refused to send. All six were
active with addresses on file. Same for three in Europe, and one window died mid-run with a
Cloudflare error page parsed as JSON. That is the crash you described, reproduced.

Retries are safe only because of the sent log: `send-upsell.mjs` appends each bar the moment
its mail is accepted and skips anything already recorded, so attempt 2 mails only what attempt
1 did not reach. Without that guard this loop would be a way to mail people three times.

Both paths tested with a stub before trusting them: fail-fail-fail logs a loud failure and
still deletes the plist (a spent one-shot left armed with a past date re-fires at next login,
which is the batch 14 incident); fail-then-succeed stops at attempt 2.

## One thing I found that you should know about

**The runner work was sitting on the preview branch, not on `main`.** The launchd job runs the
script from the working tree, so whatever branch is checked out at 06:30 Tuesday is what fires.
Had anyone checked out `main` before then, the retry would have vanished and the template would
have reverted to "1,200+". Cherry-picked onto `main`, and the working tree is left on `main`.

---

# 2. Batch 18: 62 bars, built, dry-run clean, NOT armed

## Your 131 was right, and finding out why mattered

My first count was 220. The gap was 88 bars: **the whole of the armed Tue/Wed/Thu batch 17**.
A batch is armed days before it fires and nothing is written to the sent log until mail is
accepted, so between arming and firing those bars are invisible to a sent-log check and turn up
as fresh candidates for the next batch.

The send-time duplicate guard would have caught it, so nobody would have been mailed twice. The
damage is quieter: the list you eyeballed would have been wrong, and the batch would have shrunk
by 88 on the night without anyone deciding it should. 220 minus 88 is 132, your 131 within one
(the one is the opted-out Mandarin Oriental address).

`scripts/outreach-candidates.mjs` now holds the single definition, and run with `--no-email` it
produces **769** for part 3, which is your number exactly.

## The eyeball took two passes, because the first one was wrong

132 candidates, **69 parked, 62 sendable** (19 Europe, 43 Americas).

My first pass compared each address to the bar's website and cleared anything on a matching
domain. That is exactly backwards for a hotel bar whose listed website **is** the group site:
`tajhotels.com` matching `tajhotels.com` read as "the venue's own domain". **24 group inboxes
cleared that check** and were caught only by listing every remaining domain instead.

Parked, all with reasons in `parked.txt`: Mandarin Oriental (5, on your existing decline),
Ritz-Carlton, Marriott, Hilton, Waldorf, St Regis, Taj, Leela, Kempinski, Raffles, Rosewood,
Rocco Forte, Capella, Edition, Bulgari, W, Four Points, Fairmont, Hyatt, Pestana, Tugu,
Sukhothai and others; the shared CH Projects inbox behind five San Diego bars; Alt Strategies;
four addresses belonging to a **different venue entirely** (Butcher and the Boar, Mootz Pizza,
Gold Palm, Town Hall Brewery); and Tan Tan's events desk on the crown-shy precedent.

Four I parked but would happily reverse: **Lyaness, Gold Bar, Gucci Giardino, La Commune**. Each
is a venue-named alias on a group domain rather than a general inbox. Parking is the safe
default, not a strong opinion.

## The dry run

Both windows clean, node exit 0, no refusals, no crashes, no missing addresses: **19 of 19 and
43 of 43**.

One bar held automatically: **The Wise King (Hong Kong)** is temporarily closed, and the send
script refuses to mail a closed bar. It was the only Asia candidate, so there is no Asia window.

Proposed windows, not armed: Europe Monday 00:30 PT (09:30 CEST), Americas Monday 06:30 PT
(09:30 ET). Say the word and I will arm them.

---

# 3. Harvest: 108 addresses stored

322 sites crawled across your eight countries, **120 venue addresses found, 108 stored**.

| Country | No email | Had a site | Address found | Yield |
|---|---|---|---|---|
| United States | 133 | 117 | 26 | 22% |
| Germany | 54 | 52 | 31 | **60%** |
| United Kingdom | 40 | 40 | 23 | 57% |
| India | 39 | 21 | 7 | 33% |
| Japan | 33 | 24 | 1 | **4%** |
| Italy | 33 | 20 | 7 | 35% |
| Spain | 30 | 20 | 6 | 30% |
| Canada | 29 | 28 | 19 | **68%** |
| **Total** | **391** | **322** | **120** | **37%** |

Stored after review: Germany 29, US 26, UK 23, Canada 18, Spain 5, India 4, Italy 2, Japan 1.

**Where the winning address came from**, which confirms what batch 10 found: form-recipient
config 57, page text 33, JSON-LD 16, **Cloudflare-obfuscated 14**. Structured data and form
config together beat everything else, and decoding `data-cfemail` alone rescued 14 bars a plain
regex would have missed.

## Why the United States is the worst of the eight

22% against Canada's 68% looked like a bug, so I checked rather than reported it. **67 of 117 US
sites returned a full page and yielded nothing.** They are not blocking the crawler: they return
200 with 30 to 300 KB of HTML and simply publish no address. Ticonderoga Club and La Mezca carry
`user@domain.com`, the CMS placeholder, and nothing else.

My first crawler only guessed paths. That was a real flaw, because the pages that carry an
address are named by the venue: `/private-events-chicago`, `/the-bamboo-room`. I added link
discovery and re-crawled all 215 bars that had yielded nothing. **It found 13 more.** So the
improvement was worth making and the conclusion still stands: these bars publish a contact form
and no address, exactly as batch 10 found.

Japan at 4% of 24 is a harder version of the same thing.

## The classifier was not safe to store on its own

Reading the 120 before writing them caught, in a list the code had labelled "venue":

- **seven group inboxes** sitting on the domain the bar lists as its own website: Oberoi (a
  general manager, at the wrong property, on two different bars), The Fontenay, Monument Hotel,
  Narrow Group, and Farmily Group's `backdoor43@` alias on two more bars
- `neri.fante@gmail.**con**`, an invalid top-level domain, a typo on the venue's own site
- `resume@olivebarandkitchen.com`, a recruitment mailbox
- `info@santacocktailclub.com` claimed by two different bars

The seven are parked with reasons. **Five are held for you**, not stored and not parked:
Suderman (`06info@`, which looks like a phone number glued to `info@`), Mad Souls & Spirits (the
.con typo, fixable by hand), Monkey Bar (recruitment), and the two Santa Cocktail Club rows.

Nothing was overwritten: the writer skips any row that already has an address. Candidates with
an address went from 63 to 171, which is 63 + 108 exactly.

## What is left of the 769

**447 of the 769 are untouched**: the 378 outside your eight countries, and 236 bars with no
website at all, which are the Instagram pass. Batch 10 got **one** address from 34 Instagram
bios, so I would not expect much; say if you want it run anyway.

---

# Also done

**The send template said "1,200+ of the world's best cocktail bars"** in both the HTML and the
plain-text alternative. Both now say 1,600+, changed before Tuesday's armed send rather than
after it. One correction: the directory has **1,646** active bars, not 1,642.

---

# Not done, deliberately

Batch 18 is not armed and nothing has been sent. The five held harvest addresses are not stored.

---

# Round two (2026-09-21 evening)

## PR #73 merged

Conflicted on `outreach/parked.txt` first, because the outreach commits existed twice: once
cherry-picked onto `main` and once on the branch. Resolved by taking main's side, re-verified
(450 tests, 832 pages), then merged.

## Batch 18 armed: 64 will send, not 66

The four are unparked with the reason written into `parked.txt`, as that file requires.

**Two of them still will not send, and it is not parked.txt.** `gold-bar` and `gucci-giardino`
match `CORPORATE_DOMAINS` in `send-upsell.mjs`, a separate hard guard marked "partner track,
not blasted (no bypass)". `editionhotels` and `gucci` were added to it by the Europe wave 1
screen. I left it alone: it encodes partner relationships, it is explicitly no-bypass, and
widening it quietly to satisfy a parked.txt decision is exactly the kind of thing it exists to
stop. **Lyaness and La Commune do send.**

**Gold Bar is in Tokyo**, which fits neither window. I put it in the Europe window, where it
would have gone out at 22:30 JST, which is at least open hours for a bar. Moot while the
corporate guard holds it.

| Window | Bars | Fires |
|---|---|---|
| batch18-europe | 21 | Mon 2026-09-28 06:30 PT (15:30 CEST) |
| batch18-americas | 43 | Mon 2026-09-28 09:00 PT (12:00 ET) |

Both armed with the retry runner, verified loaded, `runs = 0`. Dry run clean, node exit 0.

One observation, not a change: 06:30 PT puts Europe at 15:30 local, where the batch 17 Europe
window used 00:30 PT for a 09:30 CEST landing. Armed as instructed.

## The five held addresses

| Bar | Address | What it actually is | Done |
|---|---|---|---|
| **Suderman** (Cologne) | `06info@sudermanbar.de` | **My bug, not their typo.** The Impressum carries BOTH `06info@` and a clean `info@sudermanbar.de`; a phone digit was glued to the front and my picker chose the wrong one of the two. | **Stored** `info@sudermanbar.de`, and the picker now prefers the shorter address at equal source rank |
| **Mad Souls & Spirits** (Florence) | `neri.fante@gmail.con` | **Their typo, twice, in their own JSON-LD.** `.con` is not a top-level domain. `.com` is near-certain but it is still me inventing an address, and a wrong guess mails a stranger. | **Held.** Say the word and I will store the `.com` |
| **Santa Cocktail Club** (Florence) | `info@santacocktailclub.com` | The operator's single inbox, from the privacy page. | **Held.** Recommend storing on Florence only |
| **Santa Cocktail Club** (Venice) | `info@santacocktailclub.com` | Same inbox as Florence. Storing both mails one person twice in a batch. | **Held.** Recommend leaving without an address |
| **Monkey Bar** (New Delhi) | `resume@olivebarandkitchen.com` | A recruitment inbox, found on the operator's `/career.html`. Same class as press@ and events@. | **Parked** |

## Harvest pass 2: the 378 outside the eight countries

**211 had a website. 71 venue addresses found, 69 stored, 18 bars parked.**

| | |
|---|---|
| Outside the eight | 378 |
| Had a site to crawl | 211 |
| Venue address found | 71 (34%) |
| Stored | 69 |
| Parked as group inboxes | 18 |
| No website at all | 167 |

Stored, top countries: Switzerland 17, Australia 9, Austria 7, South Africa 5, UAE 5, Hong Kong
4, Denmark 3, then ones and twos across 14 more.

**`guest.historian@fourseasons.com` was the only published address for EIGHT different Four
Seasons bars** (Avra, Caprice, Nautilus, Bar Trigona, Fifty Mils, One-Ninety, Charles H, BKK
Social Club). One global corporate alias standing in for eight venues on four continents is the
clearest evidence yet that a hotel bar page frequently carries no address of its own.

Two fixes, both from reading the list rather than trusting the labels:

- **`.co` is Colombia's top-level domain, not a typo.** My "suspect TLD" check flagged El Barón
  (Cartagena) and Nautilus. Both rescued and stored.
- The shorter of two addresses wins at equal source rank, which is the Suderman fix above.

## Batch 19: built, dry-run, NOT armed

179 candidates: **Europe 105, Americas 49, Asia 25**. One excluded automatically as temporarily
closed, so **178 would send**. Dry run clean on all three windows, node exit 0, no refusals, no
crashes, no missing addresses.

Not armed. No batch 19 launchd agent exists.

## Skipped as instructed

The Instagram pass. 167 bars outside the eight countries have no website at all and stay
unreachable.
