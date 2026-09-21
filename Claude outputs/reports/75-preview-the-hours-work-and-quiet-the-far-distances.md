# Task 75: the hours work is on a preview, and far distances go quiet

## 1. Task 69 now exists somewhere you can reach

You were right and it was my fault. The hours input, the editable fields, the Archive button
and the structured-hours library were all sitting **uncommitted in a working tree**. I wrote a
report about work that existed nowhere you could click. There was nothing wrong with your
previews.

**`preview/69-structured-hours`**, commit `afce92e`, PR
[#65](https://github.com/romanzelenkajj-dev/barmagazine-next/pull/65).

It is branched from `preview/66-house-style-review`, because the review-screen work builds on
the description panel that lives there. So this one preview carries **66, 71 and 69 together**:
the house-style rewrite, the plan dropdown, the photo-hint em dash, and all of the hours work.

### What to open

| Page | What is new |
|---|---|
| `/add-your-bar` | **Opening hours**: seven day rows, an open and a close time each, a Closed toggle, a live "Will show as" line, and a "Copy Monday to every day" shortcut. There is nowhere to type a dash. |
| `/admin/submissions` | **Edit fields before approving**, covering every field, with a warning on characters we do not publish. |
| `/admin/owner-edits` | The new **Archive** button beside Approve and Reject. |

Fill a few day rows on `/add-your-bar` and watch the preview line build itself:
`Mon-Thu 16:00-01:00, Fri-Sat 16:00-02:00, Sun closed`. Past-midnight rows get a "next day"
badge rather than an error, which is the normal case for a bar.

### What this preview cannot show you, and why

**`scripts/structured-hours-migration.sql` has not been run, and I have not run it.** Until it
is, `bars.opening_hours_structured` and the two new `bar_submissions` columns do not exist.

So on the preview: the hours field renders, validates, groups days and generates the display
string correctly, and the form submits without error. What it cannot do is **store** the
structured value, because there is no column for it to land in. The generated string would go
through the normal `opening_hours` path. Nothing breaks and nothing is lost that you would
miss; you just cannot see the round trip until the migration runs.

**The admin submissions queue is empty.** You archived the Prophecy row by hand, and there are
no pending submissions at all: 7 approved, 1 rejected, 0 pending. So `/admin/submissions` will
show you an empty Pending tab and the edit panel has nothing to appear on.

I have not created one, because the only honest way to get a pending row is a real submission
against a real bar. If you want to see the panel, the clean way is to **submit the form on the
preview itself** with an obviously fake bar name, which creates a pending row you can then
reject or archive. That writes one throwaway row to `bar_submissions` and touches no bar. Say
the word and I will do it and clean up after, rather than deciding to on my own.

## 2. Distance on the card, only when it means something

On `preview/74-distance-units`, commit `b51ea70`.

**Preview:** https://barmagazine-next-git-previ-402a16-romanzelenkajj-7135s-projects.vercel.app/bars

The card shows a distance **under 30 in the visitor's own unit** and nothing beyond it. Taken
literally as you asked: 30 miles for a visitor on miles, 30 kilometres for a visitor on
kilometres, never one converted into the other. The unit and the threshold both come from a
single `usesImperial()` call, so they cannot disagree about who the visitor is.

### Against real data

**Bratislava, on kilometres.** Every card carries a distance. This is the case where the
feature earns its place.

| Card | Shows |
|---|---|
| Bukowski Bar | **0.4 km** |
| Mezcalli | **0.4 km** |
| Michalská Cocktail Room | **0.5 km** |
| The Half Blind Pig | **0.5 km** |
| Casa del Havana | **0.5 km** |
| NUDA Bar | **0.6 km** |

No banner. Nothing needs saying: the numbers speak.

**Carlsbad, on miles.** The San Diego cluster survives the cut and the rest goes quiet.

| Card | Shows |
|---|---|
| Raised by Wolves | **21 mi** |
| George's at the Cove | **22 mi** |
| The Whaling Bar | **22 mi** |
| Realm of the 52 Remedies | **25 mi** |
| Convoy Music Bar | **26 mi** |
| Polite Provisions and everything beyond | *(nothing)* |

No banner, because the nearest bar is inside the 40 km radius. 30 miles is a good line here:
it keeps everything genuinely drivable visible and drops the Los Angeles bars at 80 mi.

**Rural South Dakota, on miles.** No card shows anything, and the banner carries it once:

> The nearest bars we list are 343 mi away.

### One gap worth knowing about, which I have not changed

The card threshold is 30 in the visitor's unit; the banner fires only past the 40 km near-me
radius. Those are different lines, so there is a window where a visitor sees **neither**: a
metric visitor whose nearest bar is between 30 and 40 km away gets no distance on any card and
no banner either.

It is a narrow window and nobody is misled, they simply get less information. The fix would be
to fire the banner whenever no card shows a distance, which closes it exactly. You told me not
to move thresholds on my own, so I have not. Say if you want it.

## Guards

Card content and the threshold only. Ordering, distance bands and the 40 km radius are
untouched; this is display. `next build` exits 0 on both branches.

## The three previews open right now

| | Branch | Look at |
|---|---|---|
| **66 + 71** | `preview/66-house-style-review` | https://barmagazine-next-git-previ-3b9738-romanzelenkajj-7135s-projects.vercel.app/add-your-bar — the Preferred Plan dropdown |
| **69** | `preview/69-structured-hours` | PR #65, building; contains 66 and 71 as well |
| **74** | `preview/74-distance-units` | https://barmagazine-next-git-previ-402a16-romanzelenkajj-7135s-projects.vercel.app/bars — near-me |

Since 69 contains 66 and 71, the 69 preview is the one to look at if you want to judge all
three at once. Nothing is merged.
