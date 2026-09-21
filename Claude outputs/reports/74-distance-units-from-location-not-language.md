# Task 74: distance units from location, not browser language

On `preview/74-distance-units`, commit `935b76f`, PR
[#64](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/64). **Not merged.**

The preview URL was not posted by the Vercel check within the four minutes I waited. Builds
were queueing badly earlier this session, so it is probably still in line rather than failed.
Read it off PR #64 when it appears, or ask me and I will fetch it. **Look at** `/bars`, turn
on **Near me**, and check the unit on the cards.

## How it renders, before and after

| Visitor | Browser language | Before | After |
|---|---|---|---|
| United States | en-US | 2.1 mi | 2.1 mi |
| United Kingdom | en-GB | 2.1 mi | 2.1 mi |
| **Slovakia, US English browser** | en-US | **2.1 mi** | **3.4 km** |
| Slovakia, Slovak browser | sk-SK | 3.4 km | 3.4 km |
| Japan | ja-JP | 3.4 km | 3.4 km |
| No region subtag | de | 3.4 km | 3.4 km |
| No navigator at all (SSR) | none | **2.1 mi** | **3.4 km** |

The third row is the case you described. The unit now comes from `geoCountryCode`, the
visitor's country from their IP, which is the same signal the near-me ordering already sorts
on, so the two can no longer disagree.

Two smaller faults in the same three lines, both fixed:

- The fallback was `'en-US'`, so anything without a `navigator` resolved to **miles**. The
  default is now kilometres.
- A browser reporting plain `en` or `de` produced an empty region and reached kilometres **by
  accident**. Now it reaches them by rule.

The imperial set is unchanged: US, GB, LR, MM.

Both call sites pass the country. The card takes it as a prop rather than relying on a
default, so there is no call site left on the old behaviour.

## The banner

Removed, as you asked. The one line that survives is the beyond-the-radius notice, and it is
reworded to carry only the fact the cards cannot:

> The nearest bars we list are 340 km away.

It appears only when nothing is within the radius, and says nothing at all when there are bars
genuinely nearby. The near-me control itself still shows the mode is on and gives the way out.

## What else reads `navigator.language`

You asked me to look and change nothing. Two things worth knowing, neither touched.

**The currency is fine.** `resolveCurrencyForRequest` reads the `geo_currency` cookie and
falls back to the `x-vercel-ip-country` header. It never looks at language, so
`/feature-your-bar` was already doing what this task is asking the distances to do.

**One real inconsistency, in the same file I just edited.** `BarDirectoryMap.tsx:1021` calls
`totalBars.toLocaleString()` with **no locale argument**, so the thousands separator follows
the browser: a German visitor sees `1.506+` where everyone else sees `1,506+`. Every other
call site on the site pins `'en-US'` explicitly, so this one is the odd one out rather than a
deliberate choice. It is a one-word fix and it is a display inconsistency rather than a
correctness bug, so I left it for you to say.

Three admin screens call `new Date(...).toLocaleString()` with no locale, so dates render in
the admin's own browser format. That is arguably correct for an admin tool and I would leave
it.

## Guards

Display only. The near-me ordering, the distance bands and the 80 km radius are untouched, and
the only strings that change are the unit on the card and the one banner line. `next build`
exits 0; the only warnings in the file are the pre-existing `<img>` ones.

The now-unused `.dir-near-note` CSS rule is still in `globals.css`. Removing dead CSS moves
nothing, but the guard said the unit string only, so I left it rather than widen the diff. Say
if you would rather it went.

## Correction to my last report

I told you the merges of 67 and 68 needed your Vercel dashboard, and named a paused project, a
usage limit or a disconnected integration as likely causes. **That was wrong, and I said it too
early.** The queue was slow, not broken. Roughly forty minutes after the merges, production
picked them up on its own.

Verified live now: the new billing copy, the hero em dash gone, the gold token, the annual
figure, the proof block, and 68's panel and CTA, with the near-me control, the hero and the
global maroon all still intact.

The facts I had were real, twenty minutes of no Vercel status against under two minutes for
the commits before, but they supported "slower than usual" at least as well as "broken", and I
led with the alarming reading instead of waiting. Nothing needs fixing on your side.
