# Task 60: addresses for this week's bars, and four batches staged

**Nothing was sent. Nothing is armed.** Four slug files are written and four commands are
below, waiting on your go and your choice of days.

## The headline number

**175 of this week's 242 bars are now contactable.** 54 of those were emailed in batch 16
this morning, which leaves **121 staged** for next week.

## 1. Closing the 76

| | |
|---|---|
| Addresses found | **34** |
| Still unreachable | **40** |
| Parked as PR-agency-fronted | **2** |

### Where they came from

**33 of the 34 came from the bar's own website. Instagram produced one.**

That is the finding worth keeping. All three researchers read Instagram bios logged out
and it worked technically, including through age gates, but the bios carry a phone number,
a WhatsApp link or a Linktree instead of an address. Five Linktrees were opened and none
held an email.

Inside the website bucket, the productive place was **not the contact page**, which is now
almost always a bare form. Addresses came from:

- the site's own structured data, `LocalBusiness` or `Organization` JSON-LD, and
  contact-form recipient config, which alone produced seven of harvest 1's fifteen
- private-events, press, FAQ, careers and accessibility pages
- privacy and legal notices, which name a data controller

A plain contact-page scrape would have missed roughly half of them.

One technique is worth building into the standard pass: **Cloudflare email obfuscation**
hides real addresses from a plain regex. `rest@angrymonk.rs` exists on the page only as a
hex `data-cfemail` value. Decoding it and re-scanning also surfaced Zuma Hong Kong.

### Why 40 stay unreachable

Form-only contact pages with no address anywhere on the domain, bios carrying a phone or a
booking link only, and a handful of sites that could not be read at all. `lilithbudapest.hu`
returns SERVFAIL from every client, so that venue has no readable site. Per the task, none
of these were guessed at: no `info@` was invented from a domain.

### The 2 parked

Both publish only a PR agency inbox, which the standing rule parks rather than emails.
Pony & Plume is a third: its press is handled by the agency Companion Communications, but
since the venue publishes no inbox of its own it was recorded as unreachable rather than
parked.

## 2. Checking the 166

Every staged slug was audited twice: once by the staging script and once independently
against the written files, which is what a send would actually read.

```
staged total: 121 | distinct: 121
clean: every staged slug passes sent, parked, optout, owner, status and shared-inbox checks
```

No bar had claimed its profile since listing. No two bars in the pool share an inbox.

**5 dropped as corporate or chain inboxes**, including two whose addresses were found only
today: `round-robin-bar` (ihg.com) and `chandelier-bar` (fourseasons.com).

## 3. The four batches

Sizes are not exactly equal, and that is deliberate. Each region is split across **its own
two days**, never across all four. An earlier version dealt one even size to all four days
and topped up the smallest with leftovers, which put Polish bars in the Thursday Americas
batch: sent at 09:30 ET they would land at 15:30 in Warsaw, which is the single thing this
split exists to prevent. Even days were the wrong thing to optimise.

| Day | Date | Region | Bars | Lands local | PT |
|---|---|---|---|---|---|
| Monday | 21 Sep | Europe | 32 | 09:30 CET | 00:30 |
| Tuesday | 22 Sep | Americas | 29 | 09:30 ET | 06:30 |
| Wednesday | 23 Sep | Europe | 31 | 09:30 CET | 00:30 |
| Thursday | 24 Sep | Americas | 29 | 09:30 ET | 06:30 |

Countries: United States 58, Poland 15, Slovakia 14, Czech Republic 9, Hungary 7, France 6,
Serbia 4, Croatia 2, India 2, Singapore 2, China 1, Hong Kong 1.

### The commands

Run **only on your go**. Times are PT, which is what `arm-window.sh` takes.

```bash
cd /Users/romanzelenka/barmagazine-next
outreach/arm-window.sh batch17-monday    w1 09 21 00 30 outreach/batch17-monday.slugs
outreach/arm-window.sh batch17-tuesday   w1 09 22 06 30 outreach/batch17-tuesday.slugs
outreach/arm-window.sh batch17-wednesday w1 09 23 00 30 outreach/batch17-wednesday.slugs
outreach/arm-window.sh batch17-thursday  w1 09 24 06 30 outreach/batch17-thursday.slugs
```

## Three things that need your decision

### a. 17 parked bars now have an address

The harvest found addresses for 17 bars sitting in `parked.txt`. The guard correctly
excluded all 17, because parked is checked before email. But several were parked *because*
nothing was published, and that reason is now factually wrong. Un-parking is editorial,
needs a changelog line, and turns directly into a send, so it is yours to call.

**The reason it was parked is now wrong (4):**

| Slug | Parked as | Found today |
|---|---|---|
| `wolf-tree` | nothing published | `max@wolftreevt.com`, mailto on its own private-hire page |
| `garagiste` | wine club inbox only | `admin@garagistelv.com`, in its own JSON-LD and the form recipient, repeated on five pages |
| `damn-i-miss-paris` | forms only | `hello@damnimissparis.com`, management address on its own accessibility page |
| `ayahuasca-cantina` | nothing published | `info@xamancafe.com`, in JSON-LD on the Ayahuasca page; Ayahuasca is Xamán Café's cantina |

**Borderline, own domain but a departmental or operator inbox (4):** `viridian` (pr@ on its
own press page), `techo` (operator Mi Madre's, and Techo has no site of its own),
`bittersweet` (a named hiring inbox from a recruitment post), `aldo-sohm-wine-bar`
(`office@le-bernardin.com`, the group office, found only in a site-wide privacy notice).

**Stays parked, today's find is the very inbox it was parked for (9):** `starlite-sf` and
`crown-shy` (events@, exactly as recorded), `horn-cantle-saloon`, `the-manor-bar`,
`shipwreck-bar`, `pufferfish`, `the-cruise-room`, `the-sazerac-bar`, `aft-cocktail-deck`
(the last is a named Wynn employee's work address).

### b. Six Asia bars land in the afternoon

Singapore 2, India 2, China 1, Hong Kong 1 all sit in Monday's Europe batch. At 09:30 CET
that is 13:00 in Pune and 15:30 in Singapore. For a bar an early-afternoon email is not
obviously worse than a morning one, so this may be fine as is. If you want them in a real
local morning, they need their own window at 00:30 CET, which is 15:30 PT the previous day.

### c. One bar looks closed

**Qora (Pune)** should be verified before it is emailed. Its Instagram keeps 10.1K followers
but shows **zero posts**, and third-party directories flag the Koregaon Park venue as closed.
The venue's own channels do not say so, which is why it was not marked closed.

Two that are **not** closures but worth knowing: **Paasha (Pune)** is shut for renovation
until 25 November per JW Marriott's own dining page, and **YORU (Kraków)** posted a holiday
notice for 12 to 20 September.

## Note on the shared scratchpad

Harvest 1 reported that a scratch script it had written, `ig.py`, changed on disk underneath
it. The cause is mundane and not a security event: three researchers ran concurrently in one
shared scratchpad and two independently wrote an Instagram fetcher to the same obvious
filename. I read the file; it is a plain meta-description reader with no network or
instruction changes. Worth giving future parallel agents distinct filenames.
