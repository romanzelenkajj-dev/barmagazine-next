# Task 76: the banner has no threshold of its own

On `preview/74-distance-units`, commit `94f82cb`. **Not merged.**

Same preview as tasks 74 and 75, so the whole near-me behaviour is visible in one place:
https://barmagazine-next-git-previ-402a16-romanzelenkajj-7135s-projects.vercel.app/bars

This is the gap I flagged at the end of the task 75 report and did not close, because the
instruction then was not to move thresholds on my own. Closing it properly turned out to be
better than moving either number.

## What changed

The banner no longer has a threshold. It is **derived from the card rule**: it speaks exactly
when no card can show a distance, and stays silent when any card can.

```
noCardShowsDistance = no nearest bar
                   || no precise location
                   || the nearest bar is past the card threshold
```

The list is distance-ordered, so if the nearest bar cannot show a distance then none of them
can. One number decides both halves and the banner is its complement.

**`NEAR_LIMIT_KM` is deleted.** It was the competing threshold, and leaving it sitting there
unused is how the gap would come back: the next person tuning either number would find two
constants and pick one. The near-me bands still use 40 for ordering, which is a different job
and stays.

## The three cases

Measured against the live directory.

**Bars inside the threshold. Bratislava, on kilometres.**

| | |
|---|---|
| Nearest | 0.4 km, Bukowski Bar |
| Cards | 0.4 km, 0.4 km, 0.5 km, 0.5 km, 0.5 km |
| Banner | **silent** |

**The nearest bar just outside it. 45 km north of Bratislava, on kilometres.** This is the
case that had nothing to say before.

| | |
|---|---|
| Nearest | 45 km, Bukowski Bar |
| Cards | none show a distance |
| Banner | **"The nearest bars we list are 45 km away."** |

Before this change that visitor saw a list of bars, no distance on any card, and no
explanation: 45 km is past the 30 km card threshold but inside the 40 km banner threshold, so
both stayed quiet.

**Nothing for hundreds of miles. Rural South Dakota, on miles.**

| | |
|---|---|
| Nearest | 343 mi, Volstead's Emporium |
| Cards | none show a distance |
| Banner | **"The nearest bars we list are 343 mi away."** |

In all three, exactly one of the cards and the banner is doing the talking. That is now
structural rather than a coincidence of two numbers agreeing.

## Everything from task 75 stands

30 in the visitor's own unit, miles or kilometres rather than a converted figure. One
`usesImperial()` call deciding both the unit and the threshold. Ordering, the distance bands
and the near-me radius all untouched. `next build` exits 0, and the unused-constant warning I
would have introduced by leaving `NEAR_LIMIT_KM` behind does not appear.

## The near-me branch now carries four commits

| | |
|---|---|
| `935b76f` | distances follow the visitor's country, not browser language |
| `01fa24f` | the directory bar count pinned to en-US |
| `b51ea70` | a distance on the card only under 30 in the visitor's unit |
| `94f82cb` | the banner derived from the cards, no threshold of its own |

Worth looking at as one behaviour rather than four changes: turn **Near me** on and watch what
the cards and the banner do together.
