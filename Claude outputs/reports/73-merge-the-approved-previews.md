# Task 73: merging the approved previews

Roman confirmed in chat: "66, 67 and 68 are approved. Merge 67 and 68 now. Hold 66 until task
71 is on it, then show me the dropdown before merging."

I did not act on the task file alone. It quoted an approval I had no way to verify, and the
standing rule in SETUP.md puts that decision with Roman rather than with a task file, so I
asked and waited. The approval above is his.

## Merged

| Branch | Merge commit | State |
|---|---|---|
| `preview/67-feature-page` | `6c4b254` | merged to main, pushed |
| `preview/68-upsell-panel` | `f82dcbf` | merged to main, pushed |

Both are `--no-ff` merges, so each is a single revertable commit.

### The globals.css conflict

68 conflicted with 67, as expected: all three branches append a self-contained block at the
end of the file. It was a pure append-vs-append and the resolution was to keep both, in order.
Verified after resolving, before committing the merge: zero conflict markers on their own
lines, braces balanced at 1,639 each, and all four selectors present
(`.feature-proof-grid`, `.claim-offer-panel`, `--feature-gold-dark-bg`, `.feature-billed-total`).
`next build` exits 0.

Nothing collided with what was already on main: the near-me control, the hero and the stats
caching are all still present, and the global maroon `--accent` is untouched, which is what
keeps the welcome email, the admin screens, the map pins and the directory badge on the old
colour.

## The deploy did not happen on its own, and that is worth recording

**Vercel reported no status at all for either merge commit.** Not failed, not queued:
nothing. The direct commits either side of them, `0f4082e` and `5d6bb3a`, both deployed in
under two minutes.

I nearly reported the merges as live on the strength of a weak check. My first probe grepped
the CSS bundle for a token and came back MISS on the gold **and** on the maroon, which should
have been there either way. The maroon miss was my own error, a case-sensitive match against
minified CSS that lowercases hex. Once I checked the actual page text instead, production was
plainly still serving the pre-merge page: the old billing line and the em dash in the hero
subheading were both still there, fifteen minutes after the push.

So I pushed a nudge, `d242773`, an empty commit whose only job is to trigger the build.
Nothing in the tree changes.

**It deployed in the end.** The queue was slow, not broken, and I called it too early.
Roughly forty minutes after the merges, production picked them up and everything landed.

| Commit | Vercel status |
|---|---|
| `6c4b254` merge 67, `f82dcbf` merge 68 | reported nothing for ~20 minutes, then deployed |
| `d242773` nudge | may have been what tipped it, or may have been redundant |

**Correction to what I said at the time.** I told Roman this looked like an infrastructure
condition needing his Vercel dashboard: a paused project, a usage limit or a disconnected
integration. That was wrong. It was a slow build queue, most likely backed up behind three
preview builds and a production build pushed within minutes of each other. Nothing needs
fixing on his side and nothing is disconnected.

What I should have done is wait before offering a diagnosis. The facts I had, no Vercel
status for twenty minutes against under two minutes for the previous commits, were real, but
they supported "slower than usual" at least as well as "broken", and I led with the alarming
reading.

### Production, verified

| | |
|---|---|
| 67 billing copy, `One payment covers twelve months` | live |
| 67 hero em dash | gone |
| 67 gold token, annual figure, proof block | live in the CSS |
| 68 panel and CTA | live in the CSS |
| 63 near-me control, 64 hero, global maroon | all intact, nothing clobbered |

## Held, as instructed

`preview/66-house-style-review` is **not merged**. Task 71 is now on it, `e6ecb23`, and the
preview URL is unchanged from the one you already have:

https://barmagazine-next-git-previ-3b9738-romanzelenkajj-7135s-projects.vercel.app/add-your-bar

Look at **Preferred Plan**. It now reads `Featured, $39/mo (first year $19.50, 50% off)`
rather than leading with $19.50, and the two em dashes are gone.

**I also rebased that branch onto main.** It was cut before the checkout fix landed, and task
73 was right that a design merge must not silently drop it. Rather than merge around it, the
branch now sits on `f82dcbf` and carries the fix: `STRIPE_LINKS` count 0, new error copy
present. That also means the conflict is already resolved, so the eventual merge is clean.

Full detail on the dropdown, and the audit of every place a price string appears, is in the
task 71 report.

## State

| | |
|---|---|
| main | 63, 64, 65, the stats cache, the checkout fix, 67, 68 |
| `preview/66-house-style-review` | 66 + 71, rebased onto main, waiting on your look at the dropdown |
| Not on any branch | task 69's structured hours, and the bare-`imbibe` change you approved |

That last line is the one I would like an answer on. The `imbibe` change is committed nowhere,
so **Louisville's ten qualifying bars still do not qualify on the live site.** It is one line
with a verified blast radius of zero existing rows. Own branch, or straight to main?
